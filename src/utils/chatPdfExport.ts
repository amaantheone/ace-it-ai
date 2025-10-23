import { Message } from "@/hooks/useSessionStore";

/**
 * Converts mathematical expressions and symbols to proper HTML
 */
function convertMathToHTML(text: string): string {
  return (
    text
      // Handle display math expressions $$...$$ first (multi-line support)
      .replace(/\$\$([^$]+)\$\$/g, (match, content) => {
        const processedContent = processMathContent(content.trim());
        return `<div class="math-display">${processedContent}</div>`;
      })

      // Handle inline math expressions $...$
      .replace(/\$([^$]+)\$/g, (match, content) => {
        const processedContent = processMathContent(content.trim());
        return `<span class="math-inline">${processedContent}</span>`;
      })

      // Process LaTeX commands outside of $ delimiters
      .replace(
        /\\frac\{([^}]+)\}\{([^}]+)\}/g,
        '<span class="fraction"><span class="numerator">$1</span><span class="denominator">$2</span></span>'
      )
      .replace(/\\left\(/g, '<span class="math-paren">(</span>')
      .replace(/\\right\)/g, '<span class="math-paren">)</span>')
      .replace(/\\left\[/g, '<span class="math-bracket">[</span>')
      .replace(/\\right\]/g, '<span class="math-bracket">]</span>')

      // Text within math expressions \text{...}
      .replace(/\\text\{([^}]+)\}/g, '<span class="math-text">$1</span>')

      // Trigonometric functions
      .replace(/\\sin\b/g, '<span class="math-function">sin</span>')
      .replace(/\\cos\b/g, '<span class="math-function">cos</span>')
      .replace(/\\tan\b/g, '<span class="math-function">tan</span>')
      .replace(/\\csc\b/g, '<span class="math-function">csc</span>')
      .replace(/\\sec\b/g, '<span class="math-function">sec</span>')
      .replace(/\\cot\b/g, '<span class="math-function">cot</span>')
      .replace(/\\arcsin\b/g, '<span class="math-function">arcsin</span>')
      .replace(/\\arccos\b/g, '<span class="math-function">arccos</span>')
      .replace(/\\arctan\b/g, '<span class="math-function">arctan</span>')
      .replace(/\\sinh\b/g, '<span class="math-function">sinh</span>')
      .replace(/\\cosh\b/g, '<span class="math-function">cosh</span>')
      .replace(/\\tanh\b/g, '<span class="math-function">tanh</span>')

      // Handle standalone trigonometric functions (without backslash)
      .replace(
        /\b(sin|cos|tan|csc|sec|cot|arcsin|arccos|arctan|sinh|cosh|tanh)\s+/g,
        '<span class="math-function">$1</span> '
      )

      // Logarithmic functions
      .replace(/\\log\b/g, '<span class="math-function">log</span>')
      .replace(/\\ln\b/g, '<span class="math-function">ln</span>')
      .replace(/\\lg\b/g, '<span class="math-function">lg</span>')

      // Limits and calculus
      .replace(/\\lim\b/g, '<span class="math-function">lim</span>')
      .replace(/\\sup\b/g, '<span class="math-function">sup</span>')
      .replace(/\\inf\b/g, '<span class="math-function">inf</span>')
      .replace(/\\max\b/g, '<span class="math-function">max</span>')
      .replace(/\\min\b/g, '<span class="math-function">min</span>')

      // Simple fractions like 1/2, 3/4, etc. (but not in already processed fractions)
      .replace(
        /\b(\d+)\/(\d+)\b/g,
        '<span class="fraction"><span class="numerator">$1</span><span class="denominator">$2</span></span>'
      )

      // Greek letters (lowercase)
      .replace(/\\alpha\b/g, "α")
      .replace(/\\beta\b/g, "β")
      .replace(/\\gamma\b/g, "γ")
      .replace(/\\delta\b/g, "δ")
      .replace(/\\epsilon\b/g, "ε")
      .replace(/\\zeta\b/g, "ζ")
      .replace(/\\eta\b/g, "η")
      .replace(/\\theta\b/g, "θ")
      .replace(/\\iota\b/g, "ι")
      .replace(/\\kappa\b/g, "κ")
      .replace(/\\lambda\b/g, "λ")
      .replace(/\\mu\b/g, "μ")
      .replace(/\\nu\b/g, "ν")
      .replace(/\\xi\b/g, "ξ")
      .replace(/\\omicron\b/g, "ο")
      .replace(/\\pi\b/g, "π")
      .replace(/\\rho\b/g, "ρ")
      .replace(/\\sigma\b/g, "σ")
      .replace(/\\tau\b/g, "τ")
      .replace(/\\upsilon\b/g, "υ")
      .replace(/\\phi\b/g, "φ")
      .replace(/\\chi\b/g, "χ")
      .replace(/\\psi\b/g, "ψ")
      .replace(/\\omega\b/g, "ω")

      // Greek letters (uppercase)
      .replace(/\\Alpha\b/g, "Α")
      .replace(/\\Beta\b/g, "Β")
      .replace(/\\Gamma\b/g, "Γ")
      .replace(/\\Delta\b/g, "Δ")
      .replace(/\\Epsilon\b/g, "Ε")
      .replace(/\\Zeta\b/g, "Ζ")
      .replace(/\\Eta\b/g, "Η")
      .replace(/\\Theta\b/g, "Θ")
      .replace(/\\Iota\b/g, "Ι")
      .replace(/\\Kappa\b/g, "Κ")
      .replace(/\\Lambda\b/g, "Λ")
      .replace(/\\Mu\b/g, "Μ")
      .replace(/\\Nu\b/g, "Ν")
      .replace(/\\Xi\b/g, "Ξ")
      .replace(/\\Omicron\b/g, "Ο")
      .replace(/\\Pi\b/g, "Π")
      .replace(/\\Rho\b/g, "Ρ")
      .replace(/\\Sigma\b/g, "Σ")
      .replace(/\\Tau\b/g, "Τ")
      .replace(/\\Upsilon\b/g, "Υ")
      .replace(/\\Phi\b/g, "Φ")
      .replace(/\\Chi\b/g, "Χ")
      .replace(/\\Psi\b/g, "Ψ")
      .replace(/\\Omega\b/g, "Ω")

      // Mathematical symbols
      .replace(/\\infty\b/g, "∞")
      .replace(/\\sum\b/g, "∑")
      .replace(/\\prod\b/g, "∏")
      .replace(/\\int\b/g, "∫")
      .replace(/\\partial\b/g, "∂")
      .replace(/\\nabla\b/g, "∇")
      .replace(/\\sqrt\b/g, "√")
      .replace(/\\pm\b/g, "±")
      .replace(/\\mp\b/g, "∓")
      .replace(/\\times\b/g, "×")
      .replace(/\\div\b/g, "÷")
      .replace(/\\cdot\b/g, "·")
      .replace(/\\leq\b/g, "≤")
      .replace(/\\geq\b/g, "≥")
      .replace(/\\neq\b/g, "≠")
      .replace(/\\approx\b/g, "≈")
      .replace(/\\equiv\b/g, "≡")
      .replace(/\\propto\b/g, "∝")
      .replace(/\\in\b/g, "∈")
      .replace(/\\notin\b/g, "∉")
      .replace(/\\subset\b/g, "⊂")
      .replace(/\\supset\b/g, "⊃")
      .replace(/\\cap\b/g, "∩")
      .replace(/\\cup\b/g, "∪")
      .replace(/\\rightarrow\b/g, "→")
      .replace(/\\leftarrow\b/g, "←")
      .replace(/\\leftrightarrow\b/g, "↔")
      .replace(/\\Rightarrow\b/g, "⇒")
      .replace(/\\Leftarrow\b/g, "⇐")
      .replace(/\\Leftrightarrow\b/g, "⇔")
      .replace(/\\forall\b/g, "∀")
      .replace(/\\exists\b/g, "∃")
      .replace(/\\emptyset\b/g, "∅")

      // Superscripts and subscripts (simple patterns)
      .replace(/\^(\d+|\w)/g, "<sup>$1</sup>")
      .replace(/_(\d+|\w)/g, "<sub>$1</sub>")

      // More complex superscripts and subscripts with braces
      .replace(/\^\{([^}]+)\}/g, "<sup>$1</sup>")
      .replace(/\_\{([^}]+)\}/g, "<sub>$1</sub>")

      // Square roots
      .replace(
        /\\sqrt\{([^}]+)\}/g,
        '<span class="sqrt">√<span class="sqrt-content">$1</span></span>'
      )
  );
}

