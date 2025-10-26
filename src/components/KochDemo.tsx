import React, { useCallback, useEffect, useRef, useState } from 'react';

// Typy
type Pt = { x: number; y: number };
type Segment = { a: Pt; b: Pt; level: number; base: boolean };

// Generator rekurencyjny dla krzywej Kocha
function* kochLine(p1: Pt, p2: Pt, level: number): Generator<Segment> {
  if (level === 0) {
    yield { a: p1, b: p2, level, base: true }; // BASE CASE
    return;
  }

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const A: Pt = { x: p1.x + dx / 3, y: p1.y + dy / 3 };
  const D: Pt = { x: p1.x + (2 * dx) / 3, y: p1.y + (2 * dy) / 3 };
  
  // Oblicz punkt szczytowy trójkąta równobocznego
  const angle = Math.atan2(dy, dx) - Math.PI / 3;
  const len = Math.hypot(dx, dy) / 3;
  const C: Pt = {
    x: A.x + Math.cos(angle) * len,
    y: A.y + Math.sin(angle) * len,
  };

  yield* kochLine(p1, A, level - 1);
  yield* kochLine(A, C, level - 1);
  yield* kochLine(C, D, level - 1);
  yield* kochLine(D, p2, level - 1);
}

export const KochDemo: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [depth, setDepth] = useState<number>(3);
  const [animate, setAnimate] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(5);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [baseMessage, setBaseMessage] = useState<string>('');
  const [stats, setStats] = useState<{
    totalSegments: number;
    baseSegments: number;
    levels: Record<number, number>;
  } | null>(null);

  // Konfiguracja canvas
  const CANVAS_SIZE = 720;

  // Funkcja rysowania
  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Setup DPI-aware canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(CANVAS_SIZE * dpr);
    canvas.height = Math.floor(CANVAS_SIZE * dpr);
    canvas.style.width = CANVAS_SIZE + 'px';
    canvas.style.height = CANVAS_SIZE + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Tło
    ctx.fillStyle = '#0b0b10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Resetuj wiadomość base case
    setBaseMessage('');

    // Płatek Kocha: tworzymy 3 boki trójkąta równobocznego
    const L = 1;
    const h = (Math.sqrt(3) / 2) * L;
    const p1: Pt = { x: 0, y: 0 };        // Lewy dolny
    const p2: Pt = { x: L / 2, y: h };   // Górny wierzchołek
    const p3: Pt = { x: L, y: 0 };       // Prawy dolny

    // Generuj wszystkie segmenty dla 3 boków
    const allSegments: Segment[] = [];
    
    for (const segment of kochLine(p1, p2, depth)) {
      allSegments.push(segment);
    }
    for (const segment of kochLine(p2, p3, depth)) {
      allSegments.push(segment);
    }
    for (const segment of kochLine(p3, p1, depth)) {
      allSegments.push(segment);
    }

    // Oblicz bounding box
    const xs: number[] = [];
    const ys: number[] = [];
    for (const seg of allSegments) {
      xs.push(seg.a.x, seg.b.x);
      ys.push(seg.a.y, seg.b.y);
    }
    const bbox = {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys),
    };

    // Skalowanie do canvas
    const padding = 48;
    const drawArea = {
      x: padding,
      y: padding,
      w: CANVAS_SIZE - 2 * padding,
      h: CANVAS_SIZE - 2 * padding,
    };

    const scale = Math.min(drawArea.w / (bbox.maxX - bbox.minX), drawArea.h / (bbox.maxY - bbox.minY));
    const offsetX = drawArea.x + (drawArea.w - (bbox.maxX - bbox.minX) * scale) / 2 - bbox.minX * scale;
    const offsetY = drawArea.y + (drawArea.h - (bbox.maxY - bbox.minY) * scale) / 2 - bbox.minY * scale;

    // Statystyki
    const levels: Record<number, number> = {};
    let baseCount = 0;
    for (const seg of allSegments) {
      levels[seg.level] = (levels[seg.level] || 0) + 1;
      if (seg.base) baseCount++;
    }

    setStats({
      totalSegments: allSegments.length,
      baseSegments: baseCount,
      levels,
    });

    // Rysowanie
    setIsDrawing(true);
    let drawnCount = 0;
    let baseShown = false;

    const step = Math.max(1, Math.floor(allSegments.length / Math.max(1, speed * 20)));

    function drawChunk() {
      if (!ctx) return;
      
      const end = Math.min(allSegments.length, drawnCount + (animate ? step : allSegments.length));

      for (let i = drawnCount; i < end; i++) {
        const seg = allSegments[i];

        // Jeśli to pierwszy base case, pokaż komunikat
        if (seg.base && !baseShown) {
          setBaseMessage('🎯 Osiągnięto ostatni poziom → rysuję prostą linię (BASE CASE).');
          baseShown = true;
        }

        // Narysuj segment
        ctx.beginPath();
        ctx.strokeStyle = seg.base ? '#39e1ff' : '#8aa3ff';
        ctx.lineWidth = seg.base ? 2.2 : 1.6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const x1 = seg.a.x * scale + offsetX;
        const y1 = seg.a.y * scale + offsetY;
        const x2 = seg.b.x * scale + offsetX;
        const y2 = seg.b.y * scale + offsetY;

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        drawnCount++;
      }

      if (animate && drawnCount < allSegments.length) {
        requestAnimationFrame(drawChunk);
      } else {
        setIsDrawing(false);
      }
    }

    drawChunk();
  }, [depth, animate, speed]);

  // Inicjalizacja - rysuj od razu
  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-rysowanie przy zmianie parametrów (jeśli brak animacji)
  useEffect(() => {
    if (!animate) {
      const timer = setTimeout(() => draw(), 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depth]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Panel lewy */}
      <aside className="w-[320px] shrink-0 border-r border-border bg-card/60 backdrop-blur p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Demonstracja Płatka Kocha</h2>
          <p className="text-sm text-foreground/70 mt-1">Rekurencja z wyróżnieniem BASE CASE</p>
        </div>

        {/* Kontrolki */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Głębokość rekurencji</label>
              <span className="text-sm tabular-nums">n = {depth}</span>
            </div>
            <input
              type="range"
              min={0}
              max={7}
              value={depth}
              onChange={(e) => setDepth(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Prędkość animacji</label>
              <span className="text-sm tabular-nums">{speed}</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              disabled={!animate}
              className="w-full"
            />
          </div>

          <div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={animate} onChange={(e) => setAnimate(e.target.checked)} />
              Animuj rysowanie
            </label>
          </div>

          <button
            className="w-full rounded-md bg-accent/90 hover:bg-accent text-white px-3 py-2 text-sm"
            onClick={draw}
          >
            Rysuj płatek
          </button>
        </div>

        {/* Statystyki */}
        {stats && (
          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="text-sm font-medium">Statystyki</h3>
            <div className="space-y-2 text-xs text-foreground/80">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-foreground/60">Formuła:</span>
                <span className="tabular-nums">3 × 4^n = {3 * Math.pow(4, depth)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-foreground/60">Narysowane:</span>
                <span className="tabular-nums">{stats.totalSegments}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-foreground/60">BASE (L0):</span>
                <span className="tabular-nums text-cyan-400">{stats.baseSegments}</span>
              </div>
            </div>

            <div className="text-xs mt-3">
              <div className="text-foreground/60 mb-1">Poziomy:</div>
              {Object.entries(stats.levels)
                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                .map(([level, count]) => (
                  <div key={level} className={parseInt(level) === 0 ? 'text-cyan-400 font-medium' : ''}>
                    L{level}: {count}
                  </div>
                ))}
            </div>
          </div>
        )}

        {baseMessage && (
          <div className="border border-cyan-400/30 bg-cyan-400/10 rounded-md p-3 text-xs text-cyan-400">
            {baseMessage}
          </div>
        )}

        {isDrawing && (
          <div className="text-sm text-foreground/70">
            ⏳ Rysowanie...
          </div>
        )}
      </aside>

      {/* Prawa strona: canvas */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 grid place-items-center relative">
          <canvas
            ref={canvasRef}
            className="rounded-lg border border-border shadow-lg"
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
          />
        </div>
      </main>
    </div>
  );
};

