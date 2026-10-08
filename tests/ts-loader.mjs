/**
 * Minimal ESM loader so `node --test` can import the app's TypeScript sources
 * and the "@/..." path alias. Uses the repo's own typescript dependency.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import ts from 'typescript';

const SRC = pathToFileURL(path.join(process.cwd(), 'src') + path.sep).href;

export async function resolve(specifier, context, next) {
  if (specifier.startsWith('@/')) {
    const target = new URL(specifier.slice(2), SRC).href;
    for (const candidate of [`${target}.ts`, `${target}.tsx`, `${target}/index.ts`]) {
      try {
        return await next(candidate, context);
      } catch {
        /* try next extension */
      }
    }
  }

  if (
    (specifier.startsWith('./') || specifier.startsWith('../')) &&
    !path.extname(specifier)
  ) {
    for (const ext of ['.ts', '.tsx']) {
      try {
        return await next(specifier + ext, context);
      } catch {
        /* try next extension */
      }
    }
  }

  return next(specifier, context);
}

export async function load(url, context, next) {
  if (url.endsWith('.ts') || url.endsWith('.tsx')) {
    const source = await readFile(fileURLToPath(url), 'utf8');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
      fileName: fileURLToPath(url),
    });
    return { format: 'module', shortCircuit: true, source: outputText };
  }
  return next(url, context);
}
