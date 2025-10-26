import React, { useRef, useEffect, useState } from 'react';

export const FractalDemo: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [type, setType] = useState<'koch' | 'sierpinski' | 'mandelbrot'>('koch');
  const [depth, setDepth] = useState(3);
  const [animate, setAnimate] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [segments, setSegments] = useState(0);
  const [renderTime, setRenderTime] = useState(0);
  const [maxIter, setMaxIter] = useState(100);

  useEffect(() => {
    draw();
  }, [type, depth, animate, speed]);

  const draw = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const startTime = performance.now();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 720, 720);
    ctx.fillStyle = '#0b0b10';
    ctx.fillRect(0, 0, 720, 720);

    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    let count = 0;

    if (type === 'koch') {
      count = drawKoch(ctx, depth);
    } else if (type === 'sierpinski') {
      count = drawSierpinski(ctx, depth);
    } else if (type === 'mandelbrot') {
      count = drawMandelbrot(ctx, depth, maxIter);
    }

    setSegments(count);
    const endTime = performance.now();
    setRenderTime(endTime - startTime);
  };

  const drawKoch = (ctx: CanvasRenderingContext2D, depth: number): number => {
    let segmentCount = 0;

    function kochCurve(x1: number, y1: number, x2: number, y2: number, depth: number) {
      if (depth === 0) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        segmentCount++;
        return;
      }

      const dx = x2 - x1;
      const dy = y2 - y1;
      const thirdX = x1 + dx / 3;
      const thirdY = y1 + dy / 3;
      const twoThirdX = x1 + (2 * dx) / 3;
      const twoThirdY = y1 + (2 * dy) / 3;

      const angle = Math.atan2(dy, dx);
      const length = Math.sqrt(dx * dx + dy * dy) / 3;
      const peakX = thirdX + Math.cos(angle + Math.PI / 3) * length;
      const peakY = thirdY + Math.sin(angle + Math.PI / 3) * length;

      kochCurve(x1, y1, thirdX, thirdY, depth - 1);
      kochCurve(thirdX, thirdY, peakX, peakY, depth - 1);
      kochCurve(peakX, peakY, twoThirdX, twoThirdY, depth - 1);
      kochCurve(twoThirdX, twoThirdY, x2, y2, depth - 1);
    }

    const centerX = 360;
    const centerY = 360;
    const size = 200;

    const p1 = { x: centerX, y: centerY - size / 2 };
    const p2 = { x: centerX - (size * Math.sqrt(3)) / 2, y: centerY + size / 2 };
    const p3 = { x: centerX + (size * Math.sqrt(3)) / 2, y: centerY + size / 2 };

    kochCurve(p1.x, p1.y, p2.x, p2.y, depth);
    kochCurve(p2.x, p2.y, p3.x, p3.y, depth);
    kochCurve(p3.x, p3.y, p1.x, p1.y, depth);

    return segmentCount;
  };

  const drawSierpinski = (ctx: CanvasRenderingContext2D, depth: number): number => {
    let triangleCount = 0;

    function sierpinski(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, depth: number) {
      if (depth === 0) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.closePath();
        ctx.fill();
        triangleCount++;
        return;
      }

      const mx1 = (x1 + x2) / 2;
      const my1 = (y1 + y2) / 2;
      const mx2 = (x2 + x3) / 2;
      const my2 = (y2 + y3) / 2;
      const mx3 = (x3 + x1) / 2;
      const my3 = (y3 + y1) / 2;

      sierpinski(x1, y1, mx1, my1, mx3, my3, depth - 1);
      sierpinski(mx1, my1, x2, y2, mx2, my2, depth - 1);
      sierpinski(mx3, my3, mx2, my2, x3, y3, depth - 1);
    }

    ctx.fillStyle = '#60a5fa';
    const centerX = 360;
    const centerY = 360;
    const size = 300;

    const h = (size * Math.sqrt(3)) / 2;
    const p1 = { x: centerX, y: centerY - (2 * h) / 3 };
    const p2 = { x: centerX - size / 2, y: centerY + h / 3 };
    const p3 = { x: centerX + size / 2, y: centerY + h / 3 };

    sierpinski(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, depth);

    return triangleCount;
  };

  const drawMandelbrot = (ctx: CanvasRenderingContext2D, depth: number, maxIter: number): number => {
    const width = 720;
    const height = 720;
    let iterationsCount = 0;

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const cx = (px / width) * 3 - 2;
        const cy = (py / height) * 3 - 1.5;

        let x = 0;
        let y = 0;
        let iter = 0;

        while (iter < maxIter && x * x + y * y < 4) {
          const temp = x * x - y * y + cx;
          y = 2 * x * y + cy;
          x = temp;
          iter++;
          iterationsCount++;
        }

        const hue = (iter / maxIter) * 360;
        ctx.fillStyle = iter === maxIter ? '#000' : `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(px, py, 1, 1);
      }
    }

    return iterationsCount;
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Typ fraktala</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
        >
          <option value="koch">Płatek Kocha</option>
          <option value="sierpinski">Trójkąt Sierpińskiego</option>
          <option value="mandelbrot">Zbiór Mandelbrota</option>
        </select>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium">Głębokość</label>
          <span className="text-sm">{depth}</span>
        </div>
        <input
          type="range"
          min={0}
          max={type === 'mandelbrot' ? 7 : 7}
          value={depth}
          onChange={(e) => setDepth(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {type === 'mandelbrot' && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">Max iteracji</label>
            <span className="text-sm">{maxIter}</span>
          </div>
          <input
            type="range"
            min={50}
            max={200}
            value={maxIter}
            onChange={(e) => setMaxIter(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={animate} onChange={(e) => setAnimate(e.target.checked)} />
          <span className="text-sm">Animuj</span>
        </label>
        <div className="flex-1">
          <label className="text-sm block mb-1">Prędkość</label>
          <input
            type="range"
            min={1}
            max={10}
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <canvas ref={canvasRef} width={720} height={720} className="border border-gray-300 dark:border-gray-700 rounded" />

      <div className="text-sm text-gray-600 dark:text-gray-400">
        Czas rysowania: {Math.round(renderTime)} ms | Segmenty: {segments} | Głębokość: {depth}
      </div>
    </div>
  );
};

