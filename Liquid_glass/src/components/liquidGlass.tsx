import type { LiquidGlassConfig } from '../types/liquidGlass.types';
import { useLiquidGlass } from '../hooks/useLiquidGlass';

interface Props extends LiquidGlassConfig {
  borderRadius?: number;
  refractionLevel?: number;
  specular?: boolean;
  /** Gaussian blur applied to the backdrop before refraction. Set to 0 for lens surfaces. */
  blurAmount?: number;
  children?: React.ReactNode;
  className?: string;
}

export function LiquidGlass({
  width,
  height,
  bezel,
  thickness,
  surface,
  borderRadius,
  refractionLevel = 1,
  specular = true,
  blurAmount = 20,
  children,
  className = '',
}: Props) {
  const r = borderRadius ?? height / 2;
  const { filterId, mapData } = useLiquidGlass({ width, height, bezel, thickness, surface, cornerRadius: r });
  const backdropFilter = `${blurAmount > 0 ? `blur(${blurAmount}px) ` : ''}url(#${filterId})`;

  return (
    <>
      <svg
        aria-hidden
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      >
        <defs>
          <filter
            id={filterId}
            x="0" y="0"
            width={width}
            height={height}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            {mapData && (
              <>
                <feImage
                  href={mapData.url}
                  x="0" y="0"
                  width={width}
                  height={height}
                  preserveAspectRatio="none"
                  result="dmap"
                />
                <feGaussianBlur in="dmap" stdDeviation="3" result="blurredDmap" />
              </>
            )}
            <feDisplacementMap
              in="SourceGraphic"
              in2="blurredDmap"
              scale={(mapData?.scale ?? 0) * refractionLevel}
              xChannelSelector="R"
              yChannelSelector="G"
              result="refracted"
            />

            {specular && mapData && (
              <>
                <feImage
                  href={mapData.specularUrl}
                  x="0" y="0"
                  width={width}
                  height={height}
                  preserveAspectRatio="none"
                  result="specular"
                />
                <feBlend in="refracted" in2="specular" mode="screen" />
              </>
            )}
          </filter>
        </defs>
      </svg>

      <div
        className={`relative ${className}`}
        style={{ width, height, borderRadius: r }}
      >
        <div
          className="absolute inset-0"
          style={{
            borderRadius: r,
            backdropFilter,
            WebkitBackdropFilter: backdropFilter,
            background: 'rgba(255,255,255,0.10)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
          }}
        />

        <div className="relative z-10 flex h-full w-full items-center justify-center">
          {children}
        </div>
      </div>
    </>
  );
}
