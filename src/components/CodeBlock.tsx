import { useEffect, useRef } from 'react';
import '../styles/CodeBlock.css';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'typescript' }: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (preRef.current) {
      // Automatyczne wyrównanie przy pierwszym renderze
      preRef.current.scrollLeft = 0;
    }
  }, [code]);

  return (
    <div className="code-block">
      <pre ref={preRef} className="code-content">
        <code>{code}</code>
      </pre>
    </div>
  );
}
