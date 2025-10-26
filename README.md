# Dashboard Prezentera – Informatyka (PL)

Minimalistyczna aplikacja React + TypeScript + Vite + Tailwind służąca jako szybka ściąga podczas prezentacji z informatyki.

## 🚀 Instalacja i uruchomienie

```bash
npm install
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:5173`

## 📁 Struktura projektu

```
src/
  ├── App.tsx              # Główny layout 2-kolumnowy
  ├── components/
  │   ├── Sidebar.tsx      # Panel nawigacyjny + wyszukiwarka
  │   ├── Card.tsx         # Karta z accordion
  │   └── FractalDemo.tsx # Demo fraktali (Canvas)
  ├── data/
  │   └── topics.ts       # Tablica tematów/ściąg
  ├── lib/
  │   └── search.ts      # Proste wyszukiwanie
  └── index.css          # Style Tailwind
```

## ⌨️ Skróty klawiszowe

- `/` – Fokus wyszukiwarki
- `P` – Przełącz tryb prezentera (ukrywa lewy panel)
- `F` – Przełącz demo fraktala (Koch/Sierpiński/Mandelbrot)
- `+/-` – Zmiana głębokości w demie
- `D` – Przełącz motyw (jasny/ciemny)
- `ESC` – Wyjście z trybu prezentera

## 🎯 Funkcje

- **Wyszukiwarka** – Fuzzy search po tytułach i treściach
- **Tryb prezentera** – Pełnoekranowy widok ukrywający nawigację
- **Demo fraktali** – Interaktywne dema: Płatek Kocha, Trójkąt Sierpińskiego, Zbiór Mandelbrota
- **Przełącznik motywu** – Jasny/Ciemny (domyślnie ciemny)
- **Responsywny** – Działa na różnych rozdzielczościach

## 📝 Zawartość

Aplikacja zawiera gotowe ściągi z tematów:

- **Fraktale**: Płatek Kocha, Trójkąt Sierpińskiego, Zbiór Mandelbrota
- **Algorytmy**: Wyszukiwanie binarne, QuickSort
- **Formuły**: Wzory matematyczne i złożoności obliczeniowe

Każdy temat zawiera sekcje:
- TL;DR – Krótkie podsumowanie
- Kroki – Opis algorytmu krok po kroku
- Algorytm – Pseudokod i kod TypeScript
- Formuły – Wzory matematyczne
- Q&A – Pytania egzaminatora
- Jedno zdanie – Definicja w jednym zdaniu
- Błędy – Typowe błędy

## 🎨 Motyw

Domyślnie uruchamia się w trybie ciemnym. Przełącznik w sidebarze pozwala zmienić na tryb jasny.

## 📦 Build

```bash
npm run build
```

Pliki produkcyjne zostaną wygenerowane w folderze `dist/`.

## 🛠️ Technologie

- **React** 18
- **TypeScript** 5
- **Vite** 5
- **Tailwind CSS** 3

