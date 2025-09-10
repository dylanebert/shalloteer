#!/usr/bin/env bun

import { glob } from 'glob';
import { readFile } from 'fs/promises';
import { join, relative } from 'path';
import {
  formatBuildValidationSummary,
  formatZodError,
} from './error-formatter';
import { recipeSchemas } from './schemas';
import type { BuildValidationResult } from './types';

const IGNORE_PATTERNS = [
  'node_modules/**',
  'dist/**',
  '.git/**',
  'coverage/**',
  '*.min.js',
  '*.min.html',
];

function parseAttributes(attrString: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRegex = /(\w[\w-]*)\s*=\s*"([^"]*)"/g;
  let match;

  while ((match = attrRegex.exec(attrString)) !== null) {
    attrs[match[1]] = match[2];
  }

  return attrs;
}

async function validateFile(filepath: string): Promise<BuildValidationResult> {
  const content = await readFile(filepath, 'utf-8');
  const errors: string[] = [];
  const warnings: string[] = [];
  let elementCount = 0;

  const recipeNames = Object.keys(recipeSchemas).join('|');
  const elementRegex = new RegExp(
    `<(${recipeNames})([^>]*)(?:/>|>.*?</\\1>)`,
    'gis'
  );

  let match;
  while ((match = elementRegex.exec(content)) !== null) {
    const tagName = match[1];
    const attrString = match[2];
    const lineNumber = content.substring(0, match.index).split('\n').length;

    elementCount++;

    try {
      const attributes = parseAttributes(attrString);

      const schema = recipeSchemas[tagName as keyof typeof recipeSchemas];
      if (!schema) {
        errors.push(`Line ${lineNumber}: Unknown recipe "${tagName}"`);
        continue;
      }

      const result = schema.safeParse(attributes);
      if (!result.success && result.error) {
        const errorMessage = formatZodError(result.error, {
          recipeName: tagName,
          lineNumber,
        });
        errors.push(errorMessage);
      }
    } catch (error) {
      errors.push(
        `Line ${lineNumber}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return {
    file: filepath,
    errors,
    warnings,
    elementCount,
  };
}

async function validateProject(rootDir = process.cwd()): Promise<void> {
  console.log('🔍 Validating XML recipes in project...\n');

  const xmlFiles = await glob('**/*.xml', {
    cwd: rootDir,
    ignore: IGNORE_PATTERNS,
  });

  const htmlFiles = await glob('**/*.{html,htm}', {
    cwd: rootDir,
    ignore: IGNORE_PATTERNS,
  });

  const allFiles = [...xmlFiles, ...htmlFiles].map((f) => join(rootDir, f));

  if (allFiles.length === 0) {
    console.log('No XML or HTML files found to validate.');
    return;
  }

  const results: BuildValidationResult[] = [];
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalElements = 0;

  for (const filepath of allFiles) {
    const relativePath = relative(rootDir, filepath);
    process.stdout.write(`Validating ${relativePath}...`);

    try {
      const result = await validateFile(filepath);
      results.push(result);

      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;
      totalElements += result.elementCount;

      if (result.errors.length > 0) {
        process.stdout.write(' ❌\n');
        for (const error of result.errors) {
          console.error(`  ${error}`);
        }
      } else if (result.elementCount > 0) {
        process.stdout.write(` ✓ (${result.elementCount} elements)\n`);
      } else {
        process.stdout.write(' (no XML elements)\n');
      }

      if (result.warnings.length > 0) {
        for (const warning of result.warnings) {
          console.warn(`  ⚠️  ${warning}`);
        }
      }
    } catch (error) {
      process.stdout.write(' ❌\n');
      console.error(`  Error reading file: ${error}`);
      totalErrors++;
    }
  }

  console.log('\n' + '─'.repeat(60));

  const allErrors = results.flatMap((r) =>
    r.errors.map((e) => `${relative(rootDir, r.file)}: ${e}`)
  );

  const summary = formatBuildValidationSummary(
    allFiles.length,
    totalElements,
    allErrors
  );

  console.log(summary);

  if (totalWarnings > 0) {
    console.log(
      `\n⚠️  ${totalWarnings} warning${totalWarnings === 1 ? '' : 's'} found`
    );
  }

  if (totalErrors > 0) {
    process.exit(1);
  }
}

if (import.meta.main) {
  validateProject().catch((error) => {
    console.error('Fatal error during validation:', error);
    process.exit(1);
  });
}

export { validateProject, validateFile };
