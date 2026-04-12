# Liquid Glass

A physically-based liquid glass morphism effect for React. Refraction is computed using Snell's Law and rendered entirely through SVG displacement maps — no WebGL or animation loops required.

## How it works

The effect runs in two stages:

**1. Physics (CPU, one-time per config)**

A Canvas 2D pass generates two maps whenever the component config changes:

- **Displacement map** — each pixel's RG channels encode the X/Y refraction offset at that point. Computed by tracing rays through the glass surface using Snell's Law (N1 = 1.0 air, N2 = 1.5 glass) across a 128-sample lookup table.
- **Specular map** — a white-on-transparent overlay that adds the lit edge highlight, computed from the surface normal dotted against a fixed light direction.

**2. Rendering (GPU, CSS)**

The maps are fed into an SVG `<filter>` applied via `backdrop-filter`:

```
feImage (displacement map)
  → feGaussianBlur       (softens edges)
    → feDisplacementMap  (warps the backdrop)
      → feBlend          (screen-blends the specular highlight on top)
```

The only DOM overhead is one hidden `<svg>` per glass element.

## Browser support

The effect depends on SVG filters as `backdrop-filter`, which is currently **Chrome-only**. Firefox and Safari do not support this CSS feature.

The project works inside Chromium-based runtimes (Electron, etc.). In other browsers the glass layer renders invisibly — there is no fallback yet.

## Surface profiles

| Surface | Description |
|---------|-------------|
| `squircle` | Superellipse curve — the default, smooth and modern |
| `circle` | Standard circular curvature |
| `concave` | Bowl-shaped inversion — rays diverge outward, sampling content beyond the element edges |
| `lens` | Radial magnifying lens — smooth sine/cosine profile from centre to rim, no seam |

## Project structure

```
src/
├── components/
│   ├── liquidGlass.tsx          # Main component — SVG filter + styled div
│   ├── DraggableGlass.tsx       # Pointer-draggable wrapper around LiquidGlass
│   ├── LensControls.tsx         # Toggleable right-side panel: surface selector, displacement map preview, sliders
│   └── NavBtn.tsx               # Shared glass pill button used by nav and controls panels
├── hooks/
│   ├── useLiquidGlass.ts        # Generates displacement + specular maps, memoised by config
│   └── useDrag.ts               # Pointer capture drag hook
├── physics/
│   └── liquidGlass.physics.ts   # Snell's Law ray tracer, SDF maths, canvas map generators
├── types/
│   └── liquidGlass.types.ts     # Shared TypeScript interfaces
├── Layout.tsx                   # App shell: collapsible image-selector nav + background
├── ImageContext.tsx              # React context for the active background image
├── imageStore.ts                # Static image list
└── App.tsx                      # Demo: draggable lens + LensControls panel
```

## Getting started

```bash
npm install
npm run dev
```

## LiquidGlass component

```tsx
import { LiquidGlass } from './components/liquidGlass';

<LiquidGlass
  width={300}
  height={200}
  surface="squircle"   // 'squircle' | 'circle' | 'concave' | 'lens'
  bezel={25}           // rim width in px — affects refraction profile and specular
  thickness={80}       // overall refraction strength
  borderRadius={32}    // CSS border-radius
  blurAmount={10}      // backdrop blur before refraction (px); use 0 for lens
  refractionLevel={1}  // multiplier on displacement scale — safe to animate, no map rebuild
  specular             // show specular edge highlight (default true)
>
  {/* children render above the glass layer */}
</LiquidGlass>
```

## Tech stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- React Router 7
- Canvas 2D API (map generation)
- SVG filters (rendering)
