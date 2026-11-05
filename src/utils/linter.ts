import { CodeFile, LintError } from '../types/editor';

/**
 * Smart Offline Code Scanner & Error Finder
 * Analyzes HTML, CSS, JavaScript, TypeScript, and JSON files without needing external network calls.
 */
export function scanCodeForErrors(files: CodeFile[]): LintError[] {
  const errors: LintError[] = [];

  for (const file of files) {
    const lines = file.content.split('\n');

    switch (file.language) {
      case 'html':
        scanHtml(file, lines, errors);
        break;
      case 'css':
        scanCss(file, lines, errors);
        break;
      case 'javascript':
      case 'typescript':
        scanJavaScript(file, lines, errors);
        break;
      case 'json':
        scanJson(file, lines, errors);
        break;
      default:
        break;
    }
  }

  return errors;
}

function scanHtml(file: CodeFile, lines: string[], errors: LintError[]) {
  const voidTags = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr', '!doctype',
  ]);

  const tagStack: { tag: string; line: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];

    // Check for unclosed quotation in tags
    const quoteMatches = line.match(/(<[^>]*)$/);
    if (quoteMatches && !line.includes('>')) {
      // Might be multiline tag, check if next lines close it
      let closed = false;
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        if (lines[j].includes('>')) {
          closed = true;
          break;
        }
      }
      if (!closed) {
        errors.push({
          id: `${file.id}-tag-unclosed-${lineNum}`,
          fileId: file.id,
          fileName: file.name,
          line: lineNum,
          message: `Unclosed HTML tag on line ${lineNum}`,
          severity: 'error',
          codeSnippet: line.trim(),
        });
      }
    }

    // Match tags in line
    const tagRegex = /<\/?([a-zA-Z0-9\-]+)(?:\s+[^>]*)?\/?>/g;
    let match;
    while ((match = tagRegex.exec(line)) !== null) {
      const fullTag = match[0];
      const tagName = match[1].toLowerCase();

      if (voidTags.has(tagName) || fullTag.endsWith('/>')) {
        continue;
      }

      if (fullTag.startsWith('</')) {
        // Closing tag
        if (tagStack.length === 0) {
          errors.push({
            id: `${file.id}-extra-closing-${lineNum}-${match.index}`,
            fileId: file.id,
            fileName: file.name,
            line: lineNum,
            message: `Unexpected closing tag </${tagName}> without matching opening tag`,
            severity: 'error',
            codeSnippet: line.trim(),
          });
        } else {
          const last = tagStack.pop();
          if (last && last.tag !== tagName) {
            errors.push({
              id: `${file.id}-mismatched-tag-${lineNum}`,
              fileId: file.id,
              fileName: file.name,
              line: lineNum,
              message: `Mismatched closing tag </${tagName}>; expected </${last.tag}> (opened on line ${last.line})`,
              severity: 'error',
              codeSnippet: line.trim(),
            });
          }
        }
      } else {
        // Opening tag
        tagStack.push({ tag: tagName, line: lineNum });
      }
    }

    // Check broken script tags
    if (line.includes('<script') && line.includes('src=') && !line.includes('src="') && !line.includes("src='")) {
      errors.push({
        id: `${file.id}-script-attr-${lineNum}`,
        fileId: file.id,
        fileName: file.name,
        line: lineNum,
        message: `Missing quotation marks around script src attribute`,
        severity: 'warning',
        codeSnippet: line.trim(),
      });
    }
  }

  // Any remaining unclosed tags
  for (const unclosed of tagStack) {
    errors.push({
      id: `${file.id}-unclosed-${unclosed.line}`,
      fileId: file.id,
      fileName: file.name,
      line: unclosed.line,
      message: `Unclosed tag <${unclosed.tag}> opened on line ${unclosed.line}`,
      severity: 'error',
      codeSnippet: lines[unclosed.line - 1]?.trim(),
    });
  }
}

