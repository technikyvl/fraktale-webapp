import { useEffect, useState } from 'react';
import { FractalSection } from './components/FractalSection';
import './styles/FractalSection.css';
import './App.css';

// Importy funkcji fraktali
import { render as kochRender } from './fractals/koch';
import { render as sierpinskiRender } from './fractals/sierpinski';
import { render as pythagorasRender } from './fractals/pythagoras';
import { render as mandelbrotRender } from './fractals/mandelbrot';
import { render as fbmRender } from './fractals/fbmMinecraft';

// Importuj theme.json
import theme from './theme.json';

// Kody algorytmów
const kochCode = `interface Point {
  x: number;
  y: number;
}

function koch(ctx, p1, p2, depth) {
  if (depth === 0) {
    // Base case: narysuj linię
    ctx.lineTo(p2.x, p2.y);
  } else {
    // Oblicz punkty podziału
    const q = { x: p1.x + dx/3, y: p1.y + dy/3 };
    const r = { x: p1.x + 2*dx/3, y: p1.y + 2*dy/3 };
    const s = { /* wierzchołek trójkąta */ };
    
    // Rekurencja: podziel na 4 części
    koch(ctx, p1, q, depth - 1);
    koch(ctx, q, s, depth - 1);
    koch(ctx, s, r, depth - 1);
    koch(ctx, r, p2, depth - 1);
  }
}`;

const sierpinskiCode = `function sierpinski(ctx, p1, p2, p3, depth) {
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
    const mid1 = { x: (p1.x+p2.x)/2, y: (p1.y+p2.y)/2 };
    const mid2 = { x: (p2.x+p3.x)/2, y: (p2.y+p3.y)/2 };
    const mid3 = { x: (p1.x+p3.x)/2, y: (p1.y+p3.y)/2 };
    
    // Rekurencja: narysuj 3 mniejsze trójkąty
    sierpinski(ctx, p1, mid1, mid3, depth - 1);
    sierpinski(ctx, mid1, p2, mid2, depth - 1);
    sierpinski(ctx, mid3, mid2, p3, depth - 1);
  }
}`;

const pythagorasCode = `function drawSquare(ctx, p1, p2, depth) {
  if (depth === 0) return;
  
  // Rysuj kwadrat używając prostopadłego wektora
  // ...
  
  // Rekurencja: narysuj dwa trójkąty nad kwadratem
  // Lewy i prawy kwadrat
  drawSquare(ctx, p4, leftTop, depth - 1);
  drawSquare(ctx, rightTop, p3, depth - 1);
}`;

const mandelbrotCode = `for (let px = 0; px < width; px++) {
  for (let py = 0; py < height; py++) {
    // Mapuj piksel na punkt w płaszczyźnie zespolonej
    const x0 = minX + (maxX - minX) * (px / width);
    const y0 = minY + (maxY - minY) * (py / height);
    
    // Iteruj z^2 + c
    let x = 0, y = 0, iter = 0;
    while (x*x + y*y <= 4 && iter < maxIter) {
      const xtemp = x*x - y*y + x0;
      y = 2 * x * y + y0;
      x = xtemp;
      iter++;
    }
    
    // Kolor na podstawie liczby iteracji
  }
}`;

const fbmCode = `for (let octave = 0; octave < octaves; octave++) {
  const nx = px * scale * frequency;
  const ny = py * scale * frequency;
  
  value += noise(nx, ny) * amplitude;
  
  amplitude *= 0.5;  // Każda oktawa ma połowę amplitudy
  frequency *= 2;    // Każda oktawa ma 2× wyższą częstotliwość
}

// Wyświetl jako mapa wysokości (skala szarości)`;

