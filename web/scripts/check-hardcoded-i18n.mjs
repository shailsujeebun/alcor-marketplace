import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const TARGET_DIRS = ['src/components/auth'];
const ALLOWED_EXTENSIONS = new Set(['.ts', '.tsx']);
const CYRILLIC_REGEX = /[\u0400-\u04FF]/;
const STRING_WITH_CYRILLIC_REGEX = /(["'`])(?:\\.|(?!\1)[^\\])*\p{Script=Cyrillic}(?:\\.|(?!\1)[^\\])*\1/gu;
const JSX_TEXT_WITH_CYRILLIC_REGEX = />([^<]*\p{Script=Cyrillic}[^<]*)</gu;

function walk(dir, bucket) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, bucket);
      continue;
    }

    const ext = path.extname(entry.name);
    if (!ALLOWED_EXTENSIONS.has(ext)) continue;
    bucket.push(fullPath);
  }
}

function lineNumberAt(source, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (source.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

function relative(filePath) {
  return path.relative(projectRoot, filePath).replace(/\\/g, '/');
}

function analyzeFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const findings = [];

  for (const match of content.matchAll(STRING_WITH_CYRILLIC_REGEX)) {
    const matchedText = match[0] ?? '';
    if (!CYRILLIC_REGEX.test(matchedText)) continue;
    const line = lineNumberAt(content, match.index ?? 0);
    findings.push({
      line,
      snippet: matchedText.length > 90 ? `${matchedText.slice(0, 87)}...` : matchedText,
      type: 'string',
    });
  }

  for (const match of content.matchAll(JSX_TEXT_WITH_CYRILLIC_REGEX)) {
    const matchedText = match[1] ?? '';
    if (!CYRILLIC_REGEX.test(matchedText)) continue;
    const index = (match.index ?? 0) + 1;
    const line = lineNumberAt(content, index);
    findings.push({
      line,
      snippet: matchedText.trim().slice(0, 90),
      type: 'jsx',
    });
  }

  return findings;
}

function main() {
  const files = [];
  for (const dir of TARGET_DIRS) {
    const absoluteDir = path.join(projectRoot, dir);
    if (!statSync(absoluteDir, { throwIfNoEntry: false })) continue;
    walk(absoluteDir, files);
  }

  const violations = [];
  for (const file of files) {
    const findings = analyzeFile(file);
    for (const finding of findings) {
      violations.push({ file: relative(file), ...finding });
    }
  }

  if (!violations.length) {
    console.log('i18n guard passed.');
    return;
  }

  console.error('Found hardcoded Cyrillic text in i18n-guarded files:');
  for (const violation of violations) {
    console.error(
      `- ${violation.file}:${violation.line} [${violation.type}] ${violation.snippet}`,
    );
  }
  process.exit(1);
}

main();
