import { useDrag } from '../hooks/useDrag';
import { LiquidGlass } from './liquidGlass';
import type { LiquidGlassConfig } from '../types/liquidGlass.types';

interface Props extends LiquidGlassConfig {
  initialX: number;
  initialY: number;
  borderRadius?: number;
  refractionLevel?: number;
  blurAmount?: number;
  children?: React.ReactNode;
}

export function DraggableGlass({ initialX, initialY, children, ...glassProps }: Props) {
  const { position, dragHandleProps } = useDrag({ x: initialX, y: initialY });

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        userSelect: 'none',
        touchAction: 'none',
        ...dragHandleProps.style,
      }}
      onPointerDown={dragHandleProps.onPointerDown}
      onPointerMove={dragHandleProps.onPointerMove}
      onPointerUp={dragHandleProps.onPointerUp}
    >
      <LiquidGlass {...glassProps}>{children}</LiquidGlass>
    </div>
  );
}
