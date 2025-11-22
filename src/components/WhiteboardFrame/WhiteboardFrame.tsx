"use client";

import React, { useRef, useState, useEffect } from "react";

import { FrameGroup } from "../FrameGroup/FrameGroup";
import { Grid } from "../Grid/Grid";
import { TextBlock, TextBlockData } from "../TextBlock/TextBlock";
import { CursorIcon } from "@/shared/ui/ui-kit/CursorIcon/CursorIcon";
import { SelectionBox } from "@/shared/ui/components/Selection/SelectionBox";
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

  const [textBlocks, setTextBlocks] = useState<TextBlockData[]>([]);
  const isAddingText = useUiState((s) => s.isAddingText);
  const setIsAddingText = useUiState((s) => s.setIsAddingText);
  const { setActiveTool } = useUiState();
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

  const addTextClick = (e: React.MouseEvent<HTMLDivElement>) => {
  setActiveTool(0);

  // если клик пришёлся внутрь существующего текстового блока — не трогаем ничего
  const path = (e.nativeEvent as any).composedPath?.() || [];
  const clickedInTextBlock = path.some((node: any) =>
    node?.classList?.contains?.(css.text_block)
  );

  // Если клик вне блока — удалить пустые блоки, чтобы не накапливались
  if (!clickedInTextBlock) {
    setTextBlocks((prev) => prev.filter((b) => (b.text || "").trim() !== ""));
  }

  if (!isAddingText) return;
  if (!svgRef.current || !containerRef.current) return;

  const rect = svgRef.current.getBoundingClientRect();
  const x = (e.clientX - rect.left - pan.x) / scale;
  const y = (e.clientY - rect.top - pan.y) / scale;

  const newBlock: TextBlockData = {
    id: Date.now(),
    x,
    y,
    text: "",
    isEditing: true, // <-- сразу в режим редактирования
  };

  setTextBlocks((prev) => [...prev, newBlock]);
  setIsAddingText(false);
};


  const handleFinishText = (id: number, data: TextBlockData) => {
    const text = data.text || "";

    if (!text.trim()) {
      setTextBlocks((prev) => prev.filter((b) => b.id !== id));
      setIsAddingText(false);
      return;
    }

    setTextBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...data } : b))
    );
  };

  useEffect(() => {
    if (isAddingText) showIcon("/icons/add-text-cursor.svg");
    else hideIcon();
  }, [isAddingText, showIcon, hideIcon]);

  return (
    <div
      className={css.whiteboard_wrapper}
      ref={containerRef}
      onClick={addTextClick}
    >
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
        {textBlocks.map((block) => (
  <TextBlock
    key={block.id}
    block={block}
    autoFocus={!!block.isEditing}
    onFinish={(data) => handleFinishText(block.id, data)}
    onRequestClose={() => {
      // вспомогательный коллбек: удалить пустой блок если нужно
      setTextBlocks((prev) => prev.filter((b) => b.id !== block.id || (b.text || "").trim() !== ""));
    }}
    style={{
      pointerEvents: "auto",
      position: "absolute",
      top: block.y * scale + pan.y,
      left: block.x * scale + pan.x,
      transformOrigin: "top left",
    }}
  />
))}


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
