"use client";

import React from "react";

import clsx from "clsx";

import css from "./CursorIcon.module.scss";

export type CursorIconProps = {
  className?: string;
  iconSrc?: string;
  style?: React.CSSProperties;
};

export const CursorIcon: React.FC<CursorIconProps> = ({
  className,
  iconSrc,
  style,
}) => {
  return (
    <img
      className={clsx(css.cursor_img, className)}
      src={iconSrc}
      alt="add text cursor"
      style={{
        ...style,
      }}
    />
  );
};
