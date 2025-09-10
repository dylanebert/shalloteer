#!/usr/bin/env bun
/**
 * Analyzes the codebase for kebab-case usage patterns
 * Generates a comprehensive report of all occurrences
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

interface KebabCaseOccurrence {
  file: string;
  line: number;
  column: number;
  text: string;
  type: 'component-name' | 'recipe-name' | 'property-name' | 'enum-value' | 'shorthand' | 'other';
  context: string;
}

class KebabCaseAnalyzer {
  private occurrences: KebabCaseOccurrence[] = [];
  private readonly rootDir: string;
  private readonly ignorePatterns = [
    'node_modules',
    'dist',
    '.git',
    'coverage',
    'tools',
  ];

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  async analyze(): Promise<void> {
    console.log('🔍 Analyzing kebab-case usage in:', this.rootDir);
    await this.scanDirectory(this.rootDir);
    this.generateReport();
  }

  private async scanDirectory(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = relative(this.rootDir, fullPath);

      // Skip ignored directories
      if (this.ignorePatterns.some(pattern => relativePath.includes(pattern))) {
        continue;
      }

      if (entry.isDirectory()) {
        await this.scanDirectory(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        await this.analyzeFile(fullPath);
      }
    }
  }

  private async analyzeFile(filePath: string): Promise<void> {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = relative(this.rootDir, filePath);

    lines.forEach((line, lineIndex) => {
      // Component registration patterns: 'component-name': {
      const componentRegex = /['"]([a-z]+-[a-z-]+)['"]\s*:\s*\{/g;
      let match;
      while ((match = componentRegex.exec(line)) !== null) {
        this.occurrences.push({
          file: relativePath,
          line: lineIndex + 1,
          column: match.index + 1,
          text: match[1],
          type: 'component-name',
          context: line.trim(),
        });
      }

      // Recipe name patterns: name: 'recipe-name'
      const recipeNameRegex = /name:\s*['"]([a-z]+-[a-z-]+)['"]/g;
      while ((match = recipeNameRegex.exec(line)) !== null) {
        this.occurrences.push({
          file: relativePath,
          line: lineIndex + 1,
          column: match.index + 1,
          text: match[1],
          type: 'recipe-name',
          context: line.trim(),
        });
      }

      // Property patterns in defaults/overrides: 'property.sub-property'
      const propertyRegex = /['"][\w-]+\.([a-z]+-[a-z-]+)['"]/g;
      while ((match = propertyRegex.exec(line)) !== null) {
        this.occurrences.push({
          file: relativePath,
          line: lineIndex + 1,
          column: match.index + 1,
          text: match[1],
          type: 'property-name',
          context: line.trim(),
        });
      }

      // Enum values: 'kebab-case-value'
      const enumRegex = /['"]([a-z]+-[a-z-]+)['"]\s*[:=]\s*\d+/g;
      while ((match = enumRegex.exec(line)) !== null) {
        this.occurrences.push({
          file: relativePath,
          line: lineIndex + 1,
          column: match.index + 1,
          text: match[1],
          type: 'enum-value',
          context: line.trim(),
        });
      }

      // Shorthand/mapping patterns
      const shorthandRegex = /['"]([a-z]+-[a-z-]+)['"]\s*:\s*['"]?\w+/g;
      while ((match = shorthandRegex.exec(line)) !== null) {
        // Avoid duplicates from other patterns
        if (!this.occurrences.some(o => 
          o.file === relativePath && 
          o.line === lineIndex + 1 && 
          o.text === match[1]
        )) {
          this.occurrences.push({
            file: relativePath,
            line: lineIndex + 1,
            column: match.index + 1,
            text: match[1],
            type: 'shorthand',
            context: line.trim(),
          });
        }
      }

      // XML tag patterns in test files: <kebab-case-tag
      if (filePath.includes('.test.') || filePath.includes('.spec.')) {
        const xmlTagRegex = /<([a-z]+-[a-z-]+)/g;
        while ((match = xmlTagRegex.exec(line)) !== null) {
          this.occurrences.push({
            file: relativePath,
            line: lineIndex + 1,
            column: match.index + 1,
            text: match[1],
            type: 'recipe-name',
            context: line.trim(),
          });
        }
      }
    });
  }

  private generateReport(): void {
    console.log('\n📊 Kebab-Case Usage Report');
    console.log('=' .repeat(80));

    // Group by type
    const byType = this.groupByType();
    
    console.log('\n📈 Summary:');
    console.log(`Total occurrences: ${this.occurrences.length}`);
    console.log(`Files affected: ${new Set(this.occurrences.map(o => o.file)).size}`);
    console.log('\nBreakdown by type:');
    Object.entries(byType).forEach(([type, items]) => {
      console.log(`  ${type}: ${items.length} occurrences`);
    });

    // Detailed breakdown
    console.log('\n📝 Detailed Analysis:');
    
    Object.entries(byType).forEach(([type, items]) => {
      console.log(`\n### ${type.toUpperCase()} (${items.length} occurrences)`);
      console.log('-'.repeat(60));
      
      // Group by unique text
      const byText = this.groupByText(items);
      Object.entries(byText).forEach(([text, occurrences]) => {
        console.log(`\n  "${text}" (${occurrences.length} uses):`);
        occurrences.slice(0, 3).forEach(o => {
          console.log(`    ${o.file}:${o.line}`);
          console.log(`      ${o.context}`);
        });
        if (occurrences.length > 3) {
          console.log(`    ... and ${occurrences.length - 3} more`);
        }
      });
    });

    // Migration complexity assessment
    console.log('\n🎯 Migration Complexity Assessment:');
    console.log('-'.repeat(60));
    this.assessComplexity();

    // Files with highest impact
    console.log('\n📁 Files with Highest Impact:');
    console.log('-'.repeat(60));
    this.listHighImpactFiles();
  }

  private groupByType(): Record<string, KebabCaseOccurrence[]> {
    const groups: Record<string, KebabCaseOccurrence[]> = {};
    this.occurrences.forEach(o => {
      if (!groups[o.type]) groups[o.type] = [];
      groups[o.type].push(o);
    });
    return groups;
  }

  private groupByText(items: KebabCaseOccurrence[]): Record<string, KebabCaseOccurrence[]> {
    const groups: Record<string, KebabCaseOccurrence[]> = {};
    items.forEach(item => {
      if (!groups[item.text]) groups[item.text] = [];
      groups[item.text].push(item);
    });
    return groups;
  }

  private assessComplexity(): void {
    const componentNames = this.occurrences.filter(o => o.type === 'component-name');
    const recipeNames = this.occurrences.filter(o => o.type === 'recipe-name');
    const propertyNames = this.occurrences.filter(o => o.type === 'property-name');

    console.log(`\n  Component names to rename: ${new Set(componentNames.map(o => o.text)).size}`);
    console.log(`  Recipe names to convert: ${new Set(recipeNames.map(o => o.text)).size}`);
    console.log(`  Property names to update: ${new Set(propertyNames.map(o => o.text)).size}`);
    
    const testFiles = this.occurrences.filter(o => o.file.includes('.test.') || o.file.includes('.spec.'));
    console.log(`  Test file occurrences: ${testFiles.length}`);

    const risk = this.occurrences.length > 200 ? 'HIGH' : 
                 this.occurrences.length > 100 ? 'MEDIUM' : 'LOW';
    console.log(`\n  Overall Migration Risk: ${risk}`);
    console.log(`  Estimated effort: ${Math.ceil(this.occurrences.length / 10)} hours`);
  }

  private listHighImpactFiles(): void {
    const fileOccurrences: Record<string, number> = {};
    this.occurrences.forEach(o => {
      fileOccurrences[o.file] = (fileOccurrences[o.file] || 0) + 1;
    });

    const sorted = Object.entries(fileOccurrences)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    sorted.forEach(([file, count]) => {
      console.log(`  ${file}: ${count} occurrences`);
    });
  }
}

// Run the analyzer
const analyzer = new KebabCaseAnalyzer(join(import.meta.dir, '..', 'src'));
analyzer.analyze().catch(console.error);