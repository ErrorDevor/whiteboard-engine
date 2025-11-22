"use client";

import React, { useRef, useState, useEffect } from "react";

import { FrameGroup } from "../FrameGroup/FrameGroup";
import { Grid } from "../Grid/Grid";
import { CursorIcon } from "@/shared/ui/ui-kit/CursorIcon/CursorIcon";
import { SelectionBox } from "@/shared/ui/components/Selection/SelectionBox";
import { AddText } from "../AddText/AddText";
import {
  usePanScale,
  useSelect,
  useCursor,
  useSelectionBox,
} from "@/utils/hooks";
import { whiteboardState, useUiState } from "@/utils/store";

import css from "./WhiteboardFrame.module.scss";

interface FrameData {
  id: string;
  src: string;
  width: number;
  height: number;
}

interface WhiteboardFrameProps {
  frames?: string[];
}

export const WhiteboardFrame: React.FC<WhiteboardFrameProps> = ({
  frames = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const {
    icon,
    position,
    setGrab,
    setGrabbing,
    setDefault,
    showIcon,
    hideIcon,
  } = useCursor(svgRef);

  const isAddingText = useUiState((s) => s.isAddingText);
  const { setSelectedId } = useUiState();
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [mounted, setMounted] = useState(false);
  const frameObjects: FrameData[] = frames.map((src, i) => ({
    id: `frame-${i + 1}`,
    src,
    width: 200,
    height: 200,
  }));
  const { clearSelection } = useSelect();
  const { selectionBox, onMouseDown, onMouseMove, onMouseUp } = useSelectionBox(
    {
      getFrameRects: () =>
        frameObjects.map((f) => {
          const el = document.getElementById(f.id);
          const rect = el
            ? el.getBoundingClientRect()
            : new DOMRect(0, 0, f.width, f.height);
          return { id: f.id, rect };
        }),
    }
  );

  useEffect(() => {
    setPan(whiteboardState.getState().pan);
    setScale(whiteboardState.getState().zoom);
    setMounted(true);
  }, []);

  const handleSetPan = (newPan: { x: number; y: number }) => {
    setPan(newPan);
    whiteboardState.getState().setPan(newPan);
  };

  const handleSetScale = (newScale: number) => {
    setScale(newScale);
    whiteboardState.getState().setZoom(newScale);
  };

  usePanScale({
    svgRef,
    pan,
    setPan: handleSetPan,
    scale,
    setScale: handleSetScale,
    minScale: 0.05,
    maxScale: 8,
    cursor: { setGrab, setGrabbing, setDefault },
  });

  const canvasTransform = `translate(${pan.x}px, ${pan.y}px) scale(${scale})`;
  const style = {
    userSelect: "none" as const,
    touchAction: "none" as const,
    backgroundImage:
      "radial-gradient(rgba(17,49,93,0.18) 0.15rem, transparent 0.15rem)",
    backgroundSize: "24px 24px",
  };

  useEffect(() => {
    if (isAddingText) showIcon("/icons/add-text-cursor.svg");
    else hideIcon();
  }, [isAddingText, showIcon, hideIcon]);

  return (
    <div className={css.whiteboard_wrapper} ref={containerRef}>
      <svg
        ref={svgRef}
        className={css.whiteboard}
        xmlns="http://www.w3.org/2000/svg"
        id="diagram"
        tabIndex={0}
        style={style}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onClick={(e) => {
          if (e.target === svgRef.current && e.button !== 1) {
            clearSelection();
            setSelectedId(null);
          }
        }}
      >
        {mounted && (
          <g
            id="canvas"
            style={{ transform: canvasTransform }}
            transform={canvasTransform}
          >
            <Grid>
              {frameObjects.map((f) => (
                <FrameGroup
                  key={f.id}
                  id={f.id}
                  x={0}
                  y={0}
                  scale={scale}
                  src={f.src}
                />
              ))}
            </Grid>
          </g>
        )}

        {selectionBox.visible && (
          <SelectionBox
            x={selectionBox.x}
            y={selectionBox.y}
            width={selectionBox.width}
            height={selectionBox.height}
          />
        )}
      </svg>

      <div className={css.text_layer} id="text_canvas">
        <AddText x={200} y={300} />

        {icon && (
          <CursorIcon
            iconSrc={icon.src}
            style={{
              left: position.x + (icon.offsetX || 0),
              top: position.y - (icon.offsetY || 0),
            }}
          />
        )}
      </div>
    </div>
  );
};
