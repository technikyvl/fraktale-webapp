import type { Rect } from '../lib/canvas';
import { fitAndScale } from '../lib/canvas';

type DrawOptions = { animate: boolean; speed: number };

// Generuje punkty płatka Kocha jako lista segmentów (x1,y1,x2,y2)
function generateKochSegments(depth: number): Array<[number, number, number, number]> {
  // Bazowy trójkąt równoboczny o boku L = 1, wpisany w współrzędne 2D
  const L = 1;
  const h = (Math.sqrt(3) / 2) * L;
  const A: [number, number] = [0, 0];
  const B: [number, number] = [L, 0];
  const C: [number, number] = [L / 2, h];

  const edges: Array<[number, number, number, number]> = [
    [A[0], A[1], B[0], B[1]],
    [B[0], B[1], C[0], C[1]],
    [C[0], C[1], A[0], A[1]],
  ];

  function subdivide(x1: number, y1: number, x2: number, y2: number, n: number, out: Array<[number, number, number, number]>) {
    if (n === 0) {
      out.push([x1, y1, x2, y2]);
      return;
    }
    const dx = x2 - x1;
    const dy = y2 - y1;
    const xA = x1 + dx / 3;
    const yA = y1 + dy / 3;
    const xB = x1 + (2 * dx) / 3;
    const yB = y1 + (2 * dy) / 3;

    // Punkt szczytowy trójkąta równobocznego na zewnątrz segmentu
    const angle = Math.atan2(dy, dx) - Math.PI / 3;
    const len = Math.hypot(dx, dy) / 3;
    const xPeak = xA + Math.cos(angle) * len;
    const yPeak = yA + Math.sin(angle) * len;

    subdivide(x1, y1, xA, yA, n - 1, out);
    subdivide(xA, yA, xPeak, yPeak, n - 1, out);
    subdivide(xPeak, yPeak, xB, yB, n - 1, out);
    subdivide(xB, yB, x2, y2, n - 1, out);
  }

  const result: Array<[number, number, number, number]> = [];
  for (const [x1, y1, x2, y2] of edges) subdivide(x1, y1, x2, y2, depth, result);
  return result;
}

export async function drawKochSnowflake(
  ctx: CanvasRenderingContext2D,
  drawArea: Rect,
  depth: number,
  options: DrawOptions
) {
  const segments = generateKochSegments(depth);

  // Oblicz bbox w układzie bazowym (L=1)
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [x1, y1, x2, y2] of segments) {
    xs.push(x1, x2);
    ys.push(y1, y2);
  }
  const bbox = {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };

  const { scale, offsetX, offsetY } = fitAndScale(bbox, drawArea);

  // Rysowanie z animacją lub bez
  ctx.beginPath();
  let i = 0;
  const step = Math.max(1, Math.floor(segments.length / Math.max(1, options.speed * 15)));

  function drawChunk() {
    const end = Math.min(segments.length, i + (options.animate ? step : segments.length));
    for (; i < end; i++) {
      const [x1, y1, x2, y2] = segments[i];
      const sx1 = x1 * scale + offsetX;
      const sy1 = y1 * scale + offsetY;
      const sx2 = x2 * scale + offsetX;
      const sy2 = y2 * scale + offsetY;
      ctx.moveTo(sx1, sy1);
      ctx.lineTo(sx2, sy2);
    }
    ctx.stroke();
    if (options.animate && i < segments.length) {
      requestAnimationFrame(drawChunk);
    }
  }
  drawChunk();
}


