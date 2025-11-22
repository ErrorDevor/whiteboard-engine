"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import clsx from "clsx";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import {
  FONT_STYLES,
  INITIAL_COLOR,
  INITIAL_FONT_SIZE,
} from "./lib/toolbarConfig";
import Image from "@/shared/ui/base/Image";
import { Dropdown } from "@/widgets/Dropdown/Dropdown";

import css from "./Toolbar.module.scss";

export type ToolbarProps = {
  className?: string;
};

export const Toolbar: React.FC<ToolbarProps> = ({ className }) => {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [color, setColor] = useState(INITIAL_COLOR);
  const [fontSize, setFontSize] = useState(INITIAL_FONT_SIZE);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [fontStyleLabel, setFontStyleLabel] = useState(
    FONT_STYLES.find((s) => s.size === fontSize)?.label || "Body Text"
  );

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(
          () => {
            $updateToolbar();
          },
          { editor }
        );
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          $updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, $updateToolbar]);

  return (
    <div className={clsx(css.toolbar, className)} ref={toolbarRef}>
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
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
          }}
          className={clsx(css.decoration_button, isBold && css.active)}
        >
          <Image.Default
            src="/icons/text-bold.svg"
            className={css.decor_icon}
          />
        </button>

        <button
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
          }}
          className={clsx(css.decoration_button, isItalic && css.active)}
        >
          <Image.Default
            src="/icons/text-italic.svg"
            className={css.decor_icon}
          />
        </button>

        <button
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
          }}
          className={clsx(css.decoration_button, isUnderline && css.active)}
        >
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
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
          }}
          className={css.align_button}
        >
          <Image.Default
            src="/icons/textalign-left.svg"
            className={css.align_icon}
          />
        </button>
        <button
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
          }}
          className={css.align_button}
        >
          <Image.Default
            src="/icons/textalign-center.svg"
            className={css.align_icon}
          />
        </button>

        <button
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
          }}
          className={css.align_button}
        >
          <Image.Default
            src="/icons/textalign-right.svg"
            className={css.align_icon}
          />
        </button>
      </div>
    </div>
  );
};
