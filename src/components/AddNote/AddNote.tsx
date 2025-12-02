"use client";

import React, { useEffect, useRef, useState } from "react";

import clsx from "clsx";
import { ParagraphNode, TextNode, $getRoot } from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";

import { Tip } from "@/shared/ui/components/Tip/Tip";
import { tipText, tipTitle } from "./lib/tipConfig";
import { PLACEHOLDER } from "./lib/styleConfig";

import css from "./AddNote.module.scss";

interface AddNoteProps {
  id: number;
  x?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
  active: boolean;
  onRemove?: (id: number) => void;
}

const editorConfig = (initialText = "") => ({
  namespace: `WB.AddNote.${Math.random().toString(36).slice(2)}`,
  nodes: [ParagraphNode, TextNode],
  editorState: () => {
    const p = new ParagraphNode();
    p.append(new TextNode(initialText));
    return p;
  },
  onError(error: Error) {
    throw error;
  },
});

function InnerEditor({
  editorRef,
  onType,
}: {
  editorRef: React.RefObject<any>;
  onType: () => void;
}) {
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

    const unregister = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const text = $getRoot().getTextContent();
        if (text.trim().length > 0) {
          onType();
        }
      });
    });

    return () => {
      editorRef.current = null;
      unregister();
    };
  }, [editor, editorRef, onType]);

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

export const AddNote: React.FC<AddNoteProps> = ({
  id,
  x,
  y,
  className,
  style,
  active,
  onRemove,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<any>(null);
  const [tipVisible, setTipVisible] = useState(false);

  useEffect(() => {
    setTipVisible(true);

    const timeout = setTimeout(() => setTipVisible(false), 30_000);
    return () => clearTimeout(timeout);
  }, []);

  const handleTyping = () => setTipVisible(false);

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
    const root = rootRef.current;

    if (!root) return;
    if (!active) return;

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (root.contains(target)) return;
      if (target.closest("[data-no-deactivate]")) return;

      const text = editorRef.current?.getText?.() ?? "";

      if (!text) {
        onRemove?.(id);
      }
    };

    window.addEventListener("mousedown", handleGlobalClick);
    return () => window.removeEventListener("mousedown", handleGlobalClick);
  }, []);

  return (
    <div
      className={clsx(css.add_note_block, className)}
      data-id={id}
      ref={rootRef}
      style={{
        top: y,
        left: x,
        ...style,
      }}
    >
      <Tip
        className={clsx(
          css.add_note_tooltip,
          tipVisible ? css.tip_show : css.tip_hide
        )}
        title={tipTitle}
        text={tipText}
      />

      <LexicalComposer initialConfig={editorConfig("")}>
        <div className={css.note_block}>
          <div className={css.editor_inner}>
            <RichTextPlugin
              contentEditable={
                <InnerEditor editorRef={editorRef} onType={handleTyping} />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            {active && <AutoFocusPlugin />}
          </div>
        </div>
      </LexicalComposer>

      <div className={css.divider} />

      <div className={css.image_block}></div>
    </div>
  );
};
