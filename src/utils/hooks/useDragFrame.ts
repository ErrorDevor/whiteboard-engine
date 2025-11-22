import { useEffect, useRef } from "react";
import { whiteboardState } from "@/utils/store";

export const useDragFrame = ({
  id,
  scale,
  selectedIds = [],
}: {
  id: string;
  scale: number;
  selectedIds?: string[];
}) => {
  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const elemRef = useRef<SVGGraphicsElement | null>(null);
  const pos = useRef<{ x: number; y: number }>(
    whiteboardState.getState().getFramePosition(id) ?? { x: 0, y: 0 }
  );

  const spacePressed = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") spacePressed.current = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") spacePressed.current = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const elem = document.getElementById(id) as SVGGraphicsElement | null;
    if (!elem) return;
    elemRef.current = elem;

    const onPointerDown = (e: PointerEvent) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (spacePressed.current || e.button === 1) return;
      if (whiteboardState.getState().isResizing) return;

      whiteboardState.getState().setSelectionDragging(true);
      isDragging.current = true;

      const framePos = whiteboardState.getState().getFramePosition(id) ?? {
        x: 0,
        y: 0,
      };
      pos.current = framePos;
      start.current = { x: e.clientX, y: e.clientY };

      try {
        elem.setPointerCapture?.(e.pointerId);
      } catch {}
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      if (whiteboardState.getState().isResizing) return;

      const dx = (e.clientX - start.current.x) / scale;
      const dy = (e.clientY - start.current.y) / scale;
      start.current = { x: e.clientX, y: e.clientY };

      const moveIds =
        selectedIds && selectedIds.length > 0 ? selectedIds : [id];
      moveIds.forEach((frameId) => {
        const framePos = whiteboardState
          .getState()
          .getFramePosition(frameId) ?? { x: 0, y: 0 };

        const newPos = {
          x: framePos.x + dx,
          y: framePos.y + dy,
        };
        pos.current = newPos;

        whiteboardState.getState().setFramePosition(frameId, newPos);

        const el = document.getElementById(
          frameId
        ) as SVGGraphicsElement | null;
        if (el) {
          el.setAttribute("transform", `translate(${newPos.x},${newPos.y})`);
        }
      });
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;

      whiteboardState.getState().setSelectionDragging(false);

      try {
        elem.releasePointerCapture?.(e.pointerId);
      } catch {}
    };

    elem.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      elem.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [id, scale, selectedIds]);

  return {};
};
