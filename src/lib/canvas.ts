// Funkcje pomocnicze dla pracy z Canvas (DPI-aware, eksport PNG, skalowanie)

export function withHiDPICanvas(canvas: HTMLCanvasElement, cssWidth: number, cssHeight: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Brak kontekstu 2D');

  const dpr = window.devicePixelRatio || 1;
  // Ustawiamy rozmiar fizyczny płótna do DPI
  canvas.width = Math.floor(cssWidth * dpr);
  canvas.height = Math.floor(cssHeight * dpr);
  canvas.style.width = cssWidth + 'px';
  canvas.style.height = cssHeight + 'px';

  // Skalujemy kontekst, by 1 jednostka = 1 px CSS
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, scale: dpr } as const;
}

export function exportCanvasAsPng(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export type Rect = { x: number; y: number; w: number; h: number };

// Oblicza skalowanie i przesunięcie, aby dopasować zawartość (bbox) do prostokąta docelowego
export function fitAndScale(
  bbox: { minX: number; minY: number; maxX: number; maxY: number },
  target: Rect
) {
  const width = bbox.maxX - bbox.minX;
  const height = bbox.maxY - bbox.minY;
  const scale = Math.min(target.w / width, target.h / height);
  const offsetX = target.x + (target.w - width * scale) / 2 - bbox.minX * scale;
  const offsetY = target.y + (target.h - height * scale) / 2 - bbox.minY * scale;
  return { scale, offsetX, offsetY };
}


