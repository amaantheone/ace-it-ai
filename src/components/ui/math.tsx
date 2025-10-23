'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';

interface MathProps {
  children: string;
  displayMode?: boolean;
  className?: string;
}

export function Math({ children, displayMode = false, className = '' }: MathProps) {
  const [html, setHtml] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');

  React.useEffect(() => {
    if (!children) {
      setHtml('');
      return;
    }

    try {
      const rendered = katex.renderToString(children, {
        displayMode,
        throwOnError: false,
        errorColor: '#cc0000',
        strict: 'warn',
        trust: true, // Allow \text{} and other commands
      });
      setHtml(rendered);
      setError('');
    } catch (err) {
      console.warn('Math rendering error for:', children, err);
      setError(err instanceof Error ? err.message : 'Math rendering error');
      setHtml(children); // Fallback to raw text
    }
  }, [children, displayMode]);

  if (error) {
    console.warn('Math rendering error:', error);
  }

  return (
    <span 
      className={`katex-math ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// Inline math component
export function InlineMath({ children, className = '' }: { children: string; className?: string }) {
  return <Math displayMode={false} className={className}>{children}</Math>;
}

// Block math component
export function BlockMath({ children, className = '' }: { children: string; className?: string }) {
  return <Math displayMode={true} className={`block ${className}`}>{children}</Math>;
}