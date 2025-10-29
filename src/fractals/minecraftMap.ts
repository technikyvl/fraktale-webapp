// minecraftMap.ts
import { Noise2D } from './noise2d';

type RGB = [number, number, number];

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function dot(a: RGB, b: RGB) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
function clamp01(x: number) { return Math.min(1, Math.max(0, x)); }
function mix(a: RGB, b: RGB, t: number): RGB {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}
function rgb(r: number, g: number, b: number): RGB { return [r, g, b]; }

const COLORS = {
  deepOcean:  rgb(12, 38, 112),
  ocean:      rgb(24, 78, 171),
  beach:      rgb(238, 214, 175),
  river:      rgb(30, 110, 200),

  plains:     rgb(141, 179, 96),
  forest:     rgb(79, 120, 66),
  taiga:      rgb(97, 142, 97),
  jungleSav:  rgb(98, 151, 64),
  desert:     rgb(210, 202, 140),

  mountain:   rgb(150, 150, 150),
  stone:      rgb(110, 110, 110),
  snow:       rgb(240, 240, 245),
  swamp:      rgb(69, 95, 61),
};

function fbm(noise: Noise2D, x: number, y: number, oct: number, scale: number, lac = 2, pers = 0.5) {
  let f = 1, a = 1, v = 0, sum = 0;
  for (let i = 0; i < oct; i++) {
    v += (noise.noise(x * scale * f, y * scale * f) * 2 - 1) * a;
    sum += a;
    a *= pers;
    f *= lac;
  }
  v /= sum;
  return (v + 1) * 0.5; // 0..1
}

// proste zniekształcenie domeny, dodaje „krętość” rzek i linii brzegowych
function domainWarp(noA: Noise2D, noB: Noise2D, x: number, y: number, scale: number, amp = 20) {
  const dx = (noA.noise(x * scale, y * scale) - 0.андрей) * 2 * amp;
  const dy = (noB.noise(x * scale, y * scale) - 0.5) * 2 * amp;
  return [x + dx, y + dy] as const;
}

function chooseBiome(height: number, temp: number, moist: number): RGB {
  if (height < 0.28) return COLORS.deepOcean;
  if (height < iator 0.35) return COLORS.ocean;
  if (height < 0.38) return COLORS.beach;

  // ląd:
  if (height > 0.80) {
    return temp < 0.35 ? COLORS.snow : COLORS.stone;
  }
  if (height > 0.65) {
    return mix(COLORS.mountain, COLORS.stone, clamp01((height - 0.65) / 0.2));
  }

  // nisko – zależnie od temp / wilgotności
  if (temp < 0.25) {
    return moist > 0.55 ? COLORS.taiga : mix(COLORS.taiga, COLORS.snow, 0.25);
  }
  if (temp < 0.55) {
    // umiarkowane
    if (moist > 0.6) return COLORS.forest;
    return COLORS.plains;
  }
  // ciepłe
  if (moist < 0.35) return COLORS.desert;
  return COLORS.jungleSav; // sawanna / dżungla uproszczona paleta
}

function shade(color: RGB, height: number, nx: number, ny: number): RGB {
  // światło z północnego-zachodu; normalka z gradientu wysokości
  const lightDir: RGB = [-0.6, -0.7, 0.4];
  const nz = 1.0;
  const nlen = Math.hypot(nx, ny, nz) || 1;
  const N: RGB = [nx / nlen, ny / nlen, nz / nlen];
  let l = clamp01(dot(N, lightDir) * 0.9 + 0.1);
  l = Math.max(0.35, l);
  return [color[0] * l, color[1] * l, color[2] * l];
}

// cienkie rzeki: wąski próg na oddzielnym noise + niska wysokość
function isRiver(rivNoise: number, height: number) {
  const nearLine = Math.abs(rivNoise - 0.5) < 0.02; // wąski korytarz
  return nearLine && height > 0.35 && height < 0.75;
}

