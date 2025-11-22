"use client";

import { useState, useRef, useEffect } from "react";

import clsx from "clsx";
import type { LexicalEditor } from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $getRoot, $createParagraphNode, $createTextNode } from "lexical";

import Image from "@/shared/ui/base/Image";
import { Dropdown } from "@/widgets/Dropdown/Dropdown";

import css from "./TextBlock.module.scss";

export interface TextBlockData {
  id: number;
  x: number;
  y: number;
  text: string;
  fontSize?: number;
  color?: string;
  align?: "left" | "center" | "right";
  bold?: boolean;
  italic?: boolean;
  isEditing?: boolean;
}

interface TextBlockProps {
  block: TextBlockData;
  onFinish: (data: TextBlockData) => void;
  style?: React.CSSProperties;
  autoFocus?: boolean;
  onRequestClose?: () => void;
}

const FONT_STYLES = [
  { label: "Heading 1", size: 48 },
  { label: "Heading 2", size: 32 },
  { label: "Heading 3", size: 24 },
  { label: "Body Text", size: 16 },
];

export const TextBlock: React.FC<TextBlockProps> = ({
  block,
  onFinish,
  style,
  autoFocus = false,
  onRequestClose,
}) => {
  const [text, setText] = useState(block.text);
  const [fontSize, setFontSize] = useState(block.fontSize || 16);
  const [color, setColor] = useState(block.color || "#000000");
  const [align, setAlign] = useState(block.align || "left");
  const [bold, setBold] = useState(block.bold || false);
  const [italic, setItalic] = useState(block.italic || false);

  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [fontStyleLabel, setFontStyleLabel] = useState(
    FONT_STYLES.find((s) => s.size === fontSize)?.label || "Body Text"
  );

  const editorRef = useRef<LexicalEditor | null>(null);

  const handleBlur = () => {
    if (!text.trim()) {
      onFinish({ ...block, text: "" });
      onRequestClose?.();
      return;
    }

    onFinish({
      ...block,
      text,
      fontSize,
      color,
      align,
      bold,
      italic,
    });
  };

  useEffect(() => {
    if (!autoFocus) return;
    const t = setTimeout(() => {
      editorRef.current?.focus();
    }, 30);
    return () => clearTimeout(t);
  }, [autoFocus]);

  return (
    <div
      className={css.text_block}
      style={{
        position: "absolute",
        top: block.y,
        left: block.x,
        ...style,
      }}
    >
      <div className={css.toolbar}>
        <div className={clsx(css.mini_panel, css.text_color_panel)}>
          <div
            className={clsx(css.font_size_input, isDropdownOpen && css.open)}
            onClick={() => setDropdownOpen((v) => !v)}
          >
            <p>{fontStyleLabel}</p>
            <Image.Default
              src="/icons/small-white-arrow-down.svg"
              className={css.arrow_icon}
            />
          </div>

          <Dropdown
            className={css.choose_size_dropdown}
            isOpen={isDropdownOpen}
            onClose={() => setDropdownOpen(false)}
          >
            <ol className={css.dropdown_content}>
              {FONT_STYLES.map((item) => (
                <li
                  key={item.label}
                  className={css.dropdown_item}
                  onClick={() => {
                    setFontStyleLabel(item.label);
                    setFontSize(item.size);
                    setDropdownOpen(false);
                  }}
                >
                  <p>{item.label}</p>
                  <div className={css.size_block}>
                    <p className={css.item_size}>{item.size}px</p>
                    <Image.Default
                      src="/icons/round-done.svg"
                      className={css.icon_done}
                      style={{
                        opacity: item.label === fontStyleLabel ? 1 : 0,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ol>
          </Dropdown>

          <div className={css.color_input}>
            <Image.Default src="/icons/cape.svg" className={css.icon_cape} />
            <p>Color</p>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className={css.hidden_color_input}
            />
          </div>
        </div>

        <div className={clsx(css.mini_panel, css.text_decoration_panel)}>
          <button
            onClick={() => setBold((v) => !v)}
            className={clsx(css.decoration_button, bold && css.active)}
          >
            <Image.Default
              src="/icons/text-bold.svg"
              className={css.decor_icon}
            />
          </button>

          <button
            onClick={() => setItalic((v) => !v)}
            className={clsx(css.decoration_button, italic && css.active)}
          >
            <Image.Default
              src="/icons/text-italic.svg"
              className={css.decor_icon}
            />
          </button>

          <button className={css.decoration_button}>
            <Image.Default
              src="/icons/text-underline.svg"
              className={css.decor_icon}
            />
          </button>

          <button className={css.decoration_button}>
            <Image.Default
              src="/icons/paperclip.svg"
              className={css.decor_icon}
            />
          </button>

          <button className={css.decoration_button}>
            <Image.Default
              src="/icons/text-block.svg"
              className={css.decor_icon}
            />
          </button>

          <button className={css.decoration_button}>
            <Image.Default
              src="/icons/font-list.svg"
              className={css.decor_icon}
            />
          </button>

          <button className={css.decoration_button}>
            <Image.Default
              src="/icons/font-list-2.svg"
              className={css.decor_icon}
            />
          </button>
        </div>

        <div className={clsx(css.mini_panel, css.text_alignment_panel)}>
          <button
            onClick={() => setAlign("left")}
            className={clsx(css.align_button, align === "left" && css.active)}
          >
            <Image.Default
              src="/icons/textalign-left.svg"
              className={css.align_icon}
            />
          </button>
          <button
            onClick={() => setAlign("center")}
            className={clsx(css.align_button, align === "center" && css.active)}
          >
            <Image.Default
              src="/icons/textalign-center.svg"
              className={css.align_icon}
            />
          </button>
          <button
            onClick={() => setAlign("right")}
            className={clsx(css.align_button, align === "right" && css.active)}
          >
            <Image.Default
              src="/icons/textalign-right.svg"
              className={css.align_icon}
            />
          </button>
        </div>
      </div>

      <div className={css.editor_container}>
        <LexicalComposer
          initialConfig={{
            namespace: `text-${block.id}`,
            theme: {},
            onError: console.error,
            editorState: () => {
              const root = $getRoot();
              const paragraph = $createParagraphNode();
              paragraph.append($createTextNode(block.text || ""));
              root.append(paragraph);
            },
          }}
        >
          <OnChangePlugin
            onChange={(editorState) =>
              editorState.read(() => {
                const json = editorState.toJSON();
                const raw = json.root?.children
                  ?.map((c: any) => c.text || "")
                  .join("\n");
                setText(raw || "");
              })
            }
          />
          <ContentEditable
            className={css.content_editable}
            onBlur={handleBlur}
            autoFocus={autoFocus}
            onKeyDown={(e) => {
              if (e.key === "Escape" && !text.trim()) onRequestClose?.();
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                (e.target as HTMLElement).blur();
              }
            }}
          />
        </LexicalComposer>
      </div>
    </div>
  );
};
