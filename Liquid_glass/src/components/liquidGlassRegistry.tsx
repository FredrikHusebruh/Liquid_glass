import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { generateDisplacementMap, surfaces } from '../physics/liquidGlass.physics';
import type { MapData, SurfaceKey } from '../types/liquidGlass.types';

interface RegistryEntry {
  mapData: MapData;
  filterId: string;
  refCount: number;
}

interface RegistryContextValue {
  acquire: (width: number, height: number, bezel: number, thickness: number, surface: SurfaceKey) => string;
  release: (key: string) => void;
  getEntry: (key: string) => RegistryEntry | undefined;
}

const RegistryContext = createContext<RegistryContextValue | null>(null);

// Cache key — two identical configs share one filter definition
function cacheKey(w: number, h: number, b: number, t: number, s: string) {
  return `${w}|${h}|${b}|${t}|${s}`;
}

export function LiquidGlassProvider({ children }: { children: React.ReactNode }) {
  const [registry, setRegistry] = useState<Map<string, RegistryEntry>>(new Map());
  const counterRef = useRef(0);

  const acquire = useCallback(
    (width: number, height: number, bezel: number, thickness: number, surface: SurfaceKey) => {
      const key = cacheKey(width, height, bezel, thickness, surface);

      setRegistry(prev => {
        const next = new Map(prev);
        const existing = next.get(key);

        if (existing) {
          next.set(key, { ...existing, refCount: existing.refCount + 1 });
        } else {
          const mapData = generateDisplacementMap(width, height, bezel, thickness, surfaces[surface] ?? surfaces.squircle);
          const filterId = `lg-reg-${++counterRef.current}`;
          next.set(key, { mapData, filterId, refCount: 1 });
        }
        return next;
      });

      return key;
    },
    []
  );

  const release = useCallback((key: string) => {
    setRegistry(prev => {
      const next = new Map(prev);
      const entry = next.get(key);
      if (!entry) return prev;
      if (entry.refCount <= 1) {
        next.delete(key);
      } else {
        next.set(key, { ...entry, refCount: entry.refCount - 1 });
      }
      return next;
    });
  }, []);

  const getEntry = useCallback((key: string) => registry.get(key), [registry]);

  return (
    <RegistryContext.Provider value={{ acquire, release, getEntry }}>
      {/* Single SVG with all active filter defs */}
      <svg aria-hidden style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        <defs>
          {Array.from(registry.entries()).map(([, entry]) => (
            <filter
              key={entry.filterId}
              id={entry.filterId}
              x="0" y="0"
              width={entry.mapData.url ? undefined : 0}
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feImage
                href={entry.mapData.url}
                x="0" y="0"
                preserveAspectRatio="none"
                result="dmap"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="dmap"
                scale={entry.mapData.scale}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          ))}
        </defs>
      </svg>
      {children}
    </RegistryContext.Provider>
  );
}

// Variant of the hook that uses the registry instead of local state
export function useLiquidGlassRegistered(
  width: number, height: number,
  bezel: number, thickness: number,
  surface: SurfaceKey
) {
  const ctx = useContext(RegistryContext);
  const keyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!ctx) return;
    const key = ctx.acquire(width, height, bezel, thickness, surface);
    keyRef.current = key;
    return () => ctx.release(key);
  }, [width, height, bezel, thickness, surface, ctx]);

  const entry = ctx?.getEntry(keyRef.current ?? '');
  return {
    filterId: entry?.filterId ?? null,
    mapData: entry?.mapData ?? null,
  };
}