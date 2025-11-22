"use client";

import React from "react";

import { motion } from "motion/react";

import clsx from "clsx";

import { Folders } from "@/widgets/Folders/Folder";
import { LeftSideBar } from "@/widgets/LeftSideBar/LeftSideBar";
import { ComposerBar } from "@/widgets/ComposerBar/ComposerBar";
import { ActionBar } from "@/widgets/ActionBar/ActionBar";

import { WhiteboardFrame } from "@/components/WhiteboardFrame/WhiteboardFrame";

import { mockData } from "@/shared/data/mockData";

import css from "./Wrapper.module.scss";

export type WrapperProps = {
  className?: string;
};

const leftsideImage = "/images/LeftSideBar.png";
const ComposerImage = "/images/Composer.png";

export const Wrapper: React.FC<WrapperProps> = ({ className }) => {
  const images = mockData.images;

  return (
    <div className={clsx(css.wrapper, className)}>
      <div className={css.leftside_div}>
        <motion.div
          initial={{ x: -50, opacity: 0, filter: "blur(10px)" }}
          animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <LeftSideBar srcImage={leftsideImage} />
        </motion.div>
      </div>

      <div className={css.composer_bar_div}>
        <motion.div
          initial={{ y: 50, opacity: 0, filter: "blur(10px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <ComposerBar srcImage={ComposerImage} />
        </motion.div>
      </div>

      <div className={css.action_bar_div}>
        <motion.div
          initial={{ y: -50, opacity: 0, filter: "blur(10px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          transition={{
            delay: 2,
            duration: 0.8,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <ActionBar />
        </motion.div>
      </div>

      <div className={css.folders_div}>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 2.2,
            duration: 0.8,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <Folders folderName="/Favorites" />
        </motion.div>
      </div>

      <motion.div
        className={css.whiteboard_div}
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{
          duration: 0.8,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        <WhiteboardFrame frames={images}/>
      </motion.div>
    </div>
  );
};
