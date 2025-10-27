// Płatek Kocha - rekurencyjne dzielenie odcinka na 4 części

interface Point {
  x: number;
  y: number;
}

export function render(ctx: CanvasRenderingContext2D, depth: number): void {
  const size = 500;
  const centerX = 360;
  const centerY = 360;
  const height = (size * Math.sqrt(3)) / 2;
  
  // Wierzchołki trójkąta równobocznego
  const p1: Point = { x: centerX - size / 2, y: centerY + height / 3 };
  const p2: Point = { x: centerX, y: centerY - (2 * height) / 3 };
  const p3: Point = { x: centerX + size / 2, y: centerY + height / 3 };
  
  ctx.beginPath();
  koch(ctx, p1, p2, depth);
  koch(ctx, p2, p3, depth);
  koch(ctx, p3, p1, depth);
  ctx.stroke();
  ctx.closePath();
}

function koch(ctx: CanvasRenderingContext2D, p1: Point, p2: Point, depth: number): void {
  if (depth === 0) {
    // Base case: narysuj linię
    ctx.lineTo(p2.x, p2.y);
  } else {
    // Oblicz punkty podziału
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    
    const q: Point = {
      x: p1.x + dx / 3,
      y: p1.y + dy / 3
    };
    
    const r: Point = {
      x: p1.x + (2 * dx) / 3,
      y: p1.y + (2 * dy) / 3
    };
    
    // Punkt wierzchołka trójkąta równobocznego
    const angle = Math.atan2(dy, dx) - Math.PI / 3;
    const s: Point = {
      x: p1.x + (d / 3) * Math.cos(angle),
      y: p1.y + (d / 3) * Math.sin(angle)
    };
    
    // Rekurencja: podziel na 4 części
    koch(ctx, p1, q, depth - 1);
    koch(ctx, q, s, depth - 1);
    koch(ctx, s, r, depth - 1);
    koch(ctx, r, p2, depth - 1);
  }
}
