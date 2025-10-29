type RNG = () => number;

// Prosty noise oparty na sin – tylko demonstracyjnie
function noise2D(x: number, y: number, seed: number): number {
  const s = Math.sin(x * 12.9898 + y * 78.233 + seed * 43758.5453) * 43758.5453;
  return s - Math.floor(s); // [0,1)
}

function fbm(
  w: number, h: number,
  octaves: number,
  scale = 0.008,
  persistence = 0.5,
  lacunarity = 2.0,
  seed = 42
): Float32Array {
  const out = new Float32Array(w * h);
  let min = Infinity, max = -Infinity;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let amp = 1, freq = 1, val = 0;
      for (let o = 0; o < octaves; o++) {
        const nx = x * scale * freq;
        const ny = y * scale * freq;
        val += (noise2D(nx, ny, seed) * 2 - 1) * amp;
        amp *= persistence;
        freq *= lacunarity;
      }
      out[y * w + x] = val;
      min = Math.min(min, val);
      max = Math.max(max, val);
    }
  }
  const range = Math.max(1e-6, max - min);
  for (let i = 0; i < out.length; i++) out[i] = (out[i] - min) / range;
  return out;
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
function lerpRGB(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function terrainColor(t: number): [number, number, number] {
  if (t < 0.35) {
    const u = t / 0.35;
    return lerpRGB([30, 60, 150], [220, 205, 160], smoothstep(0, 1, u));
  } else if (t < 0.6) {
    const u = (t - 0.35) / 0.25;
    return lerpRGB([90, 160, 60], [40, 120, 40], smoothstep(0, 1, u));
  } else if (t < 0.8) {
    const u = (t - 0.6) / 0.2;
    return lerpRGB([110, 110, 110], [170, 170, 170], smoothstep(0, 1, u));
  } else {
    const u = (t - 0.8) / 0.2;
    return lerpRGB([200, 200, 210], [245, 245, 250], smoothstep(0, 1, u));
  }
}

function shadeHeightfield(hf: Float32Array, w: number, h: number, lightDir: [number, number, number] = [-0.6, -0.7, 0.4]) {
  const L = Math.hypot(...lightDir) || 1;
  const [Lx, Ly, Lz] = lightDir.map(v => v / L) as [number, number, number];
  const img = new Uint8ClampedArray(w * h * 4);
  const dz = 8;
  const idx = (x: number, y: number) => Math.min(w - 1, Math.max(0, x)) + Math.min(h - 1, Math.max(0, y)) * w;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const hL = hf[idx(x - 1, y)];
      const hR = hf[idx(x + 1, y)];
      const hU = hf[idx(x, y - 1)];
      const hD = hf[idx(x, y + 1)];

      const nx = (hL - hR) * dz;
      const ny = (hU - hD) * dz;
      const nz = 1.0;
      const nLen = Math.hypot(nx, ny, nz) || 1;
      const nX = nx / nLen, nY = ny / nLen, nZ = nz / nLen;
      let light = nX * Lx + nY * Ly + nZ * Lz;
      light = Math.max(0.2, light);

      const t = hf[i];
      const [r, g, b] = terrainColor(t);
      const off = i * 4;
      img[off + 0] = Math.round(r * light);
      img[off + 1] = Math.round(g * light);
      img[off + 2] = Math.round(b * light);
      img[off + 3] = 255;
    }
  }

  // poziomice co 0.1
  const step = 0.1;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const t = hf[y * w + x];
      const frac = Math.abs((t / step) - Math.round(t / step));
      if (frac < 0.015) {
        const off = (y * w + x) * 4;
        img[off] = Math.min(255, img[off] + 18);
        img[off + 1] = Math.min(255, img[off + 1] + 18);
        img[off + 2] = Math.min(255, img[off + 2] + 18);
      }
    }
  }

  return new ImageData(img, w, h);
}

export function renderMinecraftFBM(ctx: CanvasRenderingContext2D, octaves: number) {
  const { canvas } = ctx;
  const dpr = globalThis.devicePixelRatio || 1;
  const wCSS = canvas.clientWidth, hCSS = canvas.clientHeight;
  if (canvas.width !== Math.round(wCSS * dpr) || canvas.height !== Math.round(hCSS * dpr)) {
    canvas.width = Math.round(wCSS * dpr);
    canvas.height = Math.round(hCSS * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const W = Math.floor(wCSS);
  const H = Math.floor(hCSS);

  const hf = fbm(W, H, Math.max(1, Math.floor(octaves)), 0.008);
  const img = shadeHeightfield(hf, W, H);
  ctx.putImageData(img, 0, 0);
}


