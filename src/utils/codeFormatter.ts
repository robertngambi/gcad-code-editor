import { SupportedLanguage } from '../types/editor';

/**
 * Clean, robust offline code formatter for HTML, CSS, JavaScript, TypeScript, and JSON.
 * Formats code in order with 2-space indentation.
 */
export function formatCode(code: string, language: SupportedLanguage): string {
  if (!code || !code.trim()) return code;

  switch (language) {
    case 'json':
      return formatJson(code);
    case 'html':
      return formatHtml(code);
    case 'css':
      return formatCss(code);
    case 'javascript':
    case 'typescript':
      return formatJavaScript(code);
    default:
      return code.trim();
  }
}

function formatJson(code: string): string {
  try {
    const parsed = JSON.parse(code);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    // If invalid JSON, clean up basic indentation
    return basicIndentFormat(code);
  }
}

function formatHtml(code: string): string {
  const voidTags = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr', '!doctype',
  ]);

  // Split tokens by tag boundaries
  const tokens = code
    .replace(/>\s*</g, '>\n<')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  let indentLevel = 0;
  const formattedLines: string[] = [];

  for (const line of tokens) {
    // Check if line is closing tag
    const isClosing = /^<\/[a-zA-Z0-9\-]+>/.test(line);
    // Check if line is opening tag
    const openMatch = line.match(/^<([a-zA-Z0-9\-!]+)/);
    const tagName = openMatch ? openMatch[1].toLowerCase() : '';
    const isVoid = voidTags.has(tagName) || line.endsWith('/>');
    const isSingleLineOpenClose = /<([a-zA-Z0-9\-]+)[^>]*>.*<\/\1>/.test(line);

    if (isClosing) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    formattedLines.push('  '.repeat(indentLevel) + line);

    if (!isClosing && !isVoid && !isSingleLineOpenClose && openMatch && !tagName.startsWith('!')) {
      indentLevel++;
    }
  }

  return formattedLines.join('\n');
}

function formatCss(code: string): string {
  // Normalize braces and semicolons
  let cleaned = code
    .replace(/\s*\{\s*/g, ' {\n')
    .replace(/\s*;\s*/g, ';\n')
    .replace(/\s*\}\s*/g, '\n}\n');

  const lines = cleaned
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  let indentLevel = 0;
  const formatted: string[] = [];

  for (const line of lines) {
    if (line === '}') {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    formatted.push('  '.repeat(indentLevel) + line);

    if (line.endsWith('{')) {
      indentLevel++;
    }
  }

  return formatted.join('\n');
}

function formatJavaScript(code: string): string {
  // Split on newlines, clean up basic block indentation on { and }
  const lines = code.split('\n').map((l) => l.trim());
  let indentLevel = 0;
  const formatted: string[] = [];

  for (const line of lines) {
    if (!line) {
      formatted.push('');
      continue;
    }

    // Decrement indent for closing brackets at start of line
    if (/^[}\])]/.test(line)) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    formatted.push('  '.repeat(indentLevel) + line);

    // Count difference between opening and closing braces in line
    let openBraces = 0;
    for (const char of line) {
      if (char === '{' || char === '[') openBraces++;
      if (char === '}' || char === ']') openBraces--;
    }

    if (openBraces > 0) {
      indentLevel += openBraces;
    }
  }

  return formatted.join('\n');
}

function basicIndentFormat(code: string): string {
  return code
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n');
}
