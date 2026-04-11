const N1 = 1.0, N2 = 1.5, SAMPLES = 128;

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D, ImageData] {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx, ctx.createImageData(w, h)];
}

type SurfaceFn = (x: number) => number;

export const surfaces: Record<string, SurfaceFn> = {
squircle: x => Math.pow(1 - Math.pow(1 - x, 2.8), 1 / 2.8),
  circle:   x => Math.sqrt(1 - Math.pow(Math.max(0, 1 - x), 2)),
  concave:  x => 1 - Math.pow(1 - Math.pow(Math.max(0, 1 - x), 4), 0.25),
};

function buildTable(fn: SurfaceFn): number[] {
  return Array.from({ length: SAMPLES }, (_, i) => {
    const d = i / (SAMPLES - 1);
    const eps = 0.0001;
    const slope = (fn(Math.min(1, d + eps)) - fn(Math.max(0, d - eps))) / (2 * eps);
    const phi = Math.atan(Math.abs(slope));
    const sinPhi = Math.sin(phi), cosPhi = Math.cos(phi);
    const sinR = (N1 / N2) * sinPhi;
    if (sinR > 1) return 0;
    const cosR = Math.sqrt(1 - sinR * sinR);
    return Math.max(0, sinPhi * cosR - cosPhi * sinR);
  });
}

function sdf(px: number, py: number, cx: number, cy: number, hw: number, hh: number, r: number) {
  const dx = Math.abs(px - cx) - hw + r;
  const dy = Math.abs(py - cy) - hh + r;
  if (dx <= 0 && dy <= 0) return Math.max(dx, dy) - r;
  if (dx > 0 && dy > 0) return Math.sqrt(dx * dx + dy * dy) - r;
  return Math.max(dx, dy) - r;
}

function sdfGrad(px: number, py: number, cx: number, cy: number, hw: number, hh: number, r: number): [number, number] {
  const ax = px - cx, ay = py - cy;
  const dx = Math.abs(ax) - hw + r, dy = Math.abs(ay) - hh + r;
  const sx = ax >= 0 ? 1 : -1, sy = ay >= 0 ? 1 : -1;
  if (dx > 0 && dy > 0) {
    const len = Math.sqrt(dx * dx + dy * dy);
    return [dx * sx / len, dy * sy / len];
  }
  return dx > dy ? [sx, 0] : [0, sy];
}

const LIGHT: [number, number] = [0.7071, 0.7071];

