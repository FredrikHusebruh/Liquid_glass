import { useRef, useState } from 'react';

interface Position { x: number; y: number }

export function useDrag(initial: Position) {
  const [position, setPosition] = useState<Position>(initial);
  const [cursor, setCursor] = useState<'grab' | 'grabbing'>('grab');
  const isDragging = useRef(false);
  const offset = useRef<Position>({ x: 0, y: 0 });

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    offset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    isDragging.current = true;
    setCursor('grabbing');
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    setPosition({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    isDragging.current = false;
    setCursor('grab');
  };

  return {
    position,
    dragHandleProps: { onPointerDown, onPointerMove, onPointerUp, style: { cursor } },
  };
}
