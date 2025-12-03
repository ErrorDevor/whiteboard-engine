"use client";

import React, { useRef, useState, useEffect } from "react";

import { FrameGroup } from "../FrameGroup/FrameGroup";
import { Grid } from "../Grid/Grid";
import { AddText } from "../AddText/AddText";
import { AddNote } from "../AddNote/AddNote";
import { CursorIcon } from "@/shared/ui/ui-kit/CursorIcon/CursorIcon";

import { usePanScale, useCursor } from "@/utils/hooks";
import { whiteboardState } from "@/utils/store";
import { useUiState } from "@/utils/store/uiState";

import {
  Box,
  boxesIntersect,
  useSelectionContainer,
} from "@air/react-drag-to-select";

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
  const svgRef = useRef<SVGSVGElement | null>(null);

  const { setGrab, setGrabbing, setDefault } = useCursor(svgRef);
  const { setActiveTool } = useUiState();

  const isPanning = whiteboardState((s) => s.isPanning);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [mounted, setMounted] = useState(false);
  const frameObjects: FrameData[] = frames.map((src, i) => ({
    id: `frame-${i + 1}`,
    src,
    width: 200,
    height: 200,
  }));

  /*Pan Scale Mounted Whiteboard*/
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

  /*Whiteboard Style*/
  const style = {
    userSelect: "none" as const,
    touchAction: "none" as const,
    backgroundImage:
      "radial-gradient(rgba(17,49,93,0.18) 0.15rem, transparent 0.15rem)",
    backgroundSize: "24px 24px",
  };

  /*Add Text*/
  const isAddingText = useUiState((s) => s.isAddingText);
  const setIsAddingText = useUiState((s) => s.setIsAddingText);
  const [texts, setTexts] = useState<TextBlock[]>([]);
  const [activeTextId, setActiveTextId] = useState<number | null>(null);
  const { icon, position, showIcon, hideIcon } = useCursor(svgRef);

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

  /*Add Note*/
  const isAddingNote = useUiState((s) => s.isAddingNote);
  const setIsAddingNote = useUiState((s) => s.setIsAddingNote);
  const [notes, setNotes] = useState<TextBlock[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);

  function ClickAddNote() {
    useEffect(() => {
      const id = Date.now();
      const x = 0;
      const y = 0;
      const newBlock = { id, x, y, isEmpty: true };

      setNotes((prev) => [...prev, newBlock]);
      setActiveNoteId(id);

      const tryFocus = () => {
        const sel = document.querySelector(
          `[data-id="${id}"] [data-editor-input="true"]`
        ) as HTMLElement | null;
        if (sel) {
          try {
            sel.focus();
          } catch (e) {}
        }
      };

      setTimeout(tryFocus, 0);
      setTimeout(tryFocus, 50);

      setIsAddingNote(false);
      setActiveTool(0);
    }, []);

    return null;
  }

  const clickRemoveNote = (id: number) => {
    setNotes((prev) => prev.filter((t) => t.id !== id));

    try {
      whiteboardState.getState().removeNoteBlock(String(id));
    } catch (e) {}
    if (activeNoteId === id) setActiveNoteId(null);
  };

  const clickActivateNoteBlock = (e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      setActiveNoteId(null);
    }
  };

  /**/
  const [selectedFrames, setSelectedFrames] = useState<string[]>([]);
  const frameRects = useRef<Record<string, Box>>({});
  const svgWrapperRef = useRef<HTMLDivElement | null>(null);
  const [selectionBox, setSelectionBox] = useState<null | {
    x: number;
    y: number;
    w: number;
    h: number;
  }>(null);

  const { DragSelection } = useSelectionContainer({
    eventsElement: svgWrapperRef.current ?? undefined,

    onSelectionStart: () => {
      setSelectionBox(null); // → очистить старую рамку
    },

    onSelectionChange: (box) => {
      const scrollAwareBox = {
        ...box,
        top: box.top + window.scrollY,
        left: box.left + window.scrollX,
      };

      // === преобразуем рамку в DOM-координаты для hit-test ===
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;

      // координаты рамки в DOM
      const selectionDOM = {
        top: scrollAwareBox.top,
        left: scrollAwareBox.left,
        width: scrollAwareBox.width,
        height: scrollAwareBox.height,
      };

      const hit: string[] = [];
      Object.entries(frameRects.current).forEach(([id, rect]) => {
        if (boxesIntersect(selectionDOM, rect)) hit.push(id);
      });

      setSelectedFrames(hit);

      // === координаты для SVG визуальной рамки ===
      const x = scrollAwareBox.left - svgRect.left;
      const y = scrollAwareBox.top - svgRect.top;

      setSelectionBox({
        x,
        y,
        w: scrollAwareBox.width,
        h: scrollAwareBox.height,
      });
    },

    onSelectionEnd: () => {
      setSelectionBox(null);
    },

    isEnabled: true,
  });

  useEffect(() => {
    if (!svgWrapperRef.current) return;

    const list = svgWrapperRef.current.querySelectorAll(`g.frame_group`);
    const rects: Record<string, Box> = {};

    list.forEach((el) => {
      const r = el.getBoundingClientRect();
      rects[el.id] = {
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      };
    });

    frameRects.current = rects;
  }, [pan, scale, texts.length, notes.length, frames.length]);

  return (
    <div className={css.whiteboard_wrapper} ref={svgWrapperRef}>
      <DragSelection />

      <svg
        ref={svgRef}
        className={css.whiteboard}
        xmlns="http://www.w3.org/2000/svg"
        id="diagram"
        tabIndex={0}
        style={style}
        onClick={(e) => {
          if (isPanning) return;

          if (e.target === svgRef.current) {
            clickActivateTextBlock(e);
            clickActivateNoteBlock(e);
            setSelectedFrames([]);
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
                  selectedIds={selectedFrames}
                  selectOne={(id) => setSelectedFrames([id])}
                  toggleSelect={(id) =>
                    setSelectedFrames((prev) =>
                      prev.includes(id)
                        ? prev.filter((x) => x !== id)
                        : [...prev, id]
                    )
                  }
                />
              ))}
            </Grid>
          </g>
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

        {selectionBox && (
          <rect
            x={selectionBox.x}
            y={selectionBox.y}
            width={selectionBox.w}
            height={selectionBox.h}
            fill="rgba(0,120,215,0.3)"
            stroke="rgba(0,120,215,0.9)"
            rx={4}
            strokeDasharray={4}
            strokeWidth={1}
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

      {isAddingNote && <ClickAddNote />}

      {notes.map((note) => {
        return (
          <AddNote
            key={note.id}
            id={note.id}
            active={activeNoteId === note.id}
            onRemove={clickRemoveNote}
            style={{ top: "12rem", left: "18.4rem" }}
          />
        );
      })}
    </div>
  );
};
