"use client";

import React from "react";

import clsx from "clsx";

import css from "./Tip.module.scss";

interface TipProps {
  className?: string;
  title?: string;
  text?: string;
}

export const Tip: React.FC<TipProps> = ({
  className,
  title,
  text,
}) => {
  return (
    <div className={clsx(css.tip_block, className)}>
      <h5>{title}</h5>

      <p>{text}</p>
    </div>
  );
};
