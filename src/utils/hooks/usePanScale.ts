import { useEffect, useRef } from "react";

type Point = { x: number; y: number };

interface UsePanScaleOptions {
  svgRef: React.RefObject<SVGSVGElement | null>;
  pan: Point;
  setPan: (p: Point) => void;
  scale: number;
  setScale: (s: number) => void;
  minScale?: number;
  maxScale?: number;
  cursor?: {
    setGrab?: () => void;
    setGrabbing?: () => void;
    setDefault?: () => void;
  };
}

export function usePanScale({
  svgRef,
  pan,
  setPan,
  scale,
  setScale,
  minScale = 0.25,
  maxScale = 4,
  cursor,
}: UsePanScaleOptions) {
  const isPanningRef = useRef(false);
  const spacePressedRef = useRef(false);
  const panSourceRef = useRef<"space" | "mouse" | null>(null);

  const panRef = useRef<Point>(pan);
  const scaleRef = useRef<number>(scale);
  useEffect(() => {
    panRef.current = pan;
  }, [pan]);
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const distanceStartRef = useRef<number | null>(null);
  const scaleStartRef = useRef<number>(scale);
  const panStartRef = useRef<Point>({ x: 0, y: 0 });
  const originRef = useRef<Point>({ x: 0, y: 0 });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    function onPointerDown(evt: PointerEvent) {
      if (evt.button === 1 || spacePressedRef.current) {
        if (!(spacePressedRef.current || evt.button === 1)) return;
        evt.preventDefault();
        isPanningRef.current = true;
        panSourceRef.current = evt.button === 1 ? "mouse" : "space";
        cursor?.setGrabbing?.();

        const start = { x: evt.clientX, y: evt.clientY };
        const startPan = { ...panRef.current };

        function onMove(e: PointerEvent) {
          const dx = e.clientX - start.x;
          const dy = e.clientY - start.y;
          setPan({ x: startPan.x + dx, y: startPan.y + dy });
        }

        function onUp() {
          isPanningRef.current = false;
          if (panSourceRef.current === "space") cursor?.setGrab?.();
          else cursor?.setDefault?.();
          panSourceRef.current = null;
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
        }

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        return;
      }

      pointersRef.current.set(evt.pointerId, {
        x: evt.clientX,
        y: evt.clientY,
      });
      if (pointersRef.current.size === 2) {
        const arr = Array.from(pointersRef.current.values());
        const a = arr[0],
          b = arr[1];
        const distanceStart = Math.hypot(a.x - b.x, a.y - b.y);
        distanceStartRef.current = distanceStart || 1;
        scaleStartRef.current = scaleRef.current;
        panStartRef.current = { ...panRef.current };
        originRef.current = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };

        try {
          (evt.target as any).setPointerCapture?.(evt.pointerId);
        } catch {}
      } else {

        try {

          (evt.target as any).setPointerCapture?.(evt.pointerId);
        } catch {}
      }
    }

    function onPointerMove(evt: PointerEvent) {
      if (pointersRef.current.has(evt.pointerId)) {
        pointersRef.current.set(evt.pointerId, {
          x: evt.clientX,
          y: evt.clientY,
        });
      }

      if (pointersRef.current.size === 2 && distanceStartRef.current != null) {
        const arr = Array.from(pointersRef.current.values());
        const a = arr[0],
          b = arr[1];
        const distanceNow = Math.hypot(a.x - b.x, a.y - b.y) || 1;

        const scaleStart = scaleStartRef.current;
        const distanceStart = distanceStartRef.current;
        let nextScale = (scaleStart / distanceStart) * distanceNow;

        nextScale = Math.max(minScale, Math.min(maxScale, nextScale));

        const origin = originRef.current;
        const k = nextScale / scaleStart;
        const panStart = panStartRef.current;
        const nextPan = {
          x: k * (panStart.x - origin.x) + origin.x,
          y: k * (panStart.y - origin.y) + origin.y,
        };

        setScale(nextScale);
        setPan(nextPan);
      }
    }

    function onPointerUp(evt: PointerEvent) {
      pointersRef.current.delete(evt.pointerId);

      try {
        (evt.target as any).releasePointerCapture?.(evt.pointerId);
      } catch {}

      if (pointersRef.current.size < 2) {
        distanceStartRef.current = null;
      }
    }

    function onWheel(evt: WheelEvent) {
      if (!evt.ctrlKey) return;
      evt.preventDefault();

      const sensitivity = 0.0015;
      const factor = Math.exp(-evt.deltaY * sensitivity);
      const nextScale = Math.max(
        minScale,
        Math.min(maxScale, scaleRef.current * factor)
      );

      const origin = { x: evt.clientX, y: evt.clientY };
      const k = nextScale / scaleRef.current;
      const nextPan = {
        x: k * (panRef.current.x - origin.x) + origin.x,
        y: k * (panRef.current.y - origin.y) + origin.y,
      };

      setScale(nextScale);
      setPan(nextPan);
    }

    function onKeyDown(evt: KeyboardEvent) {
      if (evt.code === "Space") {
        spacePressedRef.current = true;
        if (!isPanningRef.current) cursor?.setGrab?.();
      }
    }

    function onKeyUp(evt: KeyboardEvent) {
      if (evt.code === "Space") {
        spacePressedRef.current = false;
        if (!isPanningRef.current) cursor?.setDefault?.();
      }
    }

    svg.addEventListener("pointerdown", onPointerDown as EventListener);
    window.addEventListener("pointermove", onPointerMove as EventListener);
    window.addEventListener("pointerup", onPointerUp as EventListener);
    svg.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      svg.removeEventListener("pointerdown", onPointerDown as EventListener);
      window.removeEventListener("pointermove", onPointerMove as EventListener);
      window.removeEventListener("pointerup", onPointerUp as EventListener);
      svg.removeEventListener("wheel", onWheel as EventListener);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      pointersRef.current.clear();
      distanceStartRef.current = null;
    };
  }, [svgRef, setPan, setScale, cursor, minScale, maxScale]);
}
