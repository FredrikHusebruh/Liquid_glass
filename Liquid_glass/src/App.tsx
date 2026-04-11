import { DraggableGlass } from './components/DraggableGlass';

const SIZE = 250;

export default function App() {
  return (
    <div className="w-full h-full relative overflow-hidden">
      <DraggableGlass
        initialX={200} initialY={200}
        width={SIZE} height={SIZE}
        surface="lens" bezel={50} thickness={100} blurAmount={0}
      />
    </div>
  );
}
