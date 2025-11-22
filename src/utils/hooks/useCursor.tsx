"use client";

import { useState, useEffect, useCallback } from "react";

import { useUiState } from "@/utils/store";

export type CursorType =
  | "default"
  | "grab"
  | "grabbing"
  | "pointer"
  | "move"
  | "crosshair"
  | "text"
  | "not-allowed";

interface CursorIcon {
  src: string;
  offsetX?: number;
  offsetY?: number;
}

export function useCursor(
  targetRef?: React.RefObject<HTMLElement | SVGElement | null>
) {
  const [cursor, setCursor] = useState<CursorType>("default");
  const [icon, setIcon] = useState<CursorIcon | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const activeTool = useUiState((s) => s.activeTool);
  const isAddingText = useUiState((s) => s.isAddingText);

  useEffect(() => {
    const el = targetRef?.current || document.body;
    if (el) el.style.cursor = cursor;
    return () => {
      if (el) el.style.cursor = "default";
    };
  }, [cursor, targetRef]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    if (icon) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [icon]);

  useEffect(() => {
    if (activeTool === 0 || !isAddingText) {
      setPosition({ x: 0, y: 0 });
      setIcon(null);
    }
  }, [activeTool, isAddingText, setPosition]);

  const setGrab = useCallback(() => setCursor("grab"), []);
  const setGrabbing = useCallback(() => setCursor("grabbing"), []);
  const setPointer = useCallback(() => setCursor("pointer"), []);
  const setDefault = useCallback(() => setCursor("default"), []);

  const showIcon = useCallback((src: string, offsetX = 10, offsetY = 10) => {
    setIcon({ src, offsetX, offsetY });
  }, []);

  const hideIcon = useCallback(() => setIcon(null), []);

  return {
    cursor,
    setCursor,
    setGrab,
    setGrabbing,
    setPointer,
    setDefault,
    icon,
    position,
    showIcon,
    hideIcon,
  };
}
