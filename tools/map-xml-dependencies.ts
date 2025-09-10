#!/usr/bin/env bun
/**
 * Maps XML dependencies throughout the codebase
 * Tracks XML parser usage, recipe definitions, and test dependencies
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

interface XMLDependency {
  file: string;
  type: 'import' | 'recipe-def' | 'xml-string' | 'parser-usage' | 'test-usage';
  line: number;
  code: string;
  details?: string;
}

interface RecipeDefinition {
  name: string;
  file: string;
  components: string[];
  line: number;
}

class XMLDependencyMapper {
  private dependencies: XMLDependency[] = [];
  private recipes: RecipeDefinition[] = [];
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
    console.log('🔍 Mapping XML dependencies in:', this.rootDir);
    await this.scanDirectory(this.rootDir);
    await this.scanTestDirectory(join(this.rootDir, '..', 'tests'));
    this.generateReport();
  }

  private async scanDirectory(dir: string): Promise<void> {
    try {
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
    } catch (error) {
      // Skip if directory doesn't exist
    }
  }

  private async scanTestDirectory(dir: string): Promise<void> {
    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          await this.scanTestDirectory(fullPath);
        } else if (entry.isFile() && (entry.name.includes('.test.') || entry.name.includes('.spec.'))) {
          await this.analyzeTestFile(fullPath);
        }
      }
    } catch (error) {
      // Skip if directory doesn't exist
    }
  }

  private async analyzeFile(filePath: string): Promise<void> {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = relative(this.rootDir, filePath);

    lines.forEach((line, lineIndex) => {
      // XML imports
      if (line.includes('import') && (line.includes('xml') || line.includes('XML'))) {
        this.dependencies.push({
          file: relativePath,
          type: 'import',
          line: lineIndex + 1,
          code: line.trim(),
          details: this.extractImportDetails(line),
        });
      }

      // parseXMLToEntities usage
      if (line.includes('parseXMLToEntities')) {
        this.dependencies.push({
          file: relativePath,
          type: 'parser-usage',
          line: lineIndex + 1,
          code: line.trim(),
          details: 'Direct XML parser usage',
        });
      }

      // XMLParser usage
      if (line.includes('XMLParser') && !line.includes('import')) {
        this.dependencies.push({
          file: relativePath,
          type: 'parser-usage',
          line: lineIndex + 1,
          code: line.trim(),
          details: 'XMLParser usage',
        });
      }

      // Recipe definitions
      const recipeMatch = line.match(/(?:const|export const)\s+(\w+Recipe):\s*Recipe\s*=/);
      if (recipeMatch) {
        // Look for the name in the next few lines
        const nameLineIndex = this.findRecipeName(lines, lineIndex);
        if (nameLineIndex !== -1) {
          const nameLine = lines[nameLineIndex];
          const nameMatch = nameLine.match(/name:\s*['"]([^'"]+)['"]/);
          if (nameMatch) {
            this.recipes.push({
              name: nameMatch[1],
              file: relativePath,
              components: this.extractRecipeComponents(lines, lineIndex),
              line: lineIndex + 1,
            });
          }
        }
      }

      // Inline XML strings (basic detection)
      if ((line.includes('<') && line.includes('>')) && 
          (line.includes('entity') || line.includes('part') || line.includes('light'))) {
        this.dependencies.push({
          file: relativePath,
          type: 'xml-string',
          line: lineIndex + 1,
          code: line.trim().substring(0, 100) + (line.length > 100 ? '...' : ''),
          details: 'Inline XML string',
        });
      }
    });
  }

  private async analyzeTestFile(filePath: string): Promise<void> {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = relative(join(this.rootDir, '..'), filePath);

    let xmlStringCount = 0;
    let xmlParserCount = 0;

    lines.forEach((line, lineIndex) => {
      // XML test strings
      if ((line.includes('<') && line.includes('>')) && 
          (line.includes('static-part') || line.includes('dynamic-part') || 
           line.includes('entity') || line.includes('player') || 
           line.includes('camera') || line.includes('light'))) {
        xmlStringCount++;
        if (xmlStringCount === 1) {
          this.dependencies.push({
            file: relativePath,
            type: 'test-usage',
            line: lineIndex + 1,
            code: line.trim().substring(0, 80) + '...',
            details: `Test file with XML strings`,
          });
        }
      }

      // XML parser usage in tests
      if (line.includes('XMLParser') || line.includes('parseXMLToEntities')) {
        xmlParserCount++;
      }
    });

    if (xmlStringCount > 0 || xmlParserCount > 0) {
      // Update the details with counts
      const dep = this.dependencies.find(d => d.file === relativePath && d.type === 'test-usage');
      if (dep) {
        dep.details = `${xmlStringCount} XML strings, ${xmlParserCount} parser calls`;
      }
    }
  }

  private extractImportDetails(line: string): string {
    const match = line.match(/from\s+['"]([^'"]+)['"]/);
    return match ? match[1] : 'unknown';
  }

  private findRecipeName(lines: string[], startIndex: number): number {
    for (let i = startIndex; i < Math.min(startIndex + 10, lines.length); i++) {
      if (lines[i].includes('name:')) {
        return i;
      }
    }
    return -1;
  }

  private extractRecipeComponents(lines: string[], startIndex: number): string[] {
    const components: string[] = [];
    for (let i = startIndex; i < Math.min(startIndex + 20, lines.length); i++) {
      const line = lines[i];
      if (line.includes('components:')) {
        const match = line.match(/components:\s*\[([^\]]+)\]/);
        if (match) {
          const componentStr = match[1];
          const componentMatches = componentStr.match(/['"]([^'"]+)['"]/g);
          if (componentMatches) {
            componentMatches.forEach(m => {
              components.push(m.replace(/['"]/g, ''));
            });
          }
        }
        break;
      }
    }
    return components;
  }

  private generateReport(): void {
    console.log('\n📊 XML Dependency Report');
    console.log('=' .repeat(80));

    // Summary
    console.log('\n📈 Summary:');
    const byType = this.groupByType();
    console.log(`Total dependencies: ${this.dependencies.length}`);
    console.log(`Files with XML dependencies: ${new Set(this.dependencies.map(d => d.file)).size}`);
    console.log(`Recipe definitions found: ${this.recipes.length}`);
    
    console.log('\nDependency breakdown:');
    Object.entries(byType).forEach(([type, deps]) => {
      console.log(`  ${type}: ${deps.length}`);
    });

    // XML Module Imports
    console.log('\n🔗 XML Module Imports:');
    console.log('-'.repeat(60));
    const imports = this.dependencies.filter(d => d.type === 'import');
    this.printDependencies(imports);

    // Recipe Definitions
    console.log('\n📦 Recipe Definitions:');
    console.log('-'.repeat(60));
    this.recipes.forEach(recipe => {
      console.log(`\n  ${recipe.name}`);
      console.log(`    File: ${recipe.file}:${recipe.line}`);
      console.log(`    Components: ${recipe.components.join(', ') || 'none'}`);
    });

    // Parser Usage
    console.log('\n🔧 Parser Usage:');
    console.log('-'.repeat(60));
    const parserUsage = this.dependencies.filter(d => d.type === 'parser-usage');
    this.printDependencies(parserUsage);

    // Test Files
    console.log('\n🧪 Test Files with XML:');
    console.log('-'.repeat(60));
    const testUsage = this.dependencies.filter(d => d.type === 'test-usage');
    testUsage.forEach(dep => {
      console.log(`  ${dep.file}`);
      console.log(`    ${dep.details}`);
    });

    // XML Strings in Code
    console.log('\n📝 Inline XML Strings:');
    console.log('-'.repeat(60));
    const xmlStrings = this.dependencies.filter(d => d.type === 'xml-string');
    console.log(`  Found ${xmlStrings.length} files with inline XML strings`);
    if (xmlStrings.length > 0) {
      const uniqueFiles = new Set(xmlStrings.map(d => d.file));
      uniqueFiles.forEach(file => {
        const count = xmlStrings.filter(d => d.file === file).length;
        console.log(`    ${file}: ${count} occurrences`);
      });
    }

    // Migration Impact Assessment
    console.log('\n⚠️  Migration Impact:');
    console.log('-'.repeat(60));
    this.assessImpact();
  }

  private groupByType(): Record<string, XMLDependency[]> {
    const groups: Record<string, XMLDependency[]> = {};
    this.dependencies.forEach(d => {
      if (!groups[d.type]) groups[d.type] = [];
      groups[d.type].push(d);
    });
    return groups;
  }

  private printDependencies(deps: XMLDependency[]): void {
    const uniqueFiles = new Set(deps.map(d => d.file));
    uniqueFiles.forEach(file => {
      const fileDeps = deps.filter(d => d.file === file);
      console.log(`\n  ${file}:`);
      fileDeps.slice(0, 3).forEach(dep => {
        console.log(`    Line ${dep.line}: ${dep.code.substring(0, 60)}...`);
        if (dep.details) {
          console.log(`      → ${dep.details}`);
        }
      });
      if (fileDeps.length > 3) {
        console.log(`    ... and ${fileDeps.length - 3} more`);
      }
    });
  }

  private assessImpact(): void {
    const coreFiles = this.dependencies.filter(d => 
      d.file.includes('core/xml') || 
      d.file.includes('recipes/parser') ||
      d.file.includes('runtime.ts')
    );
    
    const testFiles = this.dependencies.filter(d => d.type === 'test-usage');
    
    console.log(`\n  Core XML infrastructure files: ${new Set(coreFiles.map(d => d.file)).size}`);
    console.log(`  Recipe definitions to migrate: ${this.recipes.length}`);
    console.log(`  Test files using XML: ${testFiles.length}`);
    console.log(`  Total files to modify: ${new Set(this.dependencies.map(d => d.file)).size}`);
    
    const criticalFiles = [
      'runtime.ts',
      'plugins/recipes/parser.ts',
      'core/xml/parser.ts',
      'core/xml/values.ts',
    ];
    
    console.log('\n  Critical files for migration:');
    criticalFiles.forEach(file => {
      const hasDep = this.dependencies.some(d => d.file.includes(file));
      console.log(`    ${file}: ${hasDep ? '✓ Found' : '✗ Not found'}`);
    });

    // Recipe migration priority
    console.log('\n  Recipe Migration Priority:');
    const recipesByUsage = this.recipes.sort((a, b) => {
      const aUsage = this.dependencies.filter(d => d.code.includes(a.name)).length;
      const bUsage = this.dependencies.filter(d => d.code.includes(b.name)).length;
      return bUsage - aUsage;
    });
    
    recipesByUsage.slice(0, 5).forEach(recipe => {
      console.log(`    ${recipe.name} (${recipe.file})`);
    });
  }
}

// Run the mapper
const mapper = new XMLDependencyMapper(join(import.meta.dir, '..', 'src'));
mapper.analyze().catch(console.error);