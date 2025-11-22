"use client";

import React, { useState, useCallback } from "react";

import { COLUMNS, COLUMNSOFFSET } from "./lib/gridConfig";

type GridProps = {
  children?: React.ReactNode[];
  columnWidth?: number;
  rowGap?: number;
};

export const Grid: React.FC<GridProps> = ({
  children = [],
  columnWidth = 415,
  rowGap = 15,
}) => {
  const [frameHeights, setFrameHeights] = useState<Record<string, number>>({});

  const updateFrameHeight = useCallback((id: string, height: number) => {
    setFrameHeights((prev) => {
      if (prev[id] === height) return prev;
      return { ...prev, [id]: height };
    });
  }, []);

  const columns = Array.from(
    { length: COLUMNS },
    () => [] as React.ReactNode[]
  );

  React.Children.forEach(children, (child, i) => {
    if (!React.isValidElement(child)) return;

    const withCallback = React.cloneElement(
      child as React.ReactElement<{
        id: string;
        onMeasured?: (id: string, height: number) => void;
      }>,
      { onMeasured: updateFrameHeight }
    );

    columns[i % COLUMNS].push(withCallback);
  });

  return (
    <g id="grid">
      {columns.map((colChildren, colIndex) => {
        let yOffset = COLUMNSOFFSET[colIndex] ?? 0;

        return (
          <g
            key={colIndex}
            transform={`translate(${colIndex * columnWidth}, 0)`}
          >
            {colChildren.map((child, i) => {
              if (!React.isValidElement(child)) return null;

              const element = child as React.ReactElement<any>;
              const id = element.props.id;
              const height = frameHeights[id] ?? 200;

              const transform = `translate(0, ${yOffset})`;
              yOffset += height + rowGap;

              return (
                <g key={id} transform={transform}>
                  {child}
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
};
