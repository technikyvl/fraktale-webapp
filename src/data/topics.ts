export interface Topic {
  id: string;
  section: 'quick' | 'fractals' | 'algorithms' | 'formulas';
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
    id: 'koch-snowflake',
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
  {
    id: 'mandelbrot',
    section: 'fractals',
    title: 'Zbiór Mandelbrota',
    tldr: 'Sprawdzamy czy punkt płaszczyzny zespolonej nie ucieka do nieskończoności przy iteracji z = z² + c. Kolorujemy według liczby iteracji potrzebnej do "ucieczki".',
    steps: [
      'Dla każdego punktu c (np. w prostokącie [-2,1] × [-1.5,1.5]):',
      'Startujemy od z₀ = 0.',
      'Iterujemy: z_{n+1} = z_n² + c.',
      'Jeśli |z_n| > 2 → punkt ucieka, zapisz n jako "kolor".',
      'Jeśli po maxIter krokach |z| ≤ 2 → punkt należy do zbioru (czarny).',
    ],
    pseudocode: `FUNCTION mandelbrot(c, maxIter):
  z = 0
  FOR i = 0 TO maxIter:
    z = z*z + c
    IF |z| > 2:
      RETURN i
  RETURN maxIter

FOR EACH pixel(x, y):
  cx = map(x, 0, width, -2, 1)
  cy = map(y, 0, height, -1.5, 1.5)
  c = cx + i*cy
  iterations = mandelbrot(c, 100)
  color = palette[iterations]
  DRAW pixel(x, y, color)`,
    code: `function mandelbrot(c: complex, maxIter: number): number {
  let z = { real: 0, imag: 0 };
  for (let i = 0; i < maxIter; i++) {
    if (z.real * z.real + z.imag * z.imag > 4) return i;
    const nextReal = z.real * z.real - z.imag * z.imag + c.real;
    const nextImag = 2 * z.real * z.imag + c.imag;
    z = { real: nextReal, imag: nextImag };
  }
  return maxIter;
}`,
    formulas: [
      'Iteracja: z_{n+1} = z_n² + c',
      'Kryterium ucieczki: |z| = √(Re² + Im²) > 2',
      'Granice: Re(c) ∈ [-2, 1], Im(c) ∈ [-1.5, 1.5]',
      'Paleta: hue = (iterations / maxIter) × 360°',
    ],
    qa: [
      {
        question: 'Dlaczego próg to 2?',
        answer: 'Bo jeśli |z| > 2, to z² będzie większe niż |z|, i punkt na pewno ucieknie do ∞.',
      },
      {
        question: 'Co to jest "ujemny obszar" powyżej głównej karty?',
        answer: 'Miniaturka oryginalnego zbioru – fraktal jest samopodobny na różnych poziomach.',
      },
      {
        question: 'Jak obliczyć z² dla liczby zespolonej?',
        answer: '(a+bi)² = (a²-b²) + 2abi, więc Re(z²) = Re² - Im², Im(z²) = 2×Re×Im.',
      },
    ],
    oneliner: 'Sprawdzamy czy punkt nie ucieka przy iteracji z = z²+c; kolor = liczba iteracji do ucieczki.',
    mistakes: ['Błędne obliczenie z² (trzeba rozdzielić na część rzeczywistą i urojoną)', 'Pominięcie warunku |z|>2', 'Niewłaściwe mapowanie współrzędnych piksel→zespolone'],
  },
  {
    id: 'binary-search',
    section: 'algorithms',
    title: 'Wyszukiwanie binarne',
    tldr: 'Dzielimy przestrzeń wyszukiwania na pół, porównując element środkowy z szukaną wartością. O(log n).',
    steps: [
      'Posortowana tablica wymagana!',
      'Środek = (left + right) / 2',
      'Jeśli arr[mid] === target → znalezione',
      'Jeśli arr[mid] < target → szukaj po prawej',
      'Jeśli arr[mid] > target → szukaj po lewej',
      'Base case: left > right → nie znaleziono',
    ],
    pseudocode: `FUNCTION binarySearch(arr, target):
  left = 0
  right = arr.length - 1
  
  WHILE left <= right:
    mid = (left + right) / 2
    IF arr[mid] == target:
      RETURN mid
    ELSE IF arr[mid] < target:
      left = mid + 1
    ELSE:
      right = mid - 1
  
  RETURN -1`,
    code: `function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  
  return -1;
}`,
    formulas: ['Złożoność czasowa: O(log n)', 'Złożoność pamięciowa: O(1)', 'Wymagania: posortowana tablica', 'Porównania: max ⌈log₂(n+1)⌉'],
    qa: [
      {
        question: 'Dlaczego O(log n)?',
        answer: 'Bo w każdym kroku dzielimy przestrzeń na pół, więc musimy zrobić log₂(n) kroków.',
      },
      {
        question: 'Czy działa dla niesortowanej tablicy?',
        answer: 'Nie – algorytm wymaga posortowania, w przeciwnym razie nie zadziała poprawnie.',
      },
      {
        question: 'Jak radzić sobie z overflow?',
        answer: 'Użyć: mid = left + Math.floor((right - left) / 2) zamiast (left+right)/2.',
      },
    ],
    oneliner: 'Dziel przestrzeń na pół, porównaj ze środkiem, wybierz odpowiednią połowę → O(log n).',
    mistakes: ['Pomylenie <= z < w pętli', 'Błędne indeksy (mid+1 vs mid-1)', 'Brak sprawdzenia czy tablica jest posortowana'],
  },
  {
    id: 'quick-sort',
    section: 'algorithms',
    title: 'QuickSort',
    tldr: 'Wybierz pivot, podziel tablicę na elementy ≤ pivot i > pivot, posortuj rekurencyjnie obie części.',
    steps: [
      'Wybierz pivot (np. ostatni element)',
      'Podziel tablicę: elementy ≤ pivot po lewej, > pivot po prawej',
      'Pivot trafia na właściwe miejsce',
      'Rekurencyjnie posortuj lewą i prawą część',
      'Base case: tablica ≤ 1 element',
    ],
    pseudocode: `FUNCTION quickSort(arr, low, high):
  IF low < high:
    pivot = partition(arr, low, high)
    quickSort(arr, low, pivot - 1)
    quickSort(arr, pivot + 1, high)

FUNCTION partition(arr, low, high):
  pivot = arr[high]
  i = low - 1
  FOR j = low TO high-1:
    IF arr[j] <= pivot:
      i++
      SWAP arr[i], arr[j]
  SWAP arr[i+1], arr[high]
  RETURN i + 1`,
    code: `function quickSort(arr: number[], low: number, high: number): void {
  if (low < high) {
    const pivot = partition(arr, low, high);
    quickSort(arr, low, pivot - 1);
    quickSort(arr, pivot + 1, high);
  }
}

function partition(arr: number[], low: number, high: number): number {
  const pivot = arr[high];
  let i = low - 1;
  
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
    formulas: [
      'Średnia złożoność: O(n log n)',
      'Gorszy przypadek: O(n²) (już posortowane)',
      'Lepszy przypadek: O(n log n)',
      'Pamięć: O(log n) (głębokość rekurencji)',
    ],
    qa: [
      {
        question: 'Jaka jest najgorsza złożoność?',
        answer: 'O(n²) – gdy pivot zawsze jest minimum/maximum (np. już posortowana tablica).',
      },
      {
        question: 'Jak wybrać dobry pivot?',
        answer: 'Median-of-three: wybierz pierwszy, środkowy i ostatni element, użyj mediany.',
      },
      {
        question: 'QuickSort czy MergeSort?',
        answer: 'QuickSort szybszy średnio, ale MergeSort gwarantuje O(n log n) i jest stabilny.',
      },
    ],
    oneliner: 'Pivot → podziel → rekurencja; O(n log n) średnio, O(n²) w najgorszym wypadku.',
    mistakes: ['Zapominanie o swap przed returnem', 'Błędne granice rekurencji (pivot-1, pivot+1)', 'Nieskończona rekurencja gdy brak base case'],
  },
];