function generateSpecularMap(
  w: number, h: number, bezel: number, cornerRadius?: number,
): string {
  const [canvas, ctx, img] = makeCanvas(w, h);
  const data = img.data;
  const cx = w / 2, cy = h / 2;

  const outerHW = w / 2, outerHH = h / 2;
  const r       = cornerRadius ?? Math.min(outerHW, outerHH);
  const innerHW = Math.max(0, outerHW - bezel);
  const innerHH = Math.max(0, outerHH - bezel);
  const innerR  = Math.max(0, r - bezel);

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const i = (py * w + px) * 4;
      data[i] = data[i + 1] = data[i + 2] = 255; // white highlight

      const dOuter = -sdf(px, py, cx, cy, outerHW, outerHH, r);
      const dInner = -sdf(px, py, cx, cy, innerHW, innerHH, innerR);

      // Only light up the bezel band (outside inner rect, inside outer rect)
      if (dOuter <= 0 || dInner > 0) { data[i + 3] = 0; continue; }

      const t = Math.min(1, dOuter / bezel);
      const [gx, gy] = sdfGrad(px, py, cx, cy, outerHW, outerHH, r);
      const dot      = Math.max(0, -(gx * LIGHT[0] + gy * LIGHT[1]));
      const edgeFade = Math.sin(t * Math.PI);
      data[i + 3]    = Math.round(Math.pow(dot, 2) * edgeFade * 15);
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

function generateLensSpecularMap(w: number, h: number, bezel: number): string {
  const [canvas, ctx, img] = makeCanvas(w, h);
  const data = img.data;
  const cx = w / 2, cy = h / 2;
  const R = Math.min(w, h) / 2;
  const rimStart = R - bezel;

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const dx = px - cx, dy = py - cy;
      const r = Math.sqrt(dx * dx + dy * dy);
      const i = (py * w + px) * 4;
      data[i] = data[i + 1] = data[i + 2] = 255;
      if (r >= R || r < rimStart) { data[i + 3] = 0; continue; }
      const nx = dx / r, ny = dy / r;
      const dot = Math.max(0, -(nx * LIGHT[0] + ny * LIGHT[1]));
      const t = (r - rimStart) / bezel;
      const edgeFade = Math.sin(t * Math.PI);
      data[i + 3] = Math.round(dot * dot * edgeFade * 15);
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

export function generateLensMap(
  w: number, h: number, thickness: number, bezel: number = 20
): { url: string; scale: number; specularUrl: string } {
  const [canvas, ctx, img] = makeCanvas(w, h);
  const data = img.data;
  const cx = w / 2, cy = h / 2;
  const R = Math.min(w, h) / 2;

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const dx = px - cx, dy = py - cy;
      const r = Math.sqrt(dx * dx + dy * dy);
      const i = (py * w + px) * 4;

      if (r >= R || r < 0.5) {
        data[i] = data[i + 1] = data[i + 2] = 128; data[i + 3] = 255; continue;
      }

      const t = r / R;
      const mag = Math.sin(t * Math.PI / 2) * 0.7;
      const nx = dx / r, ny = dy / r;

      data[i]     = Math.round(128 - nx * mag * 127);
      data[i + 1] = Math.round(128 - ny * mag * 127);
      data[i + 2] = 128; data[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  return {
    url: canvas.toDataURL(),
    scale: thickness,
    specularUrl: generateLensSpecularMap(w, h, bezel),
  };
}

export function generateDisplacementMap(
  w: number, h: number, bezel: number, thickness: number, fn: SurfaceFn,
  cornerRadius?: number,
): { url: string; scale: number; specularUrl: string } {
  const [canvas, ctx, img] = makeCanvas(w, h);
  const data = img.data;
  const cx = w / 2, cy = h / 2;

  const outerHW = w / 2, outerHH = h / 2;
  const r       = cornerRadius ?? Math.min(outerHW, outerHH);
  const innerHW = Math.max(0, outerHW - bezel);
  const innerHH = Math.max(0, outerHH - bezel);
  const innerR  = Math.max(0, r - bezel);

  const table  = buildTable(fn);
  const maxMag = (table.reduce((a, b) => Math.max(a, b), 0) || 0.001) * thickness;

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const i = (py * w + px) * 4;
      const dOuter = -sdf(px, py, cx, cy, outerHW, outerHH, r);

      if (dOuter <= 0) {
        data[i] = data[i + 1] = data[i + 2] = 128; data[i + 3] = 255; continue;
      }

      const dInner = -sdf(px, py, cx, cy, innerHW, innerHH, innerR);

      if (dInner > 0) {
        data[i] = data[i + 1] = data[i + 2] = 128; data[i + 3] = 255; continue;
      }

      const t          = Math.min(1, dOuter / bezel);
      const scaled     = t * (SAMPLES - 1);
      const ti         = Math.min(SAMPLES - 2, Math.floor(scaled));
      const frac       = scaled - ti;
      const tableValue = table[ti] * (1 - frac) + table[ti + 1] * frac;
      const nm         = (tableValue * thickness) / maxMag;
      const [gx, gy]   = sdfGrad(px, py, cx, cy, outerHW, outerHH, r);
      const falloff    = Math.sin(t * Math.PI);

      data[i]     = Math.round(128 + gx * nm * 127 * falloff);
      data[i + 1] = Math.round(128 + gy * nm * 127 * falloff);
      data[i + 2] = 128; data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  return {
    url: canvas.toDataURL(),
    scale: maxMag,
    specularUrl: generateSpecularMap(w, h, bezel, cornerRadius),
  };
}
