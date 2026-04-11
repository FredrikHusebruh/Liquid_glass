import { useEffect, useId, useRef, useState } from 'react';
import { generateDisplacementMap, generateLensMap, surfaces } from '../physics/liquidGlass.physics';
import type { LiquidGlassConfig, LiquidGlassHookResult, MapData } from '../types/liquidGlass.types';

const DEFAULTS = {
  bezel: 28,
  thickness: 55,
  surface: 'squircle',
} as const;

export function useLiquidGlass(config: LiquidGlassConfig): LiquidGlassHookResult {
  const { width, height, bezel = DEFAULTS.bezel, thickness = DEFAULTS.thickness, surface = DEFAULTS.surface, cornerRadius } = config;

  const rawId = useId();
  const filterId = `lg-${rawId.replace(/:/g, '')}`;
  const [mapData, setMapData] = useState<MapData | null>(null);
  const prevConfigRef = useRef<string>('');

  useEffect(() => {
    const key = `${width}|${height}|${bezel}|${thickness}|${surface}|${cornerRadius}`;
    if (key === prevConfigRef.current) return;
    prevConfigRef.current = key;

    if (surface === 'lens') {
      setMapData(generateLensMap(width, height, thickness));
    } else {
      const fn = surfaces[surface] ?? surfaces.squircle;
      setMapData(generateDisplacementMap(width, height, bezel, thickness, fn, cornerRadius));
    }
  }, [width, height, bezel, thickness, surface, cornerRadius]);

  return { filterId, mapData };
}
