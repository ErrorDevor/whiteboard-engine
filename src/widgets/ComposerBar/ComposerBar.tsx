"use client";

import React from "react";

import clsx from "clsx";
import Image from "@/shared/ui/base/Image";

import css from "./ComposerBar.module.scss";

interface ComposerBarProps {
  className?: string;
  srcImage?: string;
}

export const ComposerBar: React.FC<ComposerBarProps> = ({
  className,
  srcImage,
}) => {
  return (
    <div className={clsx(css.composer_bar, className)}>
      <div className={css.wrapper}>
        <Image.Default
          src={srcImage}
          className={css.composer_image}
          alt="sidebar image"
        />
      </div>
    </div>
  );
};