/**
 * Process content within math delimiters
 */
function processMathContent(content: string): string {
  return (
    content
      // Handle fractions first
      .replace(
        /\\frac\{([^}]+)\}\{([^}]+)\}/g,
        '<span class="fraction"><span class="numerator">$1</span><span class="denominator">$2</span></span>'
      )

      // Handle parentheses
      .replace(/\\left\(/g, '<span class="math-paren">(</span>')
      .replace(/\\right\)/g, '<span class="math-paren">)</span>')
      .replace(/\\left\[/g, '<span class="math-bracket">[</span>')
      .replace(/\\right\]/g, '<span class="math-bracket">]</span>')

      // Handle text within math
      .replace(/\\text\{([^}]+)\}/g, '<span class="math-text">$1</span>')

      // Convert standalone words (like "Opposite", "Adjacent", "Hypotenuse") to upright text
      .replace(/\b([A-Z][a-z]+)\b/g, '<span class="math-text">$1</span>')

      // Handle superscripts and subscripts with better formatting
      .replace(/\^\{([^}]+)\}/g, "<sup>$1</sup>")
      .replace(/\_\{([^}]+)\}/g, "<sub>$1</sub>")
      .replace(/\^(\d+|\w)/g, "<sup>$1</sup>")
      .replace(/_(\d+|\w)/g, "<sub>$1</sub>")

      // Handle simple fractions within math
      .replace(
        /\b([a-z]\d*)\s*\/\s*([a-z]\d*)\b/g,
        '<span class="fraction"><span class="numerator">$1</span><span class="denominator">$2</span></span>'
      )
      .replace(
        /\b(\d+)\s*\/\s*(\d+)\b/g,
        '<span class="fraction"><span class="numerator">$1</span><span class="denominator">$2</span></span>'
      )

      // Clean up extra whitespace but preserve structure
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Converts markdown to HTML while preserving formatting
 */
