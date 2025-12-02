"use client";

import React, { useEffect, useRef } from "react";
import clsx from "clsx";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ParagraphNode, TextNode, $getRoot } from "lexical";
import { ListNode, ListItemNode } from "@lexical/list";

import { PLACEHOLDER } from "./lib/styleConfig";
import { Toolbar } from "@/shared/ui/components/Toolbar/Toolbar";
import css from "./AddText.module.scss";

interface AddTextProps {
  id: number;
  x?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
  active: boolean;
  onActivate: (id: number) => void;
  onDeactivate: (id: number) => void;
  onRemove?: (id: number) => void;
}

const editorConfig = (initialText = "") => ({
  namespace: `WB.AddText.${Math.random().toString(36).slice(2)}`,
  nodes: [ParagraphNode, TextNode, ListNode, ListItemNode],
  editorState: () => {
    const p = new ParagraphNode();
    p.append(new TextNode(initialText));
    return p;
  },
  onError(error: Error) {
    throw error;
  },
});

function InnerEditor({ editorRef }: { editorRef: React.RefObject<any> }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editorRef.current = {
      editor,
      getText: () => {
        let text = "";
        editor.getEditorState().read(() => {
          text = $getRoot().getTextContent().trim();
        });
        return text;
      },
    };

    return () => {
      editorRef.current = null;
    };
  }, [editor, editorRef]);

  return (
    <ContentEditable
      className={css.editor_input}
      aria-placeholder={PLACEHOLDER}
      placeholder={<div className={css.editor_placeholder}>{PLACEHOLDER}</div>}
      readOnly={false}
      data-editor-input="true"
    />
  );
}

export const AddText: React.FC<AddTextProps> = ({
  id,
  x,
  y,
  className,
  style,
  active,
  onActivate,
  onDeactivate,
  onRemove,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault();
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  useEffect(() => {
    if (!active) return;
    const root = rootRef.current;
    if (!root) return;

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (root.contains(target)) return;
      if (target.closest("[data-no-deactivate]")) return;

      const text = editorRef.current?.getText?.() ?? "";

      if (!text) {
        onRemove?.(id);
      } else {
        onDeactivate(id);
      }
    };

    window.addEventListener("mousedown", handleGlobalClick);
    return () => window.removeEventListener("mousedown", handleGlobalClick);
  }, [active, onDeactivate, onRemove, id]);

  return (
    <div
      ref={rootRef}
      data-text-block
      data-id={id}
      className={clsx(css.text_block, className)}
      style={{
        top: y,
        left: x,
        position: "absolute",
        zIndex: 9999,
        ...style,
      }}
      onMouseDown={() => onActivate(id)}
    >
      <LexicalComposer initialConfig={editorConfig("")}>
        <div className={clsx(css.editor_container, { [css.hidden]: !active })}>
          <div data-no-deactivate>
            <Toolbar
              className={clsx(css.toolbar_plugin, {
                [css.hidden]: !active,
              })}
            />
          </div>

          <div className={css.editor_inner}>
            <RichTextPlugin
              contentEditable={<InnerEditor editorRef={editorRef} />}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            {active && <AutoFocusPlugin />}
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
};
