// Trójkąt Sierpińskiego - rekurencyjne usuwanie środkowego trójkąta

interface Point {
  x: number;
  y: number;
}

export function render(ctx: CanvasRenderingContext2D, depth: number): void {
  const size = 650;
  const centerX = 360;
  const centerY = 360;
  const height = (size * Math.sqrt(3)) / 2;
  
  const top: Point = { x: centerX, y: centerY - (2 * height) / 3 };
  const left: Point = { x: centerX - size / 2, y: centerY + height / 3 };
  const right: Point = { x: centerX + size / 2, y: centerY + height / 3 };
  
  sierpinski(ctx, top, left, right, depth);
}

function sierpinski(
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  p3: Point,
  depth: number
): void {
  if (depth === 0) {
    // Base case: wypełnij trójkąt
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.fill();
  } else {
    // Podziel trójkąt na 3 mniejsze
    const mid1: Point = {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    };
    const mid2: Point = {
      x: (p2.x + p3.x) / 2,
      y: (p2.y + p3.y) / 2
    };
    const mid3: Point = {
      x: (p1.x + p3.x) / 2,
      y: (p1.y + p3.y) / 2
    };
    
    // Rekurencja: narysuj 3 mniejsze trójkąty
    sierpinski(ctx, p1, mid1, mid3, depth - 1);
    sierpinski(ctx, mid1, p2, mid2, depth - 1);
    sierpinski(ctx, mid3, mid2, p3, depth - 1);
  }
}
