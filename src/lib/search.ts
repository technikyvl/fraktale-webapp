export interface SearchResult {
  topicId: string;
  matches: {
    field: string;
    highlighted: string;
  }[];
  score: number;
}

export function searchTopics(query: string, topics: any[]): SearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  for (const topic of topics) {
    const matches: SearchResult['matches'] = [];
    let score = 0;

    // Sprawdź tytuł
    if (topic.title.toLowerCase().includes(normalizedQuery)) {
      matches.push({
        field: 'title',
        highlighted: highlight(topic.title, normalizedQuery),
      });
      score += 10;
    }

    // Sprawdź TL;DR
    if (topic.tldr.toLowerCase().includes(normalizedQuery)) {
      matches.push({
        field: 'tldr',
        highlighted: highlight(topic.tldr, normalizedQuery),
      });
      score += 5;
    }

    // Sprawdź kroki
    topic.steps.forEach((step: string, index: number) => {
      if (step.toLowerCase().includes(normalizedQuery)) {
        matches.push({
          field: `step-${index}`,
          highlighted: highlight(step, normalizedQuery),
        });
        score += 2;
      }
    });

    // Sprawdź Q&A
    topic.qa.forEach((qa: any, index: number) => {
      if (qa.question.toLowerCase().includes(normalizedQuery)) {
        matches.push({
          field: `qa-q-${index}`,
          highlighted: highlight(qa.question, normalizedQuery),
        });
        score += 3;
      }
      if (qa.answer.toLowerCase().includes(normalizedQuery)) {
        matches.push({
          field: `qa-a-${index}`,
          highlighted: highlight(qa.answer, normalizedQuery),
        });
        score += 1;
      }
    });

    if (matches.length > 0) {
      results.push({
        topicId: topic.id,
        matches,
        score,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

function highlight(text: string, query: string): string {
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return text;

  const before = text.substring(0, index);
  const match = text.substring(index, index + query.length);
  const after = text.substring(index + query.length);

  return `${before}<mark class="bg-yellow-300 dark:bg-yellow-700">${match}</mark>${after}`;
}

