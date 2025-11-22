"use client";

import React from "react";

import clsx from "clsx";
import Image from "@/shared/ui/base/Image";

import css from "./LeftSideBar.module.scss";

interface LeftSideBarProps {
  className?: string;
  srcImage: string;
}

export const LeftSideBar: React.FC<LeftSideBarProps> = ({ className, srcImage }) => {
  return (
    <div className={clsx(css.leftsidebar, className)}>
      <Image.Default src={srcImage} className={css.image} alt="sidebar image"/>
    </div>
  );
};
