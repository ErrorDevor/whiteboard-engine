"use client";

import React from "react";

import clsx from "clsx";
import Image from "@/shared/ui/base/Image";
import { useUiState } from "@/utils/store/uiState";

import css from "./ActionBar.module.scss";

interface ActionBarProps {
  className?: string;
}

const leftIconsArray = [
  "/icons/add-note.svg",
  "/icons/stickynote.svg",
  "/icons/message.svg",
  "/icons/text.svg",
  "/icons/received.svg",
];

const rightIconsArray = [
  "/icons/heart-slash.svg",
  "/icons/folder-add.svg",
  // "/icons/gallery-add.svg",
];

export const ActionBar: React.FC<ActionBarProps> = ({ className }) => {
  const selectedId = useUiState((s) => s.selectedId);
  const activeTool = useUiState((s) => s.activeTool);
  const setActiveTool = useUiState((s) => s.setActiveTool);

  const isSelected = Boolean(selectedId);

  return (
    <div className={clsx(css.action_bar, className)}>
      <div className={css.inner_wrapper}>
        <ul className={css.left_side}>
          {leftIconsArray.map((icon, index) => (
            <li
              key={index}
              className={clsx(
                css.icon_block,
                activeTool === index && css.active_icon
              )}
              onClick={() => {
                setActiveTool(index);

                if (index === 2) {
                  useUiState.getState().setIsAddingNote(true);
                } else {
                  useUiState.getState().setIsAddingNote(false);
                }

                if (index === 3) {
                  useUiState.getState().setIsAddingText(true);
                } else {
                  useUiState.getState().setIsAddingText(false);
                }
              }}
            >
              <Image.Default src={icon} className={css.icons_image} />
            </li>
          ))}
        </ul>

        <div
          className={clsx(
            css.divider,
            isSelected ? css.show_divider : css.hide_divider
          )}
        />

        <ul
          className={clsx(
            css.right_side,
            isSelected ? css.show_right : css.hide_right
          )}
        >
          {rightIconsArray.map((icons, index) => (
            <li key={index} className={css.icon_block}>
              <Image.Default src={icons} className={css.icons_image} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
