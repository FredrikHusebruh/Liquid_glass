import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ImageProvider, useImage } from './ImageContext';
import { LiquidGlass } from './components/liquidGlass';
import { IMAGES } from './imageStore';

const BTN = 36;

function NavBtn({ onClick, style, label, children }: {
  onClick: () => void;
  style?: React.CSSProperties;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', ...style }}
    >
      <LiquidGlass width={BTN} height={BTN} surface="squircle" bezel={8} thickness={40} borderRadius={10} blurAmount={5}>
        {children}
      </LiquidGlass>
    </button>
  );
}

function LayoutInner() {
  const { activeId, setActiveId, activeSrc } = useImage();
  const navRef = useRef<HTMLDivElement>(null);
  const [navSize, setNavSize] = useState({ width: 0, height: 0 });
  const [navOpen, setNavOpen] = useState(true);

  useEffect(() => {
    if (!navRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setNavSize({ width: Math.round(width), height: Math.round(height) });
    });
    ro.observe(navRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url(${activeSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Nav panel — measured, then LiquidGlass fills it absolutely */}
      <div
        ref={navRef}
        className="absolute flex flex-col"
        style={{
          top: 21, left: 21, bottom: 21, width: 'calc(39% - 21px)', zIndex: 10,
          transform: navOpen ? 'translateX(0)' : 'translateX(calc(-100% - 21px))',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* LiquidGlass background layer */}
        {navSize.width > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            <LiquidGlass
              width={navSize.width}
              height={navSize.height}
              surface="squircle"
              bezel={25}
              thickness={100}
              borderRadius={32}
              blurAmount={3}
            />
          </div>
        )}

        {/* Nav content sits above the glass */}
        <div
          className="relative flex flex-col h-full"
          style={{ padding: '34px 21px', gap: 34, zIndex: 1 }}
        >
          {/* Header — title left, toggle right */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p className="uppercase tracking-widest text-white/50" style={{ fontSize: 11, marginBottom: 8 }}>
                Gallery
              </p>
              <h1 className="text-white font-semibold leading-tight" style={{ fontSize: 29 }}>
                Select Image
              </h1>
            </div>

            <NavBtn onClick={() => setNavOpen(false)} label="Close navigation" style={{ flexShrink: 0, marginTop: 4 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7L9 12" stroke="rgba(255,255,255,0.80)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </NavBtn>
          </div>

          {/* Image list */}
          <div className="flex flex-col overflow-y-auto" style={{ gap: 4, flex: 1 }}>
            {IMAGES.map(img => {
              const active = img.id === activeId;
              return (
                <button
                  key={img.id}
                  onClick={() => setActiveId(img.id)}
                  className="flex items-center text-left"
                  style={{
                    gap: 13,
                    padding: '10px 13px',
                    background: active ? 'rgba(255,255,255,0.14)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: 12,
                    /* Selection chip is itself glassy: top-edge specular + blur */
                    backdropFilter: active ? 'blur(8px)' : 'none',
                    WebkitBackdropFilter: active ? 'blur(8px)' : 'none',
                    boxShadow: active
                      ? 'inset 0 1px 0 rgba(255,255,255,0.45), inset 0 0 0 0.5px rgba(255,255,255,0.22)'
                      : 'none',
                    transition: 'background 0.2s, box-shadow 0.2s',
                    width: '100%',
                  }}
                >
                  {/* Preview thumbnail — gradient fallback ensures Hero row is never empty */}
                  <div
                    style={{
                      width: 55,
                      height: 34,
                      borderRadius: 8,
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(180,210,255,0.15) 100%)',
                      boxShadow: active
                        ? '0 0 0 1.5px rgba(255,255,255,0.70)'
                        : '0 0 0 0.5px rgba(255,255,255,0.22)',
                      transition: 'box-shadow 0.2s',
                    }}
                  >
                    <img src={img.src} alt={img.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>

                  {/* Label — always near-white; active is full white, inactive 65% */}
                  <span
                    className="font-medium transition-colors"
                    style={{ fontSize: 18, color: active ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.65)' }}
                  >
                    {img.label}
                  </span>

                  {/* Active glow dot */}
                  {active && (
                    <div
                      className="ml-auto rounded-full"
                      style={{
                        width: 6,
                        height: 6,
                        background: 'rgba(255,255,255,0.90)',
                        flexShrink: 0,
                        marginRight: 4,
                        boxShadow: '0 0 6px rgba(255,255,255,0.80)',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reopen button — only visible when nav is collapsed */}
      {!navOpen && (
        <NavBtn onClick={() => setNavOpen(true)} label="Open navigation" style={{ position: 'absolute', top: 21, left: 21, zIndex: 20 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <line x1="2" y1="4" x2="12" y2="4" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" strokeLinecap="round"/>
            <line x1="2" y1="7" x2="12" y2="7" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" strokeLinecap="round"/>
            <line x1="2" y1="10" x2="12" y2="10" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </NavBtn>
      )}

      {/* Main content — expands to full width when nav is hidden */}
      <div
        className="absolute top-0 right-0 h-full"
        style={{
          left: navOpen ? '39%' : 0,
          transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}

export default function Layout() {
  return (
    <ImageProvider>
      <LayoutInner />
    </ImageProvider>
  );
}
