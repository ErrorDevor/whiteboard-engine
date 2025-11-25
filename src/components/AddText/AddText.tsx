"use client";

import React, { useEffect, useRef, useState } from "react";

import clsx from "clsx";
import { Toolbar } from "@/shared/ui/components/Toolbar/Toolbar";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import {
  $isTextNode,
  DOMConversionMap,
  DOMExportOutput,
  DOMExportOutputMap,
  isHTMLElement,
  Klass,
  LexicalEditor,
  LexicalNode,
  ParagraphNode,
  TextNode,
} from "lexical";
import { ListNode, ListItemNode } from "@lexical/list";

import {
  parseAllowedColor,
  parseAllowedFontSize,
  PLACEHOLDER,
} from "./lib/styleConfig";
import { whiteboardState } from "@/utils/store";

import css from "./AddText.module.scss";

interface AddTextProps {
  className?: string;
  style?: React.CSSProperties;
  id: number;
  x?: number;
  y?: number;
  isEmpty: boolean;
  onTextEmptyChange?: (isEmpty: boolean, localText: string) => void;
  activeTextId: number | null;
  setActiveTextId: React.Dispatch<React.SetStateAction<number | null>>;
}

const removeStylesExportDOM = (
  editor: LexicalEditor,
  target: LexicalNode
): DOMExportOutput => {
  const output = target.exportDOM(editor);
  if (output && isHTMLElement(output.element)) {
    for (const el of [
      output.element,
      ...output.element.querySelectorAll("[style],[class]"),
    ]) {
      el.removeAttribute("class");
      el.removeAttribute("style");
    }
  }
  return output;
};

const exportMap: DOMExportOutputMap = new Map<
  Klass<LexicalNode>,
  (editor: LexicalEditor, target: LexicalNode) => DOMExportOutput
>([
  [ParagraphNode, removeStylesExportDOM],
  [TextNode, removeStylesExportDOM],
]);

const getExtraStyles = (element: HTMLElement): string => {
  let extraStyles = "";
  const fontSize = parseAllowedFontSize(element.style.fontSize);
  const backgroundColor = parseAllowedColor(element.style.backgroundColor);
  const color = parseAllowedColor(element.style.color);
  if (fontSize !== "" && fontSize !== "16px") {
    extraStyles += `font-size: ${fontSize};`;
  }
  if (backgroundColor !== "" && backgroundColor !== "rgb(255, 255, 255)") {
    extraStyles += `background-color: ${backgroundColor};`;
  }
  if (color !== "" && color !== "rgb(17, 49, 93)") {
    extraStyles += `color: ${color};`;
  }
  return extraStyles;
};

const constructImportMap = (): DOMConversionMap => {
  const importMap: DOMConversionMap = {};
  for (const [tag, fn] of Object.entries(TextNode.importDOM() || {})) {
    importMap[tag] = (importNode) => {
      const importer = fn(importNode);
      if (!importer) {
        return null;
      }
      return {
        ...importer,
        conversion: (element) => {
          const output = importer.conversion(element);
          if (
            output === null ||
            output.forChild === undefined ||
            output.after !== undefined ||
            output.node !== null
          ) {
            return output;
          }
          const extraStyles = getExtraStyles(element);
          if (extraStyles) {
            const { forChild } = output;
            return {
              ...output,
              forChild: (child, parent) => {
                const textNode = forChild(child, parent);
                if ($isTextNode(textNode)) {
                  textNode.setStyle(textNode.getStyle() + extraStyles);
                }
                return textNode;
              },
            };
          }
          return output;
        },
      };
    };
  }

  return importMap;
};

const editorConfig = {
  html: {
    export: exportMap,
    import: constructImportMap(),
  },
  namespace: "React.js Demo",
  nodes: [ParagraphNode, TextNode, ListNode, ListItemNode],
  editorState: () => {
    const paragraph = new ParagraphNode();
    paragraph.append(new TextNode(""));
    return paragraph;
  },
  onError(error: Error) {
    throw error;
  },
};

const TextStateWatcher: React.FC<{
  onChange?: (empty: boolean) => void;
  onText?: (text: string) => void;
}> = ({ onChange, onText }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        // root DOM element (встроенный метод — безопасно для plain text)
        const root = editor.getRootElement();
        const textContent = root?.textContent ?? "";
        const isEmpty = textContent.trim() === "";

        onChange?.(isEmpty);
        onText?.(textContent);
      });
    });

    return () => {
      unregister();
    };
  }, [editor, onChange, onText]);

  return null;
};

export const AddText: React.FC<AddTextProps> = ({
  className,
  style,
  id,
  x,
  y,
  isEmpty,
  onTextEmptyChange,
  activeTextId,
  setActiveTextId,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const isActive = activeTextId === id;
  const applied = !isEmpty && !isActive;

  const updateTextBlock = whiteboardState((s) => s.updateTextBlock);
  const getTextBlock = whiteboardState((s) => s.getTextBlock);
  const [localText, setLocalText] = useState<string>("");

  useEffect(() => {
    const tb = getTextBlock(String(id));
    if (tb) setLocalText(tb.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      data-add-text={id ?? true}
      className={clsx(css.text_block, className, {
        filled: !isEmpty,
      })}
      style={{
        top: y,
        left: x,
        ...style,
        pointerEvents: "auto",
      }}
      onMouseDown={() => setActiveTextId(id)}
    >
      <LexicalComposer initialConfig={editorConfig}>
        <TextStateWatcher
          onChange={(empty) => onTextEmptyChange?.(empty, localText)}
          onText={(text) => setLocalText(text)}
        />

        <div
          className={clsx(css.editor_container, {
            [css.applied]: applied,
          })}
        >
          <Toolbar
            className={clsx(css.toolbar_plugin, { [css.hidden]: applied })}
          />

          <div className={css.editor_inner}>
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className={clsx(css.editor_input, {
                    [css.readonly]: applied,
                  })}
                  readOnly={applied}
                  aria-placeholder={PLACEHOLDER}
                  placeholder={
                    <div className={css.editor_placeholder}>{PLACEHOLDER}</div>
                  }
                  onBlur={() => {
                    try {
                      updateTextBlock(String(id), { text: localText });
                      onTextEmptyChange?.(localText.trim() === "", localText);
                      console.log("AddText onBlur: saving", { id, localText });
                    } catch (err) {
                      console.error(
                        "AddText: updateTextBlock failed on blur",
                        err
                      );
                    }
                  }}
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            {!applied && <AutoFocusPlugin />}
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
};
