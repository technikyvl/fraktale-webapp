import type { Rect } from '../lib/canvas';
import { fitAndScale } from '../lib/canvas';

type DrawOptions = { animate: boolean; speed: number };

function generateTree(depth: number, angle: number = Math.PI / 6, shrink: number = 0.67) {
  const segments: Array<[number, number, number, number]> = [];
  function branch(x: number, y: number, len: number, dir: number, n: number) {
    const x2 = x + Math.cos(dir) * len;
    const y2 = y - Math.sin(dir) * len;
    segments.push([x, y, x2, y2]);
    if (n === 0) return;
    branch(x2, y2, len * shrink, dir + angle, n - 1);
    branch(x2, y2, len * shrink, dir - angle, n - 1);
  }
  branch(0, 0, 1, Math.PI / 2, depth);
  return segments;
}

export async function drawFractalTree(
  ctx: CanvasRenderingContext2D,
  drawArea: Rect,
  depth: number,
  options: DrawOptions
) {
  const segments = generateTree(depth);
  const xs: number[] = []; const ys: number[] = [];
  for (const [x1, y1, x2, y2] of segments) { xs.push(x1, x2); ys.push(y1, y2); }
  const bbox = { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
  const { scale, offsetX, offsetY } = fitAndScale(bbox, drawArea);
  let i = 0;
  const step = Math.max(1, Math.floor(segments.length / Math.max(1, options.speed * 15)));
  function drawChunk() {
    const end = Math.min(segments.length, i + (options.animate ? step : segments.length));
    ctx.beginPath();
    for (; i < end; i++) {
      const [x1, y1, x2, y2] = segments[i];
      ctx.moveTo(x1 * scale + offsetX, y1 * scale + offsetY);
      ctx.lineTo(x2 * scale + offsetX, y2 * scale + offsetY);
    }
    ctx.stroke();
    if (options.animate && i < segments.length) requestAnimationFrame(drawChunk);
  }
  drawChunk();
}