function scanCss(file: CodeFile, lines: string[], errors: LintError[]) {
  let braceCount = 0;
  const braceStack: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];
    const trimmed = line.trim();

    // Ignore comments
    if (trimmed.startsWith('/*') && trimmed.endsWith('*/')) continue;

    for (let c = 0; c < line.length; c++) {
      if (line[c] === '{') {
        braceCount++;
        braceStack.push(lineNum);
      } else if (line[c] === '}') {
        braceCount--;
        if (braceCount < 0) {
          errors.push({
            id: `${file.id}-css-extra-brace-${lineNum}`,
            fileId: file.id,
            fileName: file.name,
            line: lineNum,
            message: `Unexpected closing brace '}' without opening selector`,
            severity: 'error',
            codeSnippet: trimmed,
          });
          braceCount = 0;
        } else {
          braceStack.pop();
        }
      }
    }

    // Check missing semicolon inside a property rule (simple heuristic)
    if (
      braceCount > 0 &&
      trimmed.includes(':') &&
      !trimmed.endsWith(';') &&
      !trimmed.endsWith('{') &&
      !trimmed.endsWith('}') &&
      !trimmed.startsWith('@') &&
      !trimmed.startsWith('/*')
    ) {
      // Next line check
      const nextLine = lines[i + 1]?.trim();
      if (nextLine && !nextLine.startsWith(';') && !nextLine.startsWith('}') && nextLine.includes(':')) {
        errors.push({
          id: `${file.id}-css-missing-semi-${lineNum}`,
          fileId: file.id,
          fileName: file.name,
          line: lineNum,
          message: `Missing semicolon ';' at the end of CSS declaration`,
          severity: 'warning',
          codeSnippet: trimmed,
        });
      }
    }
  }

  if (braceCount > 0) {
    const lastOpenLine = braceStack.pop() || 1;
    errors.push({
      id: `${file.id}-css-unclosed-brace-${lastOpenLine}`,
      fileId: file.id,
      fileName: file.name,
      line: lastOpenLine,
      message: `Unclosed CSS block; missing '}' for declaration started on line ${lastOpenLine}`,
      severity: 'error',
    });
  }
}

function scanJavaScript(file: CodeFile, lines: string[], errors: LintError[]) {
  // Try native evaluation check via Function constructor or syntax check
  try {
    // Strip import / export statements temporarily for basic syntax parsing
    const normalizedCode = file.content
      .replace(/import\s+[^;]+;?/g, '// import')
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s+/g, '');

    new Function(normalizedCode);
  } catch (err: any) {
    const msg = err.message || 'JavaScript syntax error';
    // Try to extract line number from message if available
    let detectedLine = 1;
    const match = msg.match(/line\s+(\d+)/i) || msg.match(/:(\d+):/);
    if (match && match[1]) {
      detectedLine = parseInt(match[1], 10);
    } else {
      // Find unbalanced characters to give an accurate line
      let paren = 0;
      let curly = 0;
      let bracket = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const ch of line) {
          if (ch === '(') paren++;
          else if (ch === ')') paren--;
          else if (ch === '{') curly++;
          else if (ch === '}') curly--;
          else if (ch === '[') bracket++;
          else if (ch === ']') bracket--;
        }
        if (paren < 0 || curly < 0 || bracket < 0) {
          detectedLine = i + 1;
          break;
        }
      }
      if (detectedLine === 1 && (paren !== 0 || curly !== 0 || bracket !== 0)) {
        detectedLine = lines.length;
      }
    }

    errors.push({
      id: `${file.id}-js-syntax-${detectedLine}`,
      fileId: file.id,
      fileName: file.name,
      line: Math.min(detectedLine, lines.length || 1),
      message: msg,
      severity: 'error',
      codeSnippet: lines[Math.min(detectedLine - 1, lines.length - 1)]?.trim(),
    });
  }

  // Additional static checks: console.error or missing let/const/var keyword usage
  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i].trim();

    if (line.includes('debugger;')) {
      errors.push({
        id: `${file.id}-debugger-${lineNum}`,
        fileId: file.id,
        fileName: file.name,
        line: lineNum,
        message: `Found 'debugger' statement in code. Remember to remove before building.`,
        severity: 'info',
        codeSnippet: line,
      });
    }

    // Detect alert() calls
    if (line.includes('alert(') && !line.startsWith('//')) {
      errors.push({
        id: `${file.id}-alert-${lineNum}`,
        fileId: file.id,
        fileName: file.name,
        line: lineNum,
        message: `'window.alert' is blocked inside sandboxed preview iframes. Use a custom modal or console.log.`,
        severity: 'warning',
        codeSnippet: line,
      });
    }
  }
}

function scanJson(file: CodeFile, lines: string[], errors: LintError[]) {
  try {
    JSON.parse(file.content);
  } catch (err: any) {
    const msg = err.message || 'Invalid JSON syntax';
    let lineNum = 1;
    const match = msg.match(/position\s+(\d+)/i) || msg.match(/line\s+(\d+)/i);
    if (match && match[1]) {
      const pos = parseInt(match[1], 10);
      let charCount = 0;
      for (let i = 0; i < lines.length; i++) {
        charCount += lines[i].length + 1;
        if (charCount >= pos) {
          lineNum = i + 1;
          break;
        }
      }
    }
    errors.push({
      id: `${file.id}-json-err-${lineNum}`,
      fileId: file.id,
      fileName: file.name,
      line: lineNum,
      message: msg,
      severity: 'error',
      codeSnippet: lines[lineNum - 1]?.trim(),
    });
  }
}
