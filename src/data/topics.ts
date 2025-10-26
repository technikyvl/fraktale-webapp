export interface Topic {
  id: string;
  section: 'fractals';
  title: string;
  tldr: string;
  steps: string[];
  pseudocode: string;
  code: string;
  formulas: string[];
  qa: { question: string; answer: string }[];
  oneliner: string;
  mistakes: string[];
}

export const topics: Topic[] = [
  {
    id: 'koch',
    section: 'fractals',
    title: 'Płatek Kocha',
    tldr: 'Fraktal samopodobny: każdy odcinek zastępujemy czterema krótszymi z "ząbkiem". Teoretycznie proces jest nieskończony; w praktyce zatrzymujemy się na ustalonej głębokości.',
    steps: [
      'Poziom 0: trójkąt równoboczny (inicjator).',
      'Poziom 1: każdy bok podziel na 3 części, środkową zamień w "ząbek" (kąt 60°).',
      'Poziom n: powtarzaj dla każdego nowego odcinka.',
      'Base case: gdy depth==0 → rysuj prostą linię (bez dalszego dzielenia).',
    ],
    pseudocode: `FUNCTION koch_snowflake(ctx, depth, corners):
  IF depth == 0:
    DRAW line between corners
  ELSE:
    A, B, C = corners of triangle
    koch_curve(ctx, depth-1, A, B)
    koch_curve(ctx, depth-1, B, C)
    koch_curve(ctx, depth-1, C, A)

FUNCTION koch_curve(ctx, depth, start, end):
  IF depth == 0:
    DRAW line(start, end)
  ELSE:
    third1 = (2*start + end) / 3
    third2 = (start + 2*end) / 3
    peak = rotate_60_degrees(third1, third2)
    koch_curve(ctx, depth-1, start, third1)
    koch_curve(ctx, depth-1, third1, peak)
    koch_curve(ctx, depth-1, peak, third2)
    koch_curve(ctx, depth-1, third2, end)`,
    code: `function kochSnowflake(
  ctx: CanvasRenderingContext2D,
  points: [Point, Point, Point],
  depth: number
) {
  if (depth === 0) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.closePath();
    ctx.stroke();
    return;
  }
  
  kochCurve(ctx, points[0], points[1], depth);
  kochCurve(ctx, points[1], points[2], depth);
  kochCurve(ctx, points[2], points[0], depth);
}`,
    formulas: [
      'Liczba segmentów: 3 × 4ⁿ',
      'Długość jednego odcinka: L / 3ⁿ',
      'Obwód całkowity: 3L × (4/3)ⁿ',
      'Pole ograniczone: 8/5 × S₀ (gdzie S₀ to pole pierwotnego trójkąta)',
    ],
    qa: [
      {
        question: 'Dlaczego obwód rośnie do nieskończoności?',
        answer: 'Bo każdy krok mnoży długość przez 4/3 (dodajemy ⅓ więcej przy każdym podziale), więc limit przy n→∞ to ∞.',
      },
      {
        question: 'Jaka jest wymiar fraktalny?',
        answer: 'log(4)/log(3) ≈ 1.262 – czyli między linią (1) a płaszczyzną (2).',
      },
      {
        question: 'Kiedy rysować prostą linię?',
        answer: 'Gdy depth === 0 (base case) – to kończy rekurencję.',
      },
    ],
    oneliner: 'Rekurencyjne dzielenie trójkąta: każdy bok → 4 odcinki w kształcie "ząbka"; obwód ∞, pole skończone.',
    mistakes: ['Zapominanie o base case → infinite loop', 'Błędna kolejność rekurencji (trzeba 4 wywołania dla każdego boku)', 'Nieprawidłowe obliczanie punktów "złamań" (kąt 60°)'],
  },
  {
    id: 'sierpinski',
    section: 'fractals',
    title: 'Trójkąt Sierpińskiego',
    tldr: 'Rekurencyjnie dziel trójkąt na 4 mniejsze (3 kopia + środek pusty). Powtarzaj dla każdego z 3 narożnych trójkątów.',
    steps: [
      'Poziom 0: rysuj wypełniony trójkąt.',
      'Poziom 1: podziel na 4 trójkąty, usuń środkowy.',
      'Poziom n: dla każdego z 3 narożnych trójkątów → rekurencja.',
      'Base case: depth==0 → wypełnij trójkąt.',
    ],
    pseudocode: `FUNCTION sierpinski(ctx, corners, depth):
  IF depth == 0:
    FILL triangle(corners)
  ELSE:
    mid1 = midpoint(corners[0], corners[1])
    mid2 = midpoint(corners[1], corners[2])
    mid3 = midpoint(corners[2], corners[0])
    sierpinski(ctx, [corners[0], mid1, mid3], depth-1)
    sierpinski(ctx, [mid1, corners[1], mid2], depth-1)
    sierpinski(ctx, [mid3, mid2, corners[2]], depth-1)`,
    code: `function sierpinski(
  ctx: CanvasRenderingContext2D,
  corners: [Point, Point, Point],
  depth: number
) {
  if (depth === 0) {
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    ctx.lineTo(corners[1].x, corners[1].y);
    ctx.lineTo(corners[2].x, corners[2].y);
    ctx.closePath();
    ctx.fill();
    return;
  }
  
  const mid1 = midpoint(corners[0], corners[1]);
  const mid2 = midpoint(corners[1], corners[2]);
  const mid3 = midpoint(corners[2], corners[0]);
  
  sierpinski(ctx, [corners[0], mid1, mid3], depth - 1);
  sierpinski(ctx, [mid1, corners[1], mid2], depth - 1);
  sierpinski(ctx, [mid3, mid2, corners[2]], depth - 1);
}`,
    formulas: [
      'Liczba trójkątów: 3ⁿ (na każdym poziomie mnożenie przez 3)',
      'Pole jednego trójkąta: S₀ / 4ⁿ (gdzie S₀ to pole początkowego)',
      'Wymiar fraktalny: log(3)/log(2) ≈ 1.585',
      'Suma pól: S₀ × (3/4)ⁿ → przy n→∞ dąży do 0',
    ],
    qa: [
      {
        question: 'Dlaczego pole dąży do zera?',
        answer: 'Bo w każdym kroku mnożymy przez 3/4 (dodajemy 3 trójkąty, ale każdy ma ¼ powierzchni), więc przy n→∞ pole → 0.',
      },
      {
        question: 'Ile trójkątów na poziomie n?',
        answer: '3ⁿ (na poziomie 1 mamy 3, na poziomie 2 mamy 9, na poziomie 3 mamy 27, itd.)',
      },
      {
        question: 'Kiedy przestać rysować?',
        answer: 'Gdy depth === 0 (base case) – rysujemy pojedynczy wypełniony trójkąt.',
      },
    ],
    oneliner: 'Rekurencyjne usuwanie środkowych trójkątów: dziel → usuń środek → 3 kopie → powtarzaj.',
    mistakes: ['Rysowanie środkowego trójkąta (ma być pusty)', 'Niewłaściwa kolejność punktów w rekurencji', 'Nieprawidłowe obliczanie środkowych punktów'],
  },
];
