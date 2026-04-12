import { useEffect, useRef, useState } from 'react';
import { LiquidGlass } from './liquidGlass';
import { NavBtn } from './NavBtn';
import type { SurfaceKey } from '../types/liquidGlass.types';

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  unit?: string;
}

function SliderRow({ label, value, min, max, onChange, unit = '' }: SliderRowProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span
          className="uppercase tracking-widest"
          style={{ fontSize: 11, color: 'rgba(255,255,255,0.50)' }}
        >
          {label}
        </span>
        <span
          className="font-semibold tabular-nums"
          style={{ fontSize: 18, color: 'rgba(255,255,255,1)', letterSpacing: '-0.5px' }}
        >
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        className="glass-slider"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function SurfaceBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '7px 0',
        borderRadius: 10,
        border: 'none',
        cursor: 'pointer',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color: active ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.50)',
        background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
        backdropFilter: active ? 'blur(8px)' : 'none',
        boxShadow: active
          ? 'inset 0 1px 0 rgba(255,255,255,0.45), inset 0 0 0 0.5px rgba(255,255,255,0.22)'
          : 'none',
        transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
      }}
    >
      {label}
    </button>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span className="uppercase tracking-widest" style={{ fontSize: 11, color: 'rgba(255,255,255,0.50)' }}>
        {label}
      </span>
      <button
        onClick={() => onChange(!value)}
        aria-pressed={value}
        style={{
          position: 'relative',
          width: 44,
          height: 24,
          borderRadius: 999,
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          background: value ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)',
          boxShadow: value
            ? 'inset 0 1px 0 rgba(255,255,255,0.50), inset 0 0 0 0.5px rgba(255,255,255,0.30), 0 0 12px rgba(255,255,255,0.20)'
            : 'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 0 0 0.5px rgba(255,255,255,0.15)',
          transition: 'background 0.2s, box-shadow 0.2s',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: value ? 23 : 3,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.90)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
            transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </button>
    </div>
  );
}

interface Props {
  size: number;
  bezel: number;
  thickness: number;
  blurAmount: number;
  displacement: boolean;
  surface: SurfaceKey;
  mapDataUrl: string;
  onSize: (v: number) => void;
  onBezel: (v: number) => void;
  onThickness: (v: number) => void;
  onBlur: (v: number) => void;
  onDisplacement: (v: boolean) => void;
  onSurface: (v: SurfaceKey) => void;
}

export function LensControls({ size, bezel, thickness, blurAmount, displacement, surface, mapDataUrl, onSize, onBezel, onThickness, onBlur, onDisplacement, onSurface }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelSize, setPanelSize] = useState({ width: 0, height: 0 });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!panelRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setPanelSize({ width: Math.round(width), height: Math.round(height) });
    });
    ro.observe(panelRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      {/* Sliding panel */}
      <div
        ref={panelRef}
        className="absolute flex flex-col"
        style={{
          top: 21, right: 21, bottom: 21, width: 260, zIndex: 10,
          transform: open ? 'translateX(0)' : 'translateX(calc(100% + 21px))',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* LiquidGlass background layer */}
        {panelSize.width > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            <LiquidGlass
              width={panelSize.width}
              height={panelSize.height}
              surface="squircle"
              bezel={25}
              thickness={100}
              borderRadius={32}
              blurAmount={0}
            />
          </div>
        )}

        {/* Panel content */}
        <div
          className="relative flex flex-col h-full"
          style={{ padding: '34px 21px', gap: 34, zIndex: 1 }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p className="uppercase tracking-widest text-white/50" style={{ fontSize: 11, marginBottom: 8 }}>
                Controls
              </p>
              <h2 className="text-white font-semibold leading-tight" style={{ fontSize: 29 }}>
                Lens
              </h2>
            </div>

            <NavBtn onClick={() => setOpen(false)} label="Close lens controls" style={{ flexShrink: 0, marginTop: 4 }}>
              {/* Chevron right */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2L10 7L5 12" stroke="rgba(255,255,255,0.80)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </NavBtn>
          </div>

          {/* Surface selector */}
          <div>
            <p className="uppercase tracking-widest" style={{ fontSize: 11, color: 'rgba(255,255,255,0.50)', marginBottom: 10 }}>
              Surface
            </p>
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 4 }}>
              {(['squircle', 'circle', 'concave', 'lens'] as const).map(s => (
                <SurfaceBtn key={s} label={s} active={surface === s} onClick={() => onSurface(s)} />
              ))}
            </div>
          </div>

          {/* Displacement map thumbnail */}
          {mapDataUrl && (
            <div>
              <p className="uppercase tracking-widest" style={{ fontSize: 11, color: 'rgba(255,255,255,0.50)', marginBottom: 10 }}>
                Displacement Map
              </p>
              <img
                src={mapDataUrl}
                alt="displacement map"
                style={{
                  width: '100%',
                  borderRadius: 12,
                  display: 'block',
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.18)',
                  imageRendering: 'pixelated',
                }}
              />
            </div>
          )}

          {/* Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <SliderRow label="Size" value={size} min={80} max={400} onChange={onSize} unit="px" />
            <SliderRow label="Bezel" value={bezel} min={5} max={100} onChange={onBezel} unit="px" />
            <SliderRow label="Thickness" value={thickness} min={10} max={250} onChange={onThickness} />
            <SliderRow label="Blur" value={blurAmount} min={0} max={40} onChange={onBlur} unit="px" />
            <ToggleRow label="Displacement" value={displacement} onChange={onDisplacement} />
          </div>
        </div>
      </div>

      {/* Reopen button — only visible when panel is closed */}
      {!open && (
        <NavBtn onClick={() => setOpen(true)} label="Open lens controls" style={{ position: 'absolute', top: 21, right: 21, zIndex: 20 }}>
          {/* Chevron left */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </NavBtn>
      )}
    </>
  );
}