function convertMarkdownToHTML(text: string): string {
  // First, convert math expressions
  let html = convertMathToHTML(text);

  // Then process markdown
  html = html
    // Code blocks with language highlighting indicators
    .replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang ? ` data-language="${lang}"` : "";
      return `<pre class="code-block"${language}><code>${code.trim()}</code></pre>`;
    })
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    // Bold text (multiple patterns)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    // Italic text (multiple patterns)
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    // Strikethrough
    .replace(/~~([^~]+)~~/g, "<del>$1</del>")
    // Headers (from largest to smallest)
    .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    // Auto-link URLs
    .replace(/(https?:\/\/[^\s<>"]+)/g, '<a href="$1" target="_blank">$1</a>')
    // Blockquotes
    .replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>")
    // Horizontal rules
    .replace(/^---+$/gm, "<hr>")
    .replace(/^\*\*\*+$/gm, "<hr>")
    // Process lists with proper nesting
    .replace(/^(\s*)[-*+]\s+(.+)$/gm, (match, indent, content) => {
      const level = Math.floor(indent.length / 2);
      return `<li class="list-item" data-level="${level}">${content}</li>`;
    })
    .replace(/^(\s*)(\d+)\.\s+(.+)$/gm, (match, indent, num, content) => {
      const level = Math.floor(indent.length / 2);
      return `<li class="list-item ordered" data-level="${level}" data-number="${num}">${content}</li>`;
    });

  // Wrap consecutive list items in ul/ol tags
  html = html.replace(/<li class="list-item"[^>]*>.*?<\/li>/g, (match) => {
    if (match.includes("ordered")) {
      return match.replace('<li class="list-item ordered"', "<li");
    }
    return match.replace('<li class="list-item"', "<li");
  });

  // Convert line breaks and paragraphs
  html = html
    .split("\n\n")
    .map((paragraph) => {
      paragraph = paragraph.trim();
      if (!paragraph) return "";

      // Skip if already wrapped in block elements
      if (paragraph.match(/^<(h[1-6]|pre|blockquote|hr|ul|ol|li)/)) {
        return paragraph;
      }

      // Replace single line breaks with <br> within paragraphs
      paragraph = paragraph.replace(/\n/g, "<br>");

      return `<p>${paragraph}</p>`;
    })
    .filter((p) => p)
    .join("\n\n");

  // Group list items into proper ul/ol elements
  html = html.replace(/(<li[^>]*>.*?<\/li>\s*)+/g, (match) => {
    if (match.includes("data-number=")) {
      return `<ol>${match}</ol>`;
    }
    return `<ul>${match}</ul>`;
  });

  return html;
}

/**
 * Creates a complete HTML document for printing
 */
function createPrintableHTML(
  messages: Message[],
  sessionTitle?: string
): string {
  const validMessages = messages.filter(
    (msg) => !msg.isLoading && msg.message?.trim()
  );

  if (validMessages.length === 0) {
    return "";
  }

  const messagesHTML = validMessages
    .map((message) => {
      const isUser = message.role === "user";
      const role = isUser ? "You" : "Ace AI";
      const content = convertMarkdownToHTML(message.message || "");

      return `
      <div class="message ${isUser ? "user-message" : "ai-message"}">
        <div class="message-role">${role}</div>
        <div class="message-content">${content}</div>
      </div>
    `;
    })
    .join("");

  const title = sessionTitle || "Chat Conversation";
  const exportDate = new Date().toLocaleString();
  const messageCount = validMessages.length;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        @page {
            margin: 0.75in;
            size: A4;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #1a1a1a;
            background: #ffffff;
            padding: 0;
            margin: 0;
        }
        
        .header {
            text-align: center;
            padding: 20px 0 30px 0;
            border-bottom: 2px solid #e5e7eb;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 22px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 10px;
            letter-spacing: -0.025em;
        }
        
        .header-info {
            font-size: 11px;
            color: #6b7280;
            margin: 4px 0;
        }
        
        .message {
            margin-bottom: 28px;
        }
        
        .message-role {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 10px;
            padding-bottom: 6px;
            display: flex;
            align-items: center;
        }
        
        .message-role::after {
            content: '';
            flex: 1;
            height: 1px;
            margin-left: 12px;
        }
        
        .user-message .message-role {
            color: #2563eb;
        }
        
        .user-message .message-role::after {
            background: linear-gradient(to right, #dbeafe, transparent);
        }
        
        .ai-message .message-role {
            color: #dc2626;
        }
        
        .ai-message .message-role::after {
            background: linear-gradient(to right, #fecaca, transparent);
        }
        
        .message-content {
            padding: 16px 20px;
            border-radius: 12px;
            word-wrap: break-word;
            overflow-wrap: break-word;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .user-message .message-content {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-left: 4px solid #2563eb;
            border: 1px solid #e2e8f0;
        }
        
        .ai-message .message-content {
            background: linear-gradient(135deg, #fefefe 0%, #f9fafb 100%);
            border-left: 4px solid #dc2626;
            border: 1px solid #f3f4f6;
        }
        
        /* Typography within messages */
        .message-content p {
            margin: 0 0 14px 0;
            line-height: 1.7;
        }
        
        .message-content p:last-child {
            margin-bottom: 0;
        }
        
        .message-content h1, .message-content h2, .message-content h3, .message-content h4 {
            margin: 18px 0 10px 0;
            font-weight: 700;
            line-height: 1.3;
        }
        
        .message-content h1:first-child,
        .message-content h2:first-child,
        .message-content h3:first-child,
        .message-content h4:first-child {
            margin-top: 0;
        }
        
        .message-content h1 { 
            font-size: 18px; 
            color: #111827;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 6px;
        }
        .message-content h2 { 
            font-size: 16px; 
            color: #374151;
        }
        .message-content h3 { 
            font-size: 14px; 
            color: #4b5563;
        }
        .message-content h4 { 
            font-size: 13px; 
            color: #6b7280;
        }
        
        .message-content strong {
            font-weight: 700;
            color: #111827;
        }
        
        .message-content em {
            font-style: italic;
            color: #374151;
        }
        
        .message-content del {
            text-decoration: line-through;
            color: #9ca3af;
        }
        
        .message-content code.inline-code {
            background: #f1f5f9;
            color: #0f172a;
            padding: 3px 6px;
            border-radius: 4px;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
            font-size: 11px;
            border: 1px solid #e2e8f0;
            font-weight: 500;
        }
        
        .message-content pre.code-block {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
            overflow-x: auto;
            box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .message-content pre.code-block code {
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
            font-size: 11px;
            white-space: pre;
            color: #0f172a;
            line-height: 1.5;
        }
        
        .message-content pre.code-block[data-language]::before {
            content: attr(data-language);
            display: block;
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .message-content ul, .message-content ol {
            margin: 14px 0;
            padding-left: 24px;
        }
        
        .message-content ul {
            list-style-type: disc;
        }
        
        .message-content ol {
            list-style-type: decimal;
        }
        
        .message-content li {
            margin: 6px 0;
            line-height: 1.6;
        }
        
        .message-content li::marker {
            color: #6b7280;
            font-weight: 600;
        }
        
        .message-content a {
            color: #2563eb;
            text-decoration: underline;
            text-decoration-color: rgba(37, 99, 235, 0.3);
            text-underline-offset: 2px;
            transition: all 0.2s ease;
        }
        
        .message-content a:hover {
            color: #1d4ed8;
            text-decoration-color: #1d4ed8;
        }
        
        .message-content blockquote {
            border-left: 4px solid #d1d5db;
            padding-left: 16px;
            margin: 16px 0;
            font-style: italic;
            color: #4b5563;
            background: #f9fafb;
            padding: 12px 16px;
            border-radius: 0 6px 6px 0;
        }
        
        .message-content hr {
            border: none;
            height: 1px;
            background: linear-gradient(to right, transparent, #d1d5db, transparent);
            margin: 20px 0;
        }
        
        /* Mathematical notation styles */
        .fraction {
            display: inline-block;
            vertical-align: middle;
            text-align: center;
            font-size: 0.9em;
        }
        
        .fraction .numerator {
            display: block;
            border-bottom: 1px solid #374151;
            padding: 0 2px;
            line-height: 1.2;
        }
        
        .fraction .denominator {
            display: block;
            padding: 0 2px;
            line-height: 1.2;
        }
        
        .sqrt {
            position: relative;
            display: inline-block;
            font-size: 1.1em;
        }
        
        .sqrt .sqrt-content {
            border-top: 1px solid #374151;
            padding-left: 2px;
        }
        
        .math-inline {
            font-family: 'Times New Roman', serif;
            font-style: italic;
            color: #1f2937;
            margin: 0 2px;
        }
        
        .math-text {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-style: normal;
            font-weight: normal;
            color: #1f2937;
        }
        
        .math-function {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-style: normal;
            font-weight: normal;
            color: #1f2937;
        }
        
        .math-paren, .math-bracket {
            font-family: 'Times New Roman', serif;
            font-size: 1.1em;
            font-weight: normal;
            color: #1f2937;
        }
        
        .math-display {
            font-family: 'Times New Roman', serif;
            font-style: italic;
            color: #1f2937;
            text-align: center;
            margin: 16px 0;
            padding: 12px;
            background: #f9fafb;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            line-height: 1.8;
        }
        
        .math-display .math-text,
        .math-display .math-function {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-style: normal;
        }
        
        .message-content sup {
            font-size: 0.75em;
            vertical-align: super;
            line-height: 0;
        }
        
        .message-content sub {
            font-size: 0.75em;
            vertical-align: sub;
            line-height: 0;
        }
        
        @media print {
            body {
                font-size: 11px;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .header {
                padding: 15px 0 20px 0;
                margin-bottom: 20px;
            }
            
            .header h1 {
                font-size: 18px;
            }
            
            .message {
                margin-bottom: 22px;
            }
            
            .message-content {
                padding: 12px 16px;
                box-shadow: none;
                border-width: 1px;
            }
            
            .message-content pre.code-block {
                padding: 12px;
                margin: 12px 0;
            }
            
            .message-content a {
                color: #1f2937 !important;
                text-decoration: none !important;
            }
            
            .message-content a::after {
                content: " (" attr(href) ")";
                font-size: 9px;
                color: #6b7280;
            }
            
            /* Math notation adjustments for print */
            .fraction {
                font-size: 0.85em;
            }
            
            .math-display {
                background: #f9fafb !important;
                border: 1px solid #d1d5db !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .math-inline {
                color: #000 !important;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
        <div class="header-info">Exported on ${exportDate}</div>
        <div class="header-info">${messageCount} messages</div>
    </div>
    
    <div class="messages">
        ${messagesHTML}
    </div>
</body>
</html>`;
}

/**
 * Exports chat messages as a PDF using browser print functionality
 */
export function exportChatAsPDF(
  messages: Message[],
  sessionTitle?: string
): void {
  const validMessages = messages.filter(
    (msg) => !msg.isLoading && msg.message?.trim()
  );

  if (validMessages.length === 0) {
    alert("No messages to export. Start a conversation first!");
    return;
  }

  try {
    // Create the HTML content
    const htmlContent = createPrintableHTML(validMessages, sessionTitle);

    // Open a new window/tab
    const printWindow = window.open("", "_blank", "width=800,height=600");

    if (!printWindow) {
      alert("Please allow popups to export your chat as PDF");
      return;
    }

    // Write the HTML to the new window
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print
    printWindow.addEventListener("load", () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();

        // Auto-close the window after printing (optional)
        const checkPrintCompleted = () => {
          try {
            if (printWindow.closed) {
              return;
            }
            // Check if print dialog is closed
            setTimeout(() => {
              printWindow.close();
            }, 1000);
          } catch {
            // Ignore errors from trying to access closed window
          }
        };

        // For better UX, let user close the window manually
        printWindow.addEventListener("afterprint", checkPrintCompleted);
        printWindow.addEventListener("beforeunload", checkPrintCompleted);
      }, 500);
    });
  } catch (error) {
    console.error("Error exporting chat as PDF:", error);
    alert("Failed to export chat. Please try again.");
  }
}
