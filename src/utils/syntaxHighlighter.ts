import { SupportedLanguage } from '../types/editor';

/**
 * Fast, lightweight syntax highlighter that transforms raw code into HTML with syntax tokens.
 */
export function highlightCode(code: string, language: SupportedLanguage): string {
  if (!code) return '';

  switch (language) {
    case 'html':
      return highlightHtml(code);
    case 'css':
      return highlightCss(code);
    case 'javascript':
    case 'typescript':
      return highlightJavaScript(code);
    case 'json':
      return highlightJson(code);
    case 'python':
      return highlightPython(code);
    default:
      return escapeHtml(code);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function highlightHtml(code: string): string {
  // Regex to match HTML comments, doctype, tags, attributes, strings
  return escapeHtml(code)
    // HTML Comments: &lt;!-- ... --&gt;
    .replace(
      /(&lt;!--[\s\S]*?--&gt;)/g,
      '<span class="text-slate-500 italic">$1</span>'
    )
    // Tag open/close &lt;tag or &lt;/tag&gt;
    .replace(
      /(&lt;\/?)([a-zA-Z0-9\-]+)/g,
      '$1<span class="text-rose-400 font-semibold">$2</span>'
    )
    // Closing brackets &gt;
    .replace(/(&gt;)/g, '<span class="text-slate-400">$1</span>')
    // Attributes inside tags: class=, id=, src=, href=
    .replace(
      /\s+([a-zA-Z0-9\-_]+)(=)(&quot;.*?&quot;|&#39;.*?&#39;)/g,
      ' <span class="text-amber-300">$1</span><span class="text-slate-400">$2</span><span class="text-emerald-300">$3</span>'
    )
    // Doctype
    .replace(
      /(&lt;!DOCTYPE html&gt;)/gi,
      '<span class="text-purple-400 font-bold">$1</span>'
    );
}

function highlightCss(code: string): string {
  return escapeHtml(code)
    // CSS Comments
    .replace(
      /(\/\*[\s\S]*?\*\/)/g,
      '<span class="text-slate-500 italic">$1</span>'
    )
    // Properties: e.g. color:, margin:, padding:
    .replace(
      /([a-zA-Z\-]+)(:)/g,
      '<span class="text-cyan-300">$1</span><span class="text-slate-400">$2</span>'
    )
    // Units and values
    .replace(
      /(\b\d+(\.\d+)?(px|rem|em|%|vh|vw|s|ms)\b)/g,
      '<span class="text-amber-400">$1</span>'
    )
    // Hex colors
    .replace(/(#[0-9a-fA-F]{3,8})/g, '<span class="text-rose-300">$1</span>')
    // Selectors
    .replace(
      /([.#][a-zA-Z0-9\-_]+)/g,
      '<span class="text-yellow-300 font-medium">$1</span>'
    );
}

function highlightJavaScript(code: string): string {
  const keywords = new Set([
    'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
    'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function',
    'if', 'import', 'in', 'instanceof', 'new', 'return', 'super', 'switch',
    'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield',
    'let', 'static', 'enum', 'await', 'async', 'interface', 'type', 'from',
  ]);

  const builtins = new Set([
    'console', 'window', 'document', 'Math', 'JSON', 'Array', 'Object',
    'String', 'Number', 'Boolean', 'Promise', 'Date', 'RegExp', 'Map', 'Set',
    'setTimeout', 'setInterval', 'clearTimeout', 'addEventListener', 'querySelector',
    'getElementById', 'querySelectorAll',
  ]);

  // Tokenize preserving whitespace and strings
  const tokenRegex = /(\/\/.*$|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b[a-zA-Z_$][a-zA-Z0-9_$]*\b|\b\d+(?:\.\d+)?\b|[{}()\[\].,;+\-*\/%=<>!&|^?:~])/gm;

  return code.replace(tokenRegex, (token) => {
    // Single line or multi-line comment
    if (token.startsWith('//') || token.startsWith('/*')) {
      return `<span class="text-slate-500 italic">${escapeHtml(token)}</span>`;
    }
    // String literal
    if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'")) ||
      (token.startsWith('`') && token.endsWith('`'))
    ) {
      return `<span class="text-emerald-300">${escapeHtml(token)}</span>`;
    }
    // Numbers
    if (/^\d+(\.\d+)?$/.test(token)) {
      return `<span class="text-amber-400 font-mono">${escapeHtml(token)}</span>`;
    }
    // Booleans and null
    if (token === 'true' || token === 'false' || token === 'null' || token === 'undefined') {
      return `<span class="text-orange-400 font-semibold">${escapeHtml(token)}</span>`;
    }
    // Keywords & conditionals
    if (keywords.has(token)) {
      return `<span class="text-purple-400 font-semibold">${escapeHtml(token)}</span>`;
    }
    // Builtin objects & methods
    if (builtins.has(token)) {
      return `<span class="text-cyan-300 font-medium">${escapeHtml(token)}</span>`;
    }
    // Punctuation & operators
    if (/^[{}()\[\].,;+\-*\/%=<>!&|^?:~]$/.test(token)) {
      return `<span class="text-slate-400">${escapeHtml(token)}</span>`;
    }

    return escapeHtml(token);
  });
}

function highlightJson(code: string): string {
  return escapeHtml(code)
    // JSON keys: "key":
    .replace(
      /(&quot;[a-zA-Z0-9_\-]+&quot;)(\s*:)/g,
      '<span class="text-cyan-300 font-semibold">$1</span><span class="text-slate-400">$2</span>'
    )
    // JSON string values: : "value"
    .replace(
      /(:\s*)(&quot;.*?&quot;)/g,
      '$1<span class="text-emerald-300">$2</span>'
    )
    // Numbers
    .replace(/(\b\d+(\.\d+)?\b)/g, '<span class="text-amber-400 font-mono">$1</span>')
    // Booleans / null
    .replace(
      /\b(true|false|null)\b/g,
      '<span class="text-orange-400 font-semibold">$1</span>'
    );
}

function highlightPython(code: string): string {
  const pyKeywords = new Set([
    'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue',
    'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from',
    'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not',
    'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
  ]);

  const tokenRegex = /(#.*$|"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b[a-zA-Z_][a-zA-Z0-9_]*\b|\b\d+(?:\.\d+)?\b|[{}()\[\].,;+\-*\/%=<>!&|^?:~])/gm;

  return code.replace(tokenRegex, (token) => {
    if (token.startsWith('#')) {
      return `<span class="text-slate-500 italic">${escapeHtml(token)}</span>`;
    }
    if (token.startsWith('"') || token.startsWith("'")) {
      return `<span class="text-emerald-300">${escapeHtml(token)}</span>`;
    }
    if (/^\d+(\.\d+)?$/.test(token)) {
      return `<span class="text-amber-400 font-mono">${escapeHtml(token)}</span>`;
    }
    if (token === 'True' || token === 'False' || token === 'None') {
      return `<span class="text-orange-400 font-semibold">${escapeHtml(token)}</span>`;
    }
    if (pyKeywords.has(token)) {
      return `<span class="text-purple-400 font-semibold">${escapeHtml(token)}</span>`;
    }
    if (token === 'print' || token === 'len' || token === 'range' || token === 'open') {
      return `<span class="text-cyan-300 font-medium">${escapeHtml(token)}</span>`;
    }
    return escapeHtml(token);
  });
}
