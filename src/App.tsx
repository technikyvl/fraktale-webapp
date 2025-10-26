import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Card } from './components/Card';
import { FractalDemo } from './components/FractalDemo';
import { topics, Topic } from './data/topics';
import { searchTopics } from './lib/search';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('fractals');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(topics[0]);
  const [isPresenterMode, setIsPresenterMode] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Inicjalizuj domyślny motyw
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Skróty klawiszowe
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Fokus wyszukiwarki
      if (e.key === '/' && e.target !== document.querySelector('input[type="text"]')) {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
      }

      // Tryb prezentera
      if (e.key === 'p' || e.key === 'P') {
        setIsPresenterMode(!isPresenterMode);
      }

      // Przełącz motyw
      if (e.key === 'd' || e.key === 'D') {
        setIsDark(!isDark);
      }

      // ESC - wyjdź z trybu prezentera
      if (e.key === 'Escape') {
        setIsPresenterMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenterMode, isDark]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSelectedTopic(null);
      return;
    }

    const results = searchTopics(query, topics);
    if (results.length > 0) {
      const topic = topics.find((t) => t.id === results[0].topicId);
      if (topic) setSelectedTopic(topic);
    }
  }, []);

  const handleSectionChange = useCallback((section: string) => {
    setSelectedSection(section);
    setSearchQuery('');
    setSelectedTopic(null);

    // Jeśli wybrano fraktal, znajdź odpowiedni temat
    if (section.startsWith('fractal-')) {
      const topicId = section.replace('fractal-', '');
      const topic = topics.find((t) => t.id === topicId);
      if (topic) setSelectedTopic(topic);
    } else if (section === 'quick') {
      setSelectedTopic(topics[0]); // Domyślnie pokaż pierwszy temat
    }
  }, []);

  // Znajdź temat do wyświetlenia
  const displayTopic = selectedTopic || topics[0];

  return (
    <div className={`flex min-h-screen ${isDark ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Lewy panel - ukryty w trybie prezentera */}
      {!isPresenterMode && (
        <Sidebar
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          selectedSection={selectedSection}
          onSectionChange={handleSectionChange}
          isDark={isDark}
          onThemeToggle={() => setIsDark(!isDark)}
        />
      )}

      {/* Główna część */}
      <main className={`flex-1 ${isPresenterMode ? 'p-8' : 'p-6'}`}>
        {/* Przycisk trybu prezentera */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{displayTopic?.title || 'Dashboard'}</h2>
          <button
            onClick={() => setIsPresenterMode(!isPresenterMode)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            {isPresenterMode ? 'Wyłącz tryb prezentera (P lub ESC)' : 'Tryb prezentera (P)'}
          </button>
        </div>

        {/* Demo fraktali - jeśli wybrano sekcję fraktali */}
        {selectedSection.startsWith('fractal-') && (
          <div className="mb-6">
            <FractalDemo />
          </div>
        )}

        {/* Karty z treścią */}
        {displayTopic && (
          <div className="space-y-4">
            <Card title="TL;DR">
              <p className="text-gray-700 dark:text-gray-300">{displayTopic.tldr}</p>
            </Card>

            <Card title="Kroki">
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                {displayTopic.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </Card>

            <Card title="Algorytm (pseudo + TS)">
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-x-auto">
                {displayTopic.pseudocode}
              </pre>
              <details className="mt-4">
                <summary className="cursor-pointer font-semibold mb-2">Kod TypeScript</summary>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-x-auto mt-2">
                  {displayTopic.code}
                </pre>
              </details>
            </Card>

            <Card title="Formuły">
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                {displayTopic.formulas.map((formula, i) => (
                  <li key={i} className="font-mono text-sm">{formula}</li>
                ))}
              </ul>
            </Card>

            <Card title="Pytania egzaminatora (Q&A)">
              <div className="space-y-4">
                {displayTopic.qa.map((qa, i) => (
                  <div key={i} className="border-l-4 border-blue-500 pl-4">
                    <p className="font-semibold mb-1">❓ {qa.question}</p>
                    <p className="text-gray-600 dark:text-gray-400">✅ {qa.answer}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Jedno zdanie">
              <p className="font-semibold text-gray-700 dark:text-gray-300">{displayTopic.oneliner}</p>
            </Card>

            <Card title="Błędy">
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                {displayTopic.mistakes.map((mistake, i) => (
                  <li key={i} className="text-red-600 dark:text-red-400">⚠️ {mistake}</li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        {/* Pasek statusu */}
        <footer className="fixed bottom-0 left-0 right-0 h-12 border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-between px-6 text-sm">
          <div className="flex gap-6 text-gray-600 dark:text-gray-400">
            <span>Dashboard Prezentera – Informatyka (PL)</span>
            <span>Skróty: / - szukaj, P - prezentacja, D - motyw, ESC - wyjście</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
