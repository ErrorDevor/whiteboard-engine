"use client";

import React, { useEffect, useState, useRef } from "react";

import { AddText } from "../AddText/AddText";
import { CursorIcon } from "@/shared/ui/ui-kit/CursorIcon/CursorIcon";
import { useCursor } from "@/utils/hooks";
import { useUiState } from "@/utils/store";

export interface TextBlock {
  id: number;
  x: number;
  y: number;
  isEmpty: boolean;
}

interface TextLayerProps {
  className: string;
  scale: number;
  pan: { x: number; y: number };
  svgRef: React.RefObject<SVGSVGElement | null>;
}

export const TextLayer: React.FC<TextLayerProps> = ({
  className,
  scale,
  pan,
  svgRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [texts, setTexts] = useState<TextBlock[]>([]);
  const [activeTextId, setActiveTextId] = useState<number | null>(null);

  const isAddingText = useUiState((s) => s.isAddingText);
  const setIsAddingText = useUiState((s) => s.setIsAddingText);
  const { icon, position, showIcon, hideIcon } = useCursor(svgRef);
  const { setActiveTool } = useUiState();

  useEffect(() => {
    if (isAddingText) showIcon("/icons/add-text-cursor.svg");
    else hideIcon();
  }, [isAddingText, showIcon, hideIcon]);

  const addTextClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setActiveTool(0);
    if (!isAddingText || !svgRef.current || !containerRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / scale;
    const y = (e.clientY - rect.top - pan.y) / scale;
    const id = Date.now();
    setTexts((prev) => [...prev, { id, x, y, isEmpty: true }]);
    setActiveTextId(id);
    setIsAddingText(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isAddingText) {
      addTextClick(e);
      return;
    }

    const target = e.target as HTMLElement;
    const isTextBlockClick = !!target.closest("[data-add-text]");
    if (isTextBlockClick) return;

    setActiveTextId(null);
    setTexts((prev) => prev.filter((t) => !t.isEmpty));

    // TODO: Add Store
  };

  return (
    <div
      className={className}
      id="text_canvas"
      ref={containerRef}
      onClick={handleClick}
    >
      {texts.map((t) => (
        <AddText
          key={t.id}
          id={t.id}
          x={t.x * scale + pan.x}
          y={t.y * scale + pan.y}
          isEmpty={t.isEmpty}
          onTextEmptyChange={(isEmpty) => {
            setTexts((prev) =>
              prev.map((p) => (p.id === t.id ? { ...p, isEmpty } : p))
            );
          }}
          activeTextId={activeTextId}
          setActiveTextId={setActiveTextId}
        />
      ))}

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
