import type { Rect } from '../lib/canvas';
import { fitAndScale } from '../lib/canvas';

type DrawOptions = { animate: boolean; speed: number };

function generateTriangles(depth: number): Array<[[number, number], [number, number], [number, number]]> {
  const L = 1;
  const h = (Math.sqrt(3) / 2) * L;
  const A: [number, number] = [0, 0];
  const B: [number, number] = [L, 0];
  const C: [number, number] = [L / 2, h];

  const result: Array<[[number, number], [number, number], [number, number]]> = [];
  function subdivide(a: [number, number], b: [number, number], c: [number, number], n: number) {
    if (n === 0) {
      result.push([a, b, c]);
      return;
    }
    const ab: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const bc: [number, number] = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2];
    const ca: [number, number] = [(c[0] + a[0]) / 2, (c[1] + a[1]) / 2];
    subdivide(a, ab, ca, n - 1);
    subdivide(ab, b, bc, n - 1);
    subdivide(ca, bc, c, n - 1);
  }
  subdivide(A, B, C, depth);
  return result;
}

export async function drawSierpinskiTriangle(
  ctx: CanvasRenderingContext2D,
  drawArea: Rect,
  depth: number,
  options: DrawOptions
) {
  const tris = generateTriangles(depth);
  const xs: number[] = []; const ys: number[] = [];
  for (const [[ax, ay], [bx, by], [cx, cy]] of tris) { xs.push(ax, bx, cx); ys.push(ay, by, cy); }
  const bbox = { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
  const { scale, offsetX, offsetY } = fitAndScale(bbox, drawArea);
  let i = 0;
  const step = Math.max(1, Math.floor(tris.length / Math.max(1, options.speed * 15)));
  function drawChunk() {
    const end = Math.min(tris.length, i + (options.animate ? step : tris.length));
    for (; i < end; i++) {
      const [[ax, ay], [bx, by], [cx, cy]] = tris[i];
      ctx.beginPath();
      ctx.moveTo(ax * scale + offsetX, ay * scale + offsetY);
      ctx.lineTo(bx * scale + offsetX, by * scale + offsetY);
      ctx.lineTo(cx * scale + offsetX, cy * scale + offsetY);
      ctx.closePath();
      ctx.stroke();
    }
    if (options.animate && i < tris.length) requestAnimationFrame(drawChunk);
  }
  drawChunk();
}


