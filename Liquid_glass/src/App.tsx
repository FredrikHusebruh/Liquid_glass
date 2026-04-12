import { useState } from 'react';
import { DraggableGlass } from './components/DraggableGlass';
import { LensControls } from './components/LensControls';
import { useLiquidGlass } from './hooks/useLiquidGlass';
import type { SurfaceKey } from './types/liquidGlass.types';

export default function App() {
  const [size, setSize] = useState(250);
  const [bezel, setBezel] = useState(15);
  const [thickness, setThickness] = useState(65);
  const [blurAmount, setBlurAmount] = useState(0);
  const [displacement, setDisplacement] = useState(true);
  const [surface, setSurface] = useState<SurfaceKey>('lens');

  const { mapData: previewMapData } = useLiquidGlass({ width: 200, height: 200, bezel, thickness, surface });

  return (
    <div className="w-full h-full relative overflow-hidden">
      <DraggableGlass
        initialX={0} initialY={0}
        width={size} height={size}
        surface={surface} bezel={bezel} thickness={thickness} blurAmount={blurAmount}
        refractionLevel={displacement ? 1 : 0}
      />
      <LensControls
        size={size} bezel={bezel} thickness={thickness} blurAmount={blurAmount} displacement={displacement}
        surface={surface} mapDataUrl={previewMapData?.url ?? ''}
        onSize={setSize} onBezel={setBezel} onThickness={setThickness} onBlur={setBlurAmount} onDisplacement={setDisplacement}
        onSurface={setSurface}
      />
    </div>
  );
}
