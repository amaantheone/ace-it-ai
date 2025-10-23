'use client';

import React from 'react';
import Markdown from 'markdown-to-jsx';
import { InlineMath, BlockMath } from './math';

interface MathComponentProps {
  children: React.ReactNode;
}

// Custom component for inline math
function MathComponent({ children }: MathComponentProps) {
  // Convert children to string, handling arrays
  const mathString = Array.isArray(children) ? children.join('') : String(children);
  return <InlineMath>{mathString}</InlineMath>;
}

// Custom component for block math
function BlockMathComponent({ children }: MathComponentProps) {
  // Convert children to string, handling arrays
  const mathString = Array.isArray(children) ? children.join('') : String(children);
  return <BlockMath>{mathString}</BlockMath>;
}

interface MarkdownWithMathProps {
  children: string;
  className?: string;
}

// Function to parse and replace LaTeX expressions
function preprocessMathContent(content: string): string {
  // First, handle expressions already wrapped in dollar signs
  content = content.replace(/\$\$([^$]+?)\$\$/g, '<BlockMath>$1</BlockMath>');
  content = content.replace(/(?<!\$)\$(?!\$)([^$\n]+?)(?<!\$)\$(?!\$)/g, '<MathComponent>$1</MathComponent>');
  
  // Handle unwrapped LaTeX expressions line by line
  const lines = content.split('\n');
  const processedLines = lines.map(line => {
    // Skip already processed lines
    if (line.includes('<MathComponent>') || line.includes('<BlockMath>')) {
      return line;
    }
    
    const trimmedLine = line.trim();
    
    // Check if this line contains LaTeX expressions
    const hasLatexCommand = /\\[a-zA-Z]+/.test(trimmedLine);
    const hasFraction = /\\frac\{[^}]+\}\{[^}]+\}/.test(trimmedLine);
    const hasSpecialChars = /[\^_]\{[^}]+\}/.test(trimmedLine);
    const hasParentheses = /\\left.*\\right/.test(trimmedLine);
    
    if (hasLatexCommand || hasFraction || hasSpecialChars || hasParentheses) {
      // If line starts with LaTeX command, likely a block equation
      if (/^\\/.test(trimmedLine)) {
        return `<BlockMath>${trimmedLine}</BlockMath>`;
      }
      // If it's mixed content, wrap the whole line as inline math
      else if (trimmedLine.length > 0) {
        return `<MathComponent>${trimmedLine}</MathComponent>`;
      }
    }
    
    return line;
  });
  
  return processedLines.join('\n');
}

export function MarkdownWithMath({ children, className = '' }: MarkdownWithMathProps) {
  const processedContent = preprocessMathContent(children);

  return (
    <div className={className}>
      <Markdown
        options={{
          overrides: {
            MathComponent: {
              component: MathComponent,
            },
            BlockMath: {
              component: BlockMathComponent,
            },
            p: {
              props: {
                className: 'mb-2 break-words'
              }
            },
            ul: {
              props: {
                className: 'list-disc pl-4 mb-2 space-y-1 break-words'
              }
            },
            li: {
              props: {
                className: 'ml-2 break-words'
              }
            },
            code: {
              props: {
                className: 'break-words overflow-x-auto text-xs md:text-sm bg-muted px-1 py-0.5 rounded'
              }
            },
            pre: {
              props: {
                className: 'break-words overflow-x-auto text-xs md:text-sm whitespace-pre-wrap bg-muted p-3 rounded'
              }
            },
            h1: {
              props: {
                className: 'text-2xl font-bold mb-4 break-words'
              }
            },
            h2: {
              props: {
                className: 'text-xl font-bold mb-3 break-words'
              }
            },
            h3: {
              props: {
                className: 'text-lg font-bold mb-2 break-words'
              }
            },
            strong: {
              props: {
                className: 'font-semibold'
              }
            },
            em: {
              props: {
                className: 'italic'
              }
            },
            blockquote: {
              props: {
                className: 'border-l-4 border-muted pl-4 italic break-words'
              }
            }
          }
        }}
      >
        {processedContent}
      </Markdown>
    </div>
  );
}