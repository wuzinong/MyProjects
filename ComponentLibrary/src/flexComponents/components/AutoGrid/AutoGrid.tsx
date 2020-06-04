import * as React from 'react';
import { FC } from "react";

export interface AutoGridProps {
  /** The minimum width of grid elements. Given this minimum width plus the specified gap, the grid decide how many columns to display. */
  minWidth: number;
  /** The size of the gutters between grid elements. */
  gap: number;
}

export const AutoGrid: FC<AutoGridProps> = ({minWidth=300, gap=15, children}) => {
  return <div
    style={{
      display: 'grid',
      gridGap: `${gap}px`,
      gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`
    }}
  >
  {children}
  </div>
}