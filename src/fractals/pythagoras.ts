// Drzewo Pitagorasa 45° – skalowane i centrowane względem canvasa

interface Pt { x: number; y: number; }

function rot(p: Pt, ang: number): Pt {
  const c = Math.cos(ang), s = Math.sin(ang);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c };
}
function sub(a: Pt, b: Pt): Pt { return { x: a.x - b.x, y: a.y - b.y }; }
function add(a: Pt, b: Pt): Pt { return { x: a.x + b.x, y: a.y + b.y }; }
function mul(a: Pt, k: number): Pt { return { x: a.x * k, y: a.y * k }; }
function len(v: Pt): number { return Math.hypot(v.x, v.y); }
function norm(v: Pt): Pt { const L = len(v) || 1; return { x: v.x / L, y: v.y / L }; }

function branch(ctx: CanvasRenderingContext2D, p1: Pt, p2: Pt, depth: number) {
  const v = sub(p2, p1);
  const s = len(v);
  if (s <= 0) return;

  // normalna "w górę" ekranu (na zewnątrz)
  const n = rot(norm(v), -Math.PI / 2);

  const p3 = add(p2, mul(n, s));
  const p4 = add(p1, mul(n, s));

  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(p4.x, p4.y);
  ctx.closePath();
  ctx.stroke();

  if (depth === 0) return;

  // Trójkąt prostokątny równoramienny nad krawędzią p4->p3
  const b = sub(p3, p4);
  const peak = add(p4, mul(rot(norm(b), -Math.PI / 4), s / Math.SQRT2));

  // Dzieci: lewa i prawa gałąź
  branch(ctx, p4, peak, depth - 1);
  branch(ctx, peak, p3, depth - 1);
}

export function render(ctx: CanvasRenderingContext2D, depth: number): void {
  if (depth < 0) return;

  const dpr = (window.devicePixelRatio || 1);
  const w = ctx.canvas.width / dpr;
  const h = ctx.canvas.height / dpr;

  const pad = Math.min(w, h) * 0.08;
  const HEIGHT_FACTOR = 5.0; // konserwatywny zapas na całą koronę
  const scale = 0.7; // dodatkowy współczynnik zmniejszenia
  const baseSideRaw = Math.min((w - 2 * pad), (h - 2 * pad) / HEIGHT_FACTOR);
  const baseSide = baseSideRaw * scale;

  // Wyśrodkowanie: oblicz szacunkową wysokość drzewa i wycentruj pionowo
  const estimatedHeight = baseSide * HEIGHT_FACTOR;
  const verticalCenter = h / 2;
  const yBase = verticalCenter + estimatedHeight / 2 - baseSide;
  const x1 = (w - baseSide) / 2;
  const topY = yBase - baseSide;

  // Bazowy kwadrat (dla spójności rysunku)
  ctx.beginPath();
  ctx.rect(x1, topY, baseSide, baseSide);
  ctx.stroke();

  // Rekurencja startuje od górnej krawędzi bazowego kwadratu
  const p1: Pt = { x: x1, y: topY };
  const p2: Pt = { x: x1 + baseSide, y: topY };
  branch(ctx, p1, p2, depth);
}
