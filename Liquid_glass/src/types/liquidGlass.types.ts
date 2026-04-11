export type SurfaceKey = 'squircle' | 'circle' | 'concave' | 'lip' | 'lens';

export interface LiquidGlassConfig {
  width: number;
  height: number;
  bezel?: number;
  thickness?: number;
  surface?: SurfaceKey;
  cornerRadius?: number;
}

export interface MapData {
  url: string;
  scale: number;
  specularUrl: string;
}

export interface LiquidGlassHookResult {
  filterId: string;
  mapData: MapData | null;
}
