"use client";

import { useState, useRef, useCallback } from "react";
import { whiteboardState } from "@/utils/store";

interface FrameRect {
  id: string;
  rect: DOMRect;
}

interface UseSelectionBoxProps {
  getFrameRects: () => FrameRect[];
  onSelect?: (ids: string[]) => void
}

export function useSelectionBox({ getFrameRects, onSelect }: UseSelectionBoxProps) {
  const [selectionBox, setSelectionBox] = useState({
    visible: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const startRef = useRef<{ x: number; y: number } | null>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const { isDragging } = whiteboardState.getState().selection;
    const { isResizing } = whiteboardState.getState();

    if (isDragging) return;
    if (isResizing) return;

    if ((e.target as HTMLElement).closest(".frame_group")) return;
    if (e.button !== 0) return;

    startRef.current = { x: e.clientX, y: e.clientY };
    setSelectionBox({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      width: 0,
      height: 0,
    });
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!startRef.current) return;

    const x1 = startRef.current.x;
    const y1 = startRef.current.y;
    const x2 = e.clientX;
    const y2 = e.clientY;

    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    setSelectionBox({
      visible: true,
      x: left,
      y: top,
      width,
      height,
    });
  }, []);

  const onMouseUp = useCallback(
    (e: React.MouseEvent) => {
      const { isDragging } = whiteboardState.getState().selection;
      if (isDragging) {
        setSelectionBox({ visible: false, x: 0, y: 0, width: 0, height: 0 });
        startRef.current = null;
        return;
      }

      if (!startRef.current) {
        setSelectionBox((prev) => ({ ...prev, visible: false }));
        return;
      }

      const sx = startRef.current.x;
      const sy = startRef.current.y;
      const ex = e.clientX;
      const ey = e.clientY;
      const left = Math.min(sx, ex);
      const top = Math.min(sy, ey);
      const width = Math.abs(ex - sx);
      const height = Math.abs(ey - sy);

      if (width === 0 && height === 0) {
        setSelectionBox({ visible: false, x: 0, y: 0, width: 0, height: 0 });
        startRef.current = null;
        return;
      }

      const box = { x: left, y: top, width, height };
      const frames = getFrameRects();
      const selectedIds: string[] = [];

      for (const { id, rect } of frames) {
        const intersect =
          rect.left < box.x + box.width &&
          rect.right > box.x &&
          rect.top < box.y + box.height &&
          rect.bottom > box.y;
        if (intersect) selectedIds.push(id);
      }

      onSelect?.(selectedIds);

      setSelectionBox({ visible: false, x: 0, y: 0, width: 0, height: 0 });
      startRef.current = null;
    },
    [getFrameRects]
  );

  return { selectionBox, onMouseDown, onMouseMove, onMouseUp };
}
