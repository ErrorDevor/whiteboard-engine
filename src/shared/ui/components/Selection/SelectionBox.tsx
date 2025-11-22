"use client";

import React from "react";
import clsx from "clsx";

import css from "./SelectionBox.module.scss";

export type SelectionBoxProps = {
  className?: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export const SelectionBox: React.FC<SelectionBoxProps> = ({
  className,
  x,
  y,
  width,
  height,
}) => {
  return (
    <rect
      className={clsx(css.selection_box, className)}
      x={x}
      y={y}
      width={width}
      height={height}
      rx={4}
      pointerEvents="none"
    />
  );
};
