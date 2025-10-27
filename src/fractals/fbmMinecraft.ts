// Fraktalny szum (fBm) - suma oktaw szumu Perlin'a

// Prosty pseudo-random generator
function hash(x: number, y: number): number {
  const n = x * 374761393 + y * 668265263;
  const res = Math.sin(n) * 43758.5453123;
  return res - Math.floor(res);
}

// Interpolacja liniowa
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Smoothstep
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

// Gradient noise (prosta wersja szumu Perlin)
function noise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  
  // Wektory gradientów
  const n00 = hash(ix, iy);
  const n01 = hash(ix, iy + 1);
  const n10 = hash(ix + 1, iy);
  const n11 = hash(ix + 1, iy + 1);
  
  // Produkt skalarny
  const d00 = (n00 - 0.5) * fx + (n00 - 0.5) * fy;
  const d01 = (n01 - 0.5) * fx + (n01 - 0.5) * (fy - 1);
  const d10 = (n10 - 0.5) * (fx - 1) + (n10 - 0.5) * fy;
  const d11 = (n11 - 0.5) * (fx - 1) + (n11 - 0.5) * (fy - 1);
  
  // Interpolacja dwuliniowa
  const sx = smoothstep(fx);
  const sy = smoothstep(fy);
  
  const a = lerp(d00, d10, sx);
  const b = lerp(d01, d11, sx);
  return lerp(a, b, sy);
}

export function render(ctx: CanvasRenderingContext2D, depth: number): void {
  const width = 720;
  const height = 720;
  const imageData = ctx.createImageData(width, height);
  
  // depth to liczba oktaw (1-8)
  const octaves = depth;
  
  const scale = 0.02;
  const offsetX = 0;
  const offsetY = 0;
  
  for (let px = 0; px < width; px++) {
    for (let py = 0; py < height; py++) {
      let value = 0;
      let amplitude = 1;
      let frequency = 1;
      
      // Sumuj oktawy fBm
      for (let i = 0; i < octaves; i++) {
        const nx = (px * scale * frequency) + offsetX;
        const ny = (py * scale * frequency) + offsetY;
        
        value += noise(nx, ny) * amplitude;
        
        amplitude *= 0.5; // Każda oktawa ma połowę amplitudy
        frequency *= 2;   // Każda oktawa ma 2× wyższą częstotliwość
      }
      
      // Normalizuj do zakresu 0-255
      const normalized = ((value + 1) / 2) * 255;
      const gray = Math.max(0, Math.min(255, normalized));
      
      const idx = (py * width + px) * 4;
      imageData.data[idx] = gray;     // R
      imageData.data[idx + 1] = gray; // G
      imageData.data[idx + 2] = gray; // B
      imageData.data[idx + 3] = 255;  // A
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}
