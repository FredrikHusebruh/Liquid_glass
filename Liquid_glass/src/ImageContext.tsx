import { createContext, useContext, useState } from 'react';
import { IMAGES } from './imageStore';

interface ImageContextValue {
  activeId: string;
  setActiveId: (id: string) => void;
  activeSrc: string;
}

const ImageContext = createContext<ImageContextValue | null>(null);

const SRC_BY_ID = new Map(IMAGES.map(i => [i.id, i.src]));

export function ImageProvider({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState(IMAGES[0].id);
  const activeSrc = SRC_BY_ID.get(activeId)!;
  return (
    <ImageContext.Provider value={{ activeId, setActiveId, activeSrc }}>
      {children}
    </ImageContext.Provider>
  );
}

export function useImage() {
  const ctx = useContext(ImageContext);
  if (!ctx) throw new Error('useImage must be used within ImageProvider');
  return ctx;
}
