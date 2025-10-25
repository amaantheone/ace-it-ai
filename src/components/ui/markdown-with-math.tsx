'use client';

import React from 'react';
import Markdown from 'markdown-to-jsx';
import { InlineMath, BlockMath } from './math';

interface MathComponentProps {
  children: React.ReactNode;
}

// Function to decode escaped math content
function decodeMathContent(content: string): string {
  return content
    .replace(/&#123;/g, '{')
    .replace(/&#125;/g, '}')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

// Function to safely convert children to string, handling React elements
function childrenToString(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }
  
  if (Array.isArray(children)) {
    return children.map(child => childrenToString(child)).join('');
  }
  
  if (React.isValidElement(children)) {
    // If it's a React element, try to extract text content
    const props = children.props as { children?: React.ReactNode };
    if (typeof props.children === 'string') {
      return props.children;
    }
    // For complex elements, recursively extract text
    return childrenToString(props.children);
  }
  
  // If it's an object that got stringified to [object Object], 
  // try to extract meaningful content
  if (typeof children === 'object' && children !== null) {
    // Check if it has common text properties
    const obj = children as { children?: React.ReactNode; props?: { children?: React.ReactNode } };
    if (obj.children !== undefined) {
      return childrenToString(obj.children);
    }
    if (obj.props?.children !== undefined) {
      return childrenToString(obj.props.children);
    }
    // Last resort: return empty string rather than [object Object]
    return '';
  }
  
  return String(children);
}

// Custom component for inline math
function MathComponent({ children }: MathComponentProps) {
  // Convert children to string safely, then decode
  const rawMathString = childrenToString(children);
  const mathString = decodeMathContent(rawMathString);
  
  return <InlineMath>{mathString}</InlineMath>;
}

// Custom component for block math
function BlockMathComponent({ children }: MathComponentProps) {
  // Convert children to string safely, then decode
  const rawMathString = childrenToString(children);
  const mathString = decodeMathContent(rawMathString);
  return <BlockMath>{mathString}</BlockMath>;
}

interface MarkdownWithMathProps {
  children: string;
  className?: string;
}

// Function to escape LaTeX content for safe markdown processing
function escapeMathContent(mathContent: string): string {
  // Encode curly braces and other special characters that markdown-to-jsx might interpret
  return mathContent
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Function to parse and replace LaTeX expressions
function preprocessMathContent(content: string): string {
  // First, handle expressions already wrapped in dollar signs
  content = content.replace(/\$\$([^$]+?)\$\$/g, (match, mathContent) => {
    const escaped = escapeMathContent(mathContent);
    return `<BlockMath>${escaped}</BlockMath>`;
  });
  
  content = content.replace(/(?<!\$)\$(?!\$)([^$\n]+?)(?<!\$)\$(?!\$)/g, (match, mathContent) => {
    const escaped = escapeMathContent(mathContent);
    return `<MathComponent>${escaped}</MathComponent>`;
  });
  
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
        const escaped = escapeMathContent(trimmedLine);
        return `<BlockMath>${escaped}</BlockMath>`;
      }
      // If it's mixed content, wrap the whole line as inline math
      else if (trimmedLine.length > 0) {
        const escaped = escapeMathContent(trimmedLine);
        return `<MathComponent>${escaped}</MathComponent>`;
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
            },
            table: {
              props: {
                className: 'w-full border-collapse border border-border rounded-lg overflow-hidden my-4 table-fixed'
              }
            },
            thead: {
              props: {
                className: 'bg-muted/50'
              }
            },
            tbody: {
              props: {
                className: 'divide-y divide-border'
              }
            },
            tr: {
              props: {
                className: 'border-b border-border hover:bg-muted/30 transition-colors'
              }
            },
            th: {
              props: {
                className: 'border border-border px-2 py-2 text-left font-semibold text-foreground bg-muted/70 break-words text-xs md:text-sm'
              }
            },
            td: {
              props: {
                className: 'border border-border px-2 py-2 text-foreground align-top break-words text-xs md:text-sm'
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