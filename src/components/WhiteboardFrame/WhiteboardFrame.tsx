"use client";

import React, { useRef, useState, useEffect } from "react";
import { FrameGroup } from "../FrameGroup/FrameGroup";
import { Grid } from "../Grid/Grid";
import { SelectionBox } from "@/shared/ui/components/Selection/SelectionBox";
import { AddText } from "../AddText/AddText";
import { CursorIcon } from "@/shared/ui/ui-kit/CursorIcon/CursorIcon";

import {
  usePanScale,
  useSelect,
  useCursor,
  useSelectionBox,
} from "@/utils/hooks";
import { whiteboardState, useUiState } from "@/utils/store";

import css from "./WhiteboardFrame.module.scss";

export interface TextBlock {
  id: number;
  x: number;
  y: number;
  isEmpty: boolean;
}

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

  const { setGrab, setGrabbing, setDefault } = useCursor(svgRef);
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

  const isAddingText = useUiState((s) => s.isAddingText);
  const setIsAddingText = useUiState((s) => s.setIsAddingText);
  const { icon, position, showIcon, hideIcon } = useCursor(svgRef);
  const { setActiveTool } = useUiState();
  const [texts, setTexts] = useState<TextBlock[]>([]);
  const [activeTextId, setActiveTextId] = useState<number | null>(null);

  useEffect(() => {
    const state = whiteboardState.getState();
    setPan(state.pan);
    setScale(state.zoom);
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

  const clickAddText = (e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
    e.stopPropagation();
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / scale;
    const y = (e.clientY - rect.top - pan.y) / scale;
    const id = Date.now();
    const newBlock = { id, x, y, isEmpty: true };

    whiteboardState.getState().updateTextBlock(String(id), {
      text: "",
      x,
      y,
      isEmpty: true,
    });

    setTexts((prev) => [...prev, newBlock]);
    setActiveTextId(id);

    setTimeout(() => {
      const sel = document.querySelector(
        `[data-add-text="${id}"] [data-editor-input="true"]`
      ) as HTMLElement | null;
      if (sel) {
        try {
          sel.focus();
        } catch (e) {}
      }
      setTimeout(() => {
        const sel2 = document.querySelector(
          `[data-add-text="${id}"] [data-editor-input="true"]`
        ) as HTMLElement | null;
        if (sel2) {
          try {
            sel2.focus();
          } catch (e) {}
        }
      }, 50);
    }, 0);

    setIsAddingText(false);
    setActiveTool(0);
  };

  const clickRemoveBlock = (id: number) => {
    setTexts((prev) => prev.filter((t) => t.id !== id));

    try {
      whiteboardState.getState().removeTextBlock(String(id));
    } catch (e) {}
    if (activeTextId === id) setActiveTextId(null);
  };

  const clickActivateTextBlock = (e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      setActiveTextId(null);
    }
  };

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
          if (e.target === svgRef.current) clickActivateTextBlock(e);

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

        {isAddingText && svgRef.current && (
          <rect
            x={0}
            y={0}
            width={svgRef.current.clientWidth}
            height={svgRef.current.clientHeight}
            fill="rgba(0,0,0,0)"
            pointerEvents="all"
            onClick={clickAddText}
          />
        )}
      </svg>

      {texts.map((t) => {
        const data = whiteboardState.getState().getTextBlock(String(t.id));

        return (
          <AddText
            key={t.id}
            id={t.id}
            x={(data?.x ?? t.x) * scale + pan.x}
            y={(data?.y ?? t.y) * scale + pan.y}
            onRemove={clickRemoveBlock}
            active={activeTextId === t.id}
            onActivate={(id) => setActiveTextId(id)}
            onDeactivate={(id) => {
              setActiveTextId((cur) => {
                const next = cur === id ? null : cur;
                return next;
              });
            }}
          />
        );
      })}

      {icon && position && (
        <CursorIcon
          iconSrc={icon.src}
          style={{
            left: position.x + (icon.offsetX || 0),
            top: position.y - (icon.offsetY || 0),
          }}
        />
      )}
    </div>
  );
};
