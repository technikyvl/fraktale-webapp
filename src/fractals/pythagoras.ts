// Drzewo Pitagorasa - rekurencyjne dodawanie kwadratów do trójkąta

interface Point {
  x: number;
  y: number;
}

export function render(ctx: CanvasRenderingContext2D, depth: number): void {
  if (depth === 0) return;

  const dpr = (window.devicePixelRatio || 1);
  const canvasWidth = ctx.canvas.width / dpr;
  const canvasHeight = ctx.canvas.height / dpr;

  const margin = Math.min(canvasWidth, canvasHeight) * 0.06;
  // Przybliżona skala, aby drzewo mieściło się w pionie dla typowych głębokości
  const baseLength = Math.max(Math.min(canvasWidth, canvasHeight) * 0.22, 10);

  const baseY = canvasHeight - margin;
  const centerX = canvasWidth / 2;

  const bottomLeft: Point = { x: centerX - baseLength / 2, y: baseY };
  const bottomRight: Point = { x: centerX + baseLength / 2, y: baseY };

  // Narysuj pierwszy kwadrat
  drawSquare(ctx, bottomLeft, bottomRight, depth);
}

function drawSquare(ctx: CanvasRenderingContext2D, p1: Point, p2: Point, depth: number): void {
  if (depth === 0) return;
  
  // Rysuj kwadrat
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  // Wektor prostopadły (obrócony o 90°)
  const perpX = -dy;
  const perpY = dx;
  
  const p3: Point = {
    x: p2.x + perpX,
    y: p2.y + perpY
  };
  
  const p4: Point = {
    x: p1.x + perpX,
    y: p1.y + perpY
  };
  
  ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(p4.x, p4.y);
  ctx.closePath();
  ctx.stroke();
  
  // Rekurencja: narysuj dwa trójkąty nad kwadratem
  const angle = Math.atan2(dy, dx);
  const halfLength = length / 2;
  const height = length * 0.5;
  
  const midTop: Point = {
    x: (p4.x + p3.x) / 2 + height * Math.cos(angle - Math.PI / 2),
    y: (p4.y + p3.y) / 2 + height * Math.sin(angle - Math.PI / 2)
  };
  
  const leftTop: Point = {
    x: p4.x + height * Math.cos(angle - Math.PI / 2),
    y: p4.y + height * Math.sin(angle - Math.PI / 2)
  };
  
  const rightTop: Point = {
    x: p3.x + height * Math.cos(angle - Math.PI / 2),
    y: p3.y + height * Math.sin(angle - Math.PI / 2)
  };
  
  // Lewy i prawy kwadrat
  drawSquare(ctx, p4, leftTop, depth - 1);
  drawSquare(ctx, rightTop, p3, depth - 1);
}
