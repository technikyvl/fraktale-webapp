import { useEffect, useRef, useState } from 'react';
import { CodeBlock } from './CodeBlock';
import '../styles/FractalSection.css';
import '../styles/CodeBlock.css';

interface FractalSectionProps {
  title: string;
  description: string;
  code: string;
  minDepth: number;
  maxDepth: number;
  render: (ctx: CanvasRenderingContext2D, depth: number) => void;
}

export function FractalSection({
  title,
  description,
  code,
  minDepth,
  maxDepth,
  render,
}: FractalSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [depth, setDepth] = useState(Math.floor((minDepth + maxDepth) / 2));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // DPI-aware rendering
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;

    ctx.scale(dpr, dpr);

    // Wyczyść canvas
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Ustaw styl - biały kolor dla fraktali
    ctx.strokeStyle = '#FFFFFF';
    ctx.fillStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Narysuj fraktal
    render(ctx, depth);
  }, [depth, render]);

  return (
    <section className="fractal-section">
      <h2>{title}</h2>
      <p className="fractal-description">{description}</p>

      <div className="fractal-content">
        <div className="fractal-canvas-wrapper">
          <canvas ref={canvasRef} width={720} height={720} className="fractal-canvas" />
          <div className="slider-wrapper">
            <label htmlFor={`slider-${title}`} className="slider-label">
              Głębokość: {depth}
            </label>
            <input
              id={`slider-${title}`}
              type="range"
              min={minDepth}
              max={maxDepth}
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="slider"
            />
          </div>
        </div>

        <div className="code-wrapper">
          <h3 className="code-title">Algorytm (TypeScript)</h3>
          <CodeBlock code={code} />
        </div>
      </div>
    </section>
  );
}
