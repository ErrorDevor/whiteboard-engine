"use client";

import React, { useRef, useState, useEffect } from "react";

import clsx from "clsx";
import { useDragFrame } from "@/utils/hooks";
import { Frame } from "@/shared/ui/components/Frame/Frame";
import { whiteboardState, useUiState } from "@/utils/store";

import css from "./FrameGroup.module.scss";

interface FrameGroupProps {
  className?: string;
  id: string;
  x: number;
  y: number;
  src?: string;
  scale?: number;
  selectedIds?: string[];
  onMeasured?: (id: string, height: number) => void;
  selectOne?: (id: string) => void;
  toggleSelect?: (id: string) => void;
}

export const FrameGroup: React.FC<FrameGroupProps> = ({
  className,
  id,
  x,
  y,
  src,
  scale = 1,
  selectedIds,
  onMeasured,
  selectOne,
  toggleSelect,
}) => {
  const gRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const state = whiteboardState.getState();
    if (!state.framePositions[id]) {
      state.setFramePosition(id, { x, y });
    }
  }, [id, x, y]);

  const pos = whiteboardState((s) => s.framePositions[id] ?? { x, y });

  const maxWidth = 400;
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: maxWidth,
    height: maxWidth,
  });

  const [spacePressed, setSpacePressed] = useState(false);
  const sizeInitialized = useRef(false);

  const isPanning = whiteboardState((s) => s.isPanning);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) =>
      e.code === "Space" && setSpacePressed(true);
    const onKeyUp = (e: KeyboardEvent) =>
      e.code === "Space" && setSpacePressed(false);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // useDragFrame({ id, scale, selectedIds });

  return (
    <g
      className={clsx(css.frame_group, className)}
      ref={gRef}
      id={id}
      transform={`translate(${pos.x},${pos.y})`}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (isPanning || spacePressed || e.button === 1) return;
        if (e.ctrlKey || e.metaKey) toggleSelect?.(id);
        else selectOne?.(id);
      }}
    >
      {src && (
        <foreignObject x={0} y={0} width={size.width} height={size.height}>
          <Frame
            src={src}
            onLoaded={(imgWidth, imgHeight) => {
              const s = Math.min(1, maxWidth / imgWidth);
              const newWidth = imgWidth * s;
              const newHeight = imgHeight * s;

              setSize({ width: newWidth, height: newHeight });
              onMeasured?.(id, newHeight);

              sizeInitialized.current = true;
            }}
          />
        </foreignObject>
      )}

      <rect
        className={clsx(css.frame_rect, {
          [css.overlay]: selectedIds?.includes(id),
        })}
        fill="none"
        vectorEffect="non-scaling-stroke"
        rx={6}
        width={size.width}
        height={size.height}
        pointerEvents="none"
      />
    </g>
  );
};
