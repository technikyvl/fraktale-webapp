import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { drawKochSnowflake } from './fractals/kochSnowflake';
import { exportCanvasAsPng, withHiDPICanvas } from './lib/canvas';
import { measureMs } from './lib/measure';

type FractalType = 'koch-snowflake' | 'koch-curve' | 'sierpinski' | 'tree' | 'mandelbrot';

// Domyślne kolory i ustawienia
const DEFAULTS = {
  width: 900,
  height: 900,
  depth: 3,
  lineWidth: 2,
  animate: false,
  speed: 5,
  stroke: '#60a5fa',
  background: '#0b0b10',
} as const;

export const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fractal, setFractal] = useState<FractalType>('koch-snowflake');
  const [depth, setDepth] = useState<number>(DEFAULTS.depth);
  const [lineWidth, setLineWidth] = useState<number>(DEFAULTS.lineWidth);
  const [animate, setAnimate] = useState<boolean>(DEFAULTS.animate);
  const [speed, setSpeed] = useState<number>(DEFAULTS.speed);
  const [stroke, setStroke] = useState<string>(DEFAULTS.stroke);
  const [background, setBackground] = useState<string>(DEFAULTS.background);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [stats, setStats] = useState<{ timeMs: number; segments: number; perimeter: number } | null>(null);

  // Wywołanie rysowania
  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { ctx, scale } = withHiDPICanvas(canvas, DEFAULTS.width, DEFAULTS.height);
    // Tło
    ctx.save();
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.save();
    ctx.lineWidth = lineWidth * scale; // dostosowanie grubości do DPI
    ctx.strokeStyle = stroke;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    setIsDrawing(true);
    const { elapsedMs, result } = await measureMs(async () => {
      // Obszar roboczy i skalowanie
      const padding = 48 * scale;
      const drawArea = {
        x: padding,
        y: padding,
        w: canvas.width - 2 * padding,
        h: canvas.height - 2 * padding,
      };

      if (fractal === 'koch-snowflake') {
        await drawKochSnowflake(ctx, drawArea, depth, { animate, speed });
      } else {
        // Inne fraktale będą dodane później
      }
    });
    setIsDrawing(false);

    // Statystyki dla płatka Kocha
    if (fractal === 'koch-snowflake') {
      // liczba segmentów: 3 * 4^n
      const segments = 3 * Math.pow(4, depth);
      // zakładamy bazową długość boku L = 1 (przed skalowaniem), obwód: 3 * L * (4/3)^n
      const perimeter = 3 * Math.pow(4 / 3, depth);
      setStats({ timeMs: elapsedMs, segments, perimeter });
    } else {
      setStats({ timeMs: elapsedMs, segments: 0, perimeter: 0 });
    }

    ctx.restore();
  }, [animate, background, depth, fractal, lineWidth, speed, stroke]);

  // Skróty klawiaturowe
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') draw();
      if (e.key === 'c' || e.key === 'C') clearCanvas();
      if (e.key === 's' || e.key === 'S') savePng();
      if (e.key === 'd' || e.key === 'D') toggleTheme();
      if (e.key === '+') setDepth((d) => Math.min(7, d + 1));
      if (e.key === '-') setDepth((d) => Math.max(0, d - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [draw]);

  // Rysowanie przy zmianie parametrów, jeśli brak animacji
  useEffect(() => {
    if (!animate) draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fractal, depth, lineWidth, stroke, background]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { ctx } = withHiDPICanvas(canvas, DEFAULTS.width, DEFAULTS.height);
    ctx.save();
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }, [background]);

  const centerFractal = useCallback(() => {
    // Przy aktualnym podejściu fraktal jest skalowany do obszaru roboczego, więc wystarczy odrysować
    draw();
  }, [draw]);

  const savePng = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    exportCanvasAsPng(canvas, `fraktal-${fractal}-n${depth}.png`);
  }, [depth, fractal]);

  const generateBatch = useCallback(async () => {
    const oldDepth = depth;
    for (let n = 0; n <= 5; n++) {
      setDepth(n);
      // poczekaj na odświeżenie stanu i rysowanie
      await new Promise((r) => setTimeout(r, 50));
      await draw();
      savePng();
      await new Promise((r) => setTimeout(r, 50));
    }
    setDepth(oldDepth);
  }, [depth, draw, savePng]);

  const toggleTheme = useCallback(() => {
    document.documentElement.classList.toggle('dark');
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Panel lewy */}
      <aside className="w-[320px] shrink-0 border-r border-border bg-card/60 backdrop-blur p-6 space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Laboratorium Fraktali</h1>
          <p className="text-sm text-foreground/70 mt-1">Eksperymentuj z geometrią nieskończoności</p>
        </div>

        {/* Wybór fraktala */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Wybierz fraktal</label>
          <select
            className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
            value={fractal}
            onChange={(e) => setFractal(e.target.value as FractalType)}
          >
            <option value="koch-snowflake">Płatek Kocha</option>
            <option value="koch-curve">Krzywa Kocha</option>
            <option value="sierpinski">Trójkąt Sierpińskiego</option>
            <option value="tree">Drzewo fraktalne</option>
            <option value="mandelbrot">Zbiór Mandelbrota</option>
          </select>
        </div>

        {/* Suwaki i kontrolki */}
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
            {/* Statystyki Kocha obok suwaka */}
            {fractal === 'koch-snowflake' && (
              <div className="mt-2 text-xs text-foreground/80 space-y-1">
                <div>Liczba segmentów: 3 × 4^n = {3 * Math.pow(4, depth)}</div>
                <div>Długość jednego odcinka: L / 3^n</div>
                <div>Obwód: 3 × L × (4/3)^n</div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Grubość linii</label>
              <span className="text-sm tabular-nums">{lineWidth}px</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
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
              min={0}
              max={10}
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="mt-1 text-xs text-foreground/70">0 = bez animacji</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Kolor linii</label>
              <input type="color" className="ml-2" value={stroke} onChange={(e) => setStroke(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Kolor tła</label>
              <input type="color" className="ml-2" value={background} onChange={(e) => setBackground(e.target.value)} />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={animate} onChange={(e) => setAnimate(e.target.checked)} />
            Animuj rysowanie
          </label>
        </div>

        {/* Dodatkowe kontrolki */}
        <div className="grid grid-cols-2 gap-3">
          <button className="rounded-md bg-accent/90 hover:bg-accent text-white px-3 py-2" onClick={draw}>Rysuj</button>
          <button className="rounded-md border border-border hover:bg-muted px-3 py-2" onClick={clearCanvas}>Wyczyść</button>
          <button className="rounded-md border border-border hover:bg-muted px-3 py-2" onClick={centerFractal}>Wycentruj fraktal</button>
          <button className="rounded-md border border-border hover:bg-muted px-3 py-2" onClick={savePng}>Zapisz jako PNG</button>
          <button className="col-span-2 rounded-md border border-border hover:bg-muted px-3 py-2" onClick={generateBatch}>Zrzuty 0–5</button>
          <button className="col-span-2 rounded-md border border-border hover:bg-muted px-3 py-2" onClick={toggleTheme}>Tryb jasny / ciemny</button>
        </div>
      </aside>

      {/* Prawa strona: płótno */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 grid place-items-center relative">
          <canvas ref={canvasRef} className="rounded-lg border border-border shadow-lg" width={DEFAULTS.width} height={DEFAULTS.height} />
          {isDrawing && (
            <div className="absolute inset-0 grid place-items-center bg-black/30 backdrop-blur-sm text-sm">
              Rysowanie...
            </div>
          )}
        </div>

        {/* Pasek stanu */}
        <footer className="h-12 border-t border-border px-4 flex items-center justify-between text-sm bg-card/60">
          <div className="flex gap-6">
            <span>Czas rysowania: {stats ? Math.round(stats.timeMs) : 0} ms</span>
            <span>Liczba segmentów: {stats ? stats.segments : 0}</span>
            <span>Długość obwodu: {stats ? stats.perimeter.toFixed(3) : 0} jednostek</span>
          </div>
          {fractal === 'mandelbrot' && (
            <div className="text-right">
              <span>Iteracje: —, Powiększenie: —</span>
            </div>
          )}
        </footer>
      </main>
    </div>
  );
};

export default App;