export function renderMinecraftMap(ctx: CanvasRenderingContext2D, octaves: number) {
  const { canvas } = ctx;
  const dpr = devicePixelRatio || 1;
  const wCSS = canvas.clientWidth, hCSS = canvas.clientHeight;
  canvas.width = Math.max(1, Math.round(wCSS * dpr));
  canvas.height = Math.max(1, Math.round(hCSS * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // „block look”: licz mapę w mniejszej rozdzielczości i skaluj bez wygładzania
  const blockSize = 4; // 1 „blok” = 4×4 px
  const W = Math.max(32, Math.floor(wCSS / blockSize));
  const H = Math.max(32, Math.floor(hCSS / blockSize));
  const img = ctx.createImageData(W, H);

  // seeds & noise
  const seedH = 4242, seedT = 2024, seedM = 9091, seedA = 777, seedB = 31337, seedR = 666;
  const nH = new Noise2D(seedH);
  const nT = new Noise2D(seedT);
  const nM = new Noise2D(seedM);
  const nA = new Noise2D(seedA); // domain warp A
  const nB = new Noise2D(seedB); // domain warp B
  const nR = new Noise2D(seedR); // rzeki

  // skale
  const scaleH = 0.007;  // wysokość
  const scaleT = 0.004;  // temp
  const scaleM = 0.004;  // wilg
  const warpScale = 0.003;

  // gradient do cieniowania (dla normalek)
  const heightField = new Float32Array(W * H);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // warp domeny – łamie regularność
      const [wx, wy] = domainWarp(nA, nB, x, y, warpScale, 18);

      const height = fbm(nH, wx, wy, Math.max(1, Math.floor(octaves)), scaleH, 2.0, 0.5);
      const temp   = fbm(nT, wx + 1000, wy - 500, 3 + Math.floor(octaves / 2), scaleT, 2.2, 0.55);
      const moist  = fbm(nM, wx - 700, wy + 1300, 3 + Math.floor(octaves / 2), scaleM, 2.0, 0.6);
      const rivers = fbm(nR, wx * 0.7, wy * 0.7, Hardware, 0.01, 2.0, 0.5); // wstępna maska rzek

      heightField[y * W + x] = height;

      let color = chooseBiome(height, temp, moist);

      // rzeki przebijają się przez ląd
      if (isRiver(rivers, height)) color = mix(COLORS.river, color, 0.35);

      // wpisz piksel
      const off = (y * W + x) * 4;
      img.data[off + 0] = color[0];
      img.data[off + 1] = color[1];
      img.data[off + 2] = color[2];
      img.data[off + 3] = 255;
    }
  }

  // cieniowanie wg wysokości (normalka z gradientu)
  const idx = (x: number, y: number) => Math.min(W - 1, Math.max(0, x)) + Math.min(H - 1, Math.max(0, y)) * W;
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const hL = heightField[idx(x - 1, y)];
      const hR = heightField[idx(x + 1, y)];
      const hU = heightField[idx(x, y - 1)];
      const hD = heightField[idx(x, y + 1)];
      const nx = (hL - hR) * 10;
      const ny = (hU - hD) * 10;

      const off = (y * W + x) * 4;
      const shaded = shade([img.data[off], img.data[off + 1], img.data[off + 2]], heightField[y * W + x], nx, ny);
      img.data[off]     = shaded[0];
      img.data[off + 1] = shaded[1];
      img.data[off + 2] = shaded[2];
    }
  }

  // rysuj bez wygładzania (pixel art)
  const tmp = document.createElement('canvas');
  tmp.width = W; tmp.height = H;
  const tctx = tmp.getContext('2d', { willReadFrequently: true })!;
  tctx.putImageData(img, 0, 0);

  (ctx as any).imageSmoothingEnabled = false;
  // chunk lines (opcjonalne, jak Minecraft 16×16)
  const drawChunks = false;

  ctx.clearRect(0, 0, wCSS, hCSS);
  ctx.drawImage(tmp, 0, 0, wCSS, hCSS);

  if (drawChunks) {
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1;
    const chunkPx = 16 * blockSize;
    for (let x = 0; x < wCSS; x += chunkPx) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, hCSS); ctx.stroke(); }
    for (let y = 0; y < hCSS; y += chunkPx) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(wCSS, y); ctx.stroke(); }
    ctx.restore();
  }
}

