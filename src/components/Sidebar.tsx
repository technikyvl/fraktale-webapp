import React from 'react';

interface SidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSection: string;
  onSectionChange: (section: string) => void;
  isDark: boolean;
  onThemeToggle: () => void;
}

const sections = [
  { id: 'quick', label: 'Szybka ściąga', icon: '⚡' },
  { id: 'fractals', label: 'Fraktale', icon: '❄️' },
  { id: 'algorithms', label: 'Algorytmy', icon: '⚙️' },
  { id: 'formulas', label: 'Przydatne wzory', icon: '📐' },
];

const fractalSubsections = [
  { id: 'koch-snowflake', label: 'Płatek Kocha' },
  { id: 'sierpinski', label: 'Trójkąt Sierpińskiego' },
  { id: 'mandelbrot', label: 'Zbiór Mandelbrota' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  searchQuery,
  onSearchChange,
  selectedSection,
  onSectionChange,
  isDark,
  onThemeToggle,
}) => {
  return (
    <aside className="w-[320px] shrink-0 border-r border-gray-700 dark:bg-gray-900 bg-white p-6 space-y-6 overflow-y-auto">
      <div>
        <h1 className="text-xl font-bold">Dashboard Prezentera</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Informatyka</p>
      </div>

      {/* Wyszukiwarka */}
      <div>
        <input
          type="text"
          placeholder="Szukaj..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Sekcje */}
      <div className="space-y-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
              selectedSection === section.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span className="mr-2">{section.icon}</span>
            {section.label}
          </button>
        ))}

        {/* Podsekcje fraktali */}
        {selectedSection === 'fractals' && (
          <div className="ml-4 space-y-1">
            {fractalSubsections.map((sub) => (
              <button
                key={sub.id}
                onClick={() => onSectionChange(`fractal-${sub.id}`)}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  selectedSection === `fractal-${sub.id}`
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Przełącznik motywu */}
      <button
        onClick={onThemeToggle}
        className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        {isDark ? '☀️ Jasny' : '🌙 Ciemny'}
      </button>
    </aside>
  );
};

