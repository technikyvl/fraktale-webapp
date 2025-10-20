import type { Rect } from '../lib/canvas';

type DrawOptions = { animate: boolean; speed: number };

export async function drawMandelbrot(
  ctx: CanvasRenderingContext2D,
  drawArea: Rect,
  depth: number,
  _options: DrawOptions
) {
  // depth wykorzystamy jako mnożnik iteracji
  const maxIter = 50 + depth * 30;

  const img = ctx.createImageData(Math.floor(drawArea.w), Math.floor(drawArea.h));
  const data = img.data;

  const xMin = -2.5, xMax = 1.0;
  const yMin = -1.5, yMax = 1.5;

  let p = 0;
  for (let j = 0; j < drawArea.h; j++) {
    const y0 = yMin + (j / (drawArea.h - 1)) * (yMax - yMin);
    for (let i = 0; i < drawArea.w; i++) {
      const x0 = xMin + (i / (drawArea.w - 1)) * (xMax - xMin);
      let x = 0, y = 0, iter = 0;
      while (x * x + y * y <= 4 && iter < maxIter) {
        const xt = x * x - y * y + x0;
        y = 2 * x * y + y0;
        x = xt;
        iter++;
      }
      const t = iter === maxIter ? 0 : iter / maxIter;
      const r = Math.floor(9 * (1 - t) * t * t * t * 255);
      const g = Math.floor(15 * (1 - t) * (1 - t) * t * t * 255);
      const b = Math.floor(8.5 * (1 - t) * (1 - t) * (1 - t) * t * 255);
      data[p++] = r; data[p++] = g; data[p++] = b; data[p++] = 255;
    }
  }
  ctx.putImageData(img, drawArea.x, drawArea.y);
}


