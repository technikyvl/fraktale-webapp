// Płatek Kocha - rekurencyjne dzielenie odcinka na 4 części

interface Point {
  x: number;
  y: number;
}

const DEG60 = Math.PI / 3;

function rot(vx: number, vy: number, ang: number) {
  const c = Math.cos(ang), s = Math.sin(ang);
  return { x: vx * c - vy * s, y: vx * s + vy * c };
}

function d2(a: Point, b: Point) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function render(ctx: CanvasRenderingContext2D, depth: number): void {
  const dpr = (window.devicePixelRatio || 1);
  const canvasWidth = ctx.canvas.width / dpr;
  const canvasHeight = ctx.canvas.height / dpr;

  const margin = Math.min(canvasWidth, canvasHeight) * 0.08;
  const usable = Math.min(canvasWidth, canvasHeight) - 2 * margin;
  const size = Math.max(usable, 0);
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const height = (size * Math.sqrt(3)) / 2;
  
  // Wierzchołki trójkąta równobocznego (CCW)
  const pLeft: Point = { x: centerX - size / 2, y: centerY + height / 2 };
  const pRight: Point = { x: centerX + size / 2, y: centerY + height / 2 };
  const pTop: Point = { x: centerX, y: centerY - height / 2 };
  const center: Point = { x: centerX, y: centerY };
  
  ctx.beginPath();
  ctx.moveTo(pLeft.x, pLeft.y);
  kochSegment(ctx, pLeft, pRight, depth, center);
  kochSegment(ctx, pRight, pTop, depth, center);
  kochSegment(ctx, pTop, pLeft, depth, center);
  ctx.closePath();
  ctx.stroke();
}

function kochSegment(
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  depth: number,
  center: Point
): void {
  if (depth === 0) {
    ctx.lineTo(p2.x, p2.y);
    return;
  }

  const dx = (p2.x - p1.x) / 3;
  const dy = (p2.y - p1.y) / 3;
  const q: Point = { x: p1.x + dx, y: p1.y + dy };
  const r: Point = { x: p1.x + 2 * dx, y: p1.y + 2 * dy };

  const vx = r.x - q.x;
  const vy = r.y - q.y;
  const rp = rot(vx, vy, +DEG60);
  const rn = rot(vx, vy, -DEG60);
  const s1: Point = { x: q.x + rp.x, y: q.y + rp.y };
  const s2: Point = { x: q.x + rn.x, y: q.y + rn.y };
  const s: Point = (d2(s1, center) > d2(s2, center)) ? s1 : s2;

  kochSegment(ctx, p1, q, depth - 1, center);
  kochSegment(ctx, q, s, depth - 1, center);
  kochSegment(ctx, s, r, depth - 1, center);
  kochSegment(ctx, r, p2, depth - 1, center);
}
