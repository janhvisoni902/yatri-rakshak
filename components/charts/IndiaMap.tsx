'use client';

import React from 'react';
import InteractiveIndiaMap from './InteractiveIndiaMap';
import { StateData } from '@/types/map';

interface IndiaMapProps {
  data?: StateData[];
  onStateClick?: (state: StateData) => void;
  height?: number;
  showLegend?: boolean;
  className?: string;
}

export default function IndiaMapComponent({ 
  data, 
  onStateClick, 
  height = 300, 
  showLegend = true,
  className = ""
}: IndiaMapProps) {
  return (
    <InteractiveIndiaMap 
      height={height}
      showLegend={showLegend}
      className={className}
      onStateClick={onStateClick}
    />
  );
}
