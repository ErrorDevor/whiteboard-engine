"use client";

import React from "react";

import clsx from "clsx";

import css from "./Button.module.scss";

export type ButtonProps = {
  href?: string;
  disabled?: boolean;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;

export const Button: React.FC<ButtonProps> = ({
  className,
  children,
  href,
  disabled,
  ...props
}) => {
  return (
    <div
      className={clsx(css.button, className)}
      {...(props as any)}
      disabled={disabled}
    >
      {children}
    </div>
  );
};
