"use client";

import React from "react";
import clsx from "clsx";
import { useImageLoader } from "./lib/useImageLoader";

import css from "./Frame.module.scss";

interface FrameProps {
  src?: string | null;
  className?: string;
  onLoad?: () => void;
  onLoaded?: (width: number, height: number) => void;
  minDelayMs?: number;
  maxWaitMs?: number;
}

export const Frame: React.FC<FrameProps> = ({
  src,
  className,
  onLoad,
  onLoaded,
  minDelayMs = 2000,
  maxWaitMs = 2000,
}) => {
  if (!src) {
    return (
      <div className={clsx(css.frame, className)}>
        <div className={css.loaderContainer} aria-hidden>
          <div className={css.loader} />
        </div>
      </div>
    );
  }

  const { showImage, handleNativeLoad, handleNativeError } = useImageLoader(
    src,
    minDelayMs,
    maxWaitMs,
    onLoad
  );

  return (
    <div className={clsx(css.frame, className)}>
      {!showImage && (
        <div className={css.loaderContainer} aria-hidden>
          <div className={css.loader} />
        </div>
      )}

      <img
        src={src}
        alt=""
        className={clsx(css.image, { [css.visible]: showImage })}
        draggable={false}
        onLoad={(e) => {
          handleNativeLoad();
          if (onLoaded && showImage) {
            const img = e.currentTarget as HTMLImageElement;
            onLoaded(img.naturalWidth, img.naturalHeight);
          }
          const imgEl = e.currentTarget;
          if (onLoaded) onLoaded(imgEl.naturalWidth, imgEl.naturalHeight);
        }}
        onError={handleNativeError}
        style={{
          userSelect: "none",
          pointerEvents: showImage ? "auto" : "none",
          opacity: showImage ? 1 : 0,
          transition: "opacity 0.15s ease, transform 0.15s ease-in-out",
        }}
      />
    </div>
  );
};