function App() {
  const [cssVars, setCssVars] = useState<string>('');

  useEffect(() => {
    // Konwertuj theme.json na CSS Custom Properties
    const dark = theme.colors.dark;
    const sizes = theme.typography.sizes;
    const weights = theme.typography.weights;
    const space = theme.space;
    const radii = theme.radii;
    const page = theme.components.page;
    const card = theme.components.card;
    const slider = theme.components.slider;
    const code = theme.components.code;

    const vars = `
      :root {
        --c-bg-page: ${dark['bg/page']};
        --c-bg-surface: ${dark['bg/surface']};
        --c-text-primary: ${dark['text/primary']};
        --c-text-secondary: ${dark['text/secondary']};
        --c-line-soft: ${dark['line/soft']};
        --c-accent-primary: ${dark['accent/primary']};
        
        --ff-heading: ${theme.typography['fontFamily/heading']};
        --ff-body: ${theme.typography['fontFamily/body']};
        
        --fs-display: ${sizes.display}px;
        --fs-h1: ${sizes.h1}px;
        --fs-h2: ${sizes.h2}px;
        --fs-h3: ${sizes.h3}px;
        --fs-body: ${sizes.body}px;
        --fs-overline: ${sizes.overline}px;
        
        --fw-regular: ${weights.regular};
        --fw-semibold: ${weights.semibold};
        --fw-bold: ${weights.bold};
        
        --sp-sm: ${space.sm}px;
        --sp-md: ${space.md}px;
        --sp-lg: ${space.lg}px;
        --sp-xl: ${space.xl}px;
        --sp-2xl: ${space['2xl']}px;
        --sp-3xl: ${space['3xl']}px;
        
        --r-md: ${radii.md}px;
        --r-lg: ${radii.lg}px;
        --r-pill: ${radii.pill}px;
        
        --page-max-width: ${page.maxWidth}px;
        --page-padding-y: ${page.paddingY}px;
        --page-gap: ${page.gap}px;
        
        --card-padding: ${card.padding}px;
        --card-radius: var(--r-${card.radius});
        --card-border: var(--c-${card.border.replace('/', '-')});
        
        --slider-height: ${slider.height}px;
        
        --code-font: ${code.fontFamily};
        --code-size: ${code.fontSize}px;
        --code-radius: var(--r-${code.radius});
      }
    `;

    setCssVars(vars);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      <div className="app">
        <header className="app-header">
          <h1>Fraktale – wizualizacje i algorytmy</h1>
        </header>

        <main className="app-main">
          <FractalSection
            title="Płatek Kocha"
            description="Krzywa fraktalna powstająca przez rekurencyjne dzielenie odcinka na cztery równe części i zastępowanie środkowej przez dwa odcinki tworzące trójkąt równoboczny."
            code={kochCode}
            minDepth={0}
            maxDepth={7}
            render={kochRender}
          />

          <FractalSection
            title="Trójkąt Sierpińskiego"
            description="Fraktal polegający na rekurencyjnym usuwaniu środkowego trójkąta z kolejnych poziomów, tworząc wzór samopodobieństwa."
            code={sierpinskiCode}
            minDepth={0}
            maxDepth={7}
            render={sierpinskiRender}
          />

          <FractalSection
            title="Drzewo Pitagorasa"
            description="Rekurencyjne drzewo powstające przez dodawanie kwadratów do trójkątów w konfiguracji znanej z twierdzenia Pitagorasa."
            code={pythagorasCode}
            minDepth={0}
            maxDepth={9}
            render={pythagorasRender}
          />

          <FractalSection
            title="Zbiór Mandelbrota"
            description="Zbiór punktów w płaszczyźnie zespolonej, których iteracja funkcji z^2 + c nie ucieka do nieskończoności."
            code={mandelbrotCode}
            minDepth={50}
            maxDepth={800}
            render={mandelbrotRender}
          />

          <FractalSection
            title="Fraktal w Minecraft"
            description="Fraktalny szum (fBm) wykorzystujący wiele oktaw szumu Perlin'a do generowania terenu przypominającego krajobrazy z Minecraft."
            code={fbmCode}
            minDepth={1}
            maxDepth={8}
            render={fbmRender}
          />
        </main>
      </div>
    </>
  );
}

export default App;