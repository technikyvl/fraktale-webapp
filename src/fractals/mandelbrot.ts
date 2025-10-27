// Zbiór Mandelbrota - iteracja funkcji z^2 + c dla każdego piksela

export function render(ctx: CanvasRenderingContext2D, depth: number): void {
  const width = 720;
  const height = 720;
  const imageData = ctx.createImageData(width, height);
  const maxIter = depth; // depth (50-800) mapuje na maxIter
  
  // Zakres w płaszczyźnie zespolonej
  const minX = -2.5;
  const maxX = 1.5;
  const minY = -2.0;
  const maxY = 2.0;
  
  for (let px = 0; px < width; px++) {
    for (let py = 0; py < height; py++) {
      // Mapuj piksel na punkt w płaszczyźnie zespolonej
      const x0 = minX + (maxX - minX) * (px / width);
      const y0 = minY + (maxY - minY) * (py / height);
      
      // Iteruj z^2 + c
      let x = 0;
      let y = 0;
      let iter = 0;
      
      while (x * x + y * y <= 4 && iter < maxIter) {
        const xtemp = x * x - y * y + x0;
        y = 2 * x * y + y0;
        x = xtemp;
        iter++;
      }
      
      // Kolor na podstawie liczby iteracji
      const idx = (py * width + px) * 4;
      const intensity = (iter / maxIter) * 255;
      
      imageData.data[idx] = intensity;     // R
      imageData.data[idx + 1] = intensity; // G
      imageData.data[idx + 2] = intensity; // B
      imageData.data[idx + 3] = 255;       // A
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}
