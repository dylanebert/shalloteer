#!/usr/bin/env bun
/**
 * Validates migration readiness and checks for potential issues
 * Ensures backwards compatibility and identifies conflicts
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { execSync } from 'node:child_process';

interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  category: string;
  file?: string;
  message: string;
  suggestion?: string;
}

interface ConversionCandidate {
  from: string;
  to: string;
  usage: number;
  conflicts: string[];
}

class MigrationValidator {
  private issues: ValidationIssue[] = [];
  private conversions: ConversionCandidate[] = [];
  private readonly rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  async validate(): Promise<void> {
    console.log('🔍 Validating migration readiness...\n');
    
    // Run validation checks
    await this.checkTestCoverage();
    await this.checkNamingConflicts();
    await this.validateConversions();
    await this.checkBackwardsCompatibility();
    await this.checkDependencies();
    
    // Generate report
    this.generateReport();
  }

  private async checkTestCoverage(): Promise<void> {
    console.log('📊 Checking test coverage...');
    
    try {
      // Check if tests pass
      const testResult = execSync('bun test --bail', { 
        cwd: this.rootDir,
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      const lines = testResult.split('\n');
      const passLine = lines.find(l => l.includes('pass'));
      
      if (passLine) {
        this.issues.push({
          severity: 'info',
          category: 'Testing',
          message: `All tests passing: ${passLine.trim()}`,
        });
      }
    } catch (error: any) {
      this.issues.push({
        severity: 'error',
        category: 'Testing',
        message: 'Tests are failing - fix before migration',
        suggestion: 'Run "bun test" to see failures',
      });
    }
  }

  private async checkNamingConflicts(): Promise<void> {
    console.log('🔍 Checking for naming conflicts...');
    
    // Define conversion mappings
    const kebabToCamel: Record<string, string> = {
      'orbit-camera': 'orbitCamera',
      'animated-character': 'animatedCharacter',
      'character-controller': 'characterController',
      'world-transform': 'worldTransform',
      'static-part': 'staticPart',
      'dynamic-part': 'dynamicPart',
      'kinematic-part': 'kinematicPart',
      'physics-part': 'physicsPart',
      'ambient-light': 'ambientLight',
      'directional-light': 'directionalLight',
      'max-distance': 'maxDistance',
      'min-distance': 'minDistance',
      'target-pitch': 'targetPitch',
      'target-yaw': 'targetYaw',
      'jump-height': 'jumpHeight',
      'cast-shadow': 'castShadow',
      'gravity-scale': 'gravityScale',
    };

    // Check for existing camelCase usage that might conflict
    for (const [kebab, camel] of Object.entries(kebabToCamel)) {
      const conflicts = await this.findConflicts(camel);
      
      this.conversions.push({
        from: kebab,
        to: camel,
        usage: await this.countUsage(kebab),
        conflicts: conflicts,
      });

      if (conflicts.length > 0) {
        this.issues.push({
          severity: 'warning',
          category: 'Naming',
          message: `Potential conflict: "${camel}" already exists in ${conflicts.length} files`,
          suggestion: `Review usage of "${camel}" before converting "${kebab}"`,
        });
      }
    }
  }

  private async findConflicts(name: string): Promise<string[]> {
    const conflicts: string[] = [];
    
    try {
      const result = execSync(`rg -l "\\b${name}\\b" --type ts`, {
        cwd: join(this.rootDir, 'src'),
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      const files = result.split('\n').filter(f => f.length > 0);
      conflicts.push(...files);
    } catch {
      // No conflicts found
    }
    
    return conflicts;
  }

  private async countUsage(pattern: string): Promise<number> {
    try {
      const result = execSync(`rg -c "${pattern}" --type ts`, {
        cwd: join(this.rootDir, 'src'),
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      const lines = result.split('\n').filter(l => l.length > 0);
      return lines.reduce((sum, line) => {
        const count = parseInt(line.split(':')[1] || '0');
        return sum + count;
      }, 0);
    } catch {
      return 0;
    }
  }

  private async validateConversions(): Promise<void> {
    console.log('✅ Validating conversion safety...');
    
    // Check for automated conversion potential
    const totalConversions = this.conversions.reduce((sum, c) => sum + c.usage, 0);
    const conflictingConversions = this.conversions.filter(c => c.conflicts.length > 0);
    
    const automatedPercentage = ((totalConversions - conflictingConversions.length * 10) / totalConversions * 100).toFixed(1);
    
    this.issues.push({
      severity: 'info',
      category: 'Automation',
      message: `Approximately ${automatedPercentage}% of conversions can be automated`,
      suggestion: conflictingConversions.length > 0 
        ? `Manual review needed for ${conflictingConversions.length} conversions`
        : 'All conversions appear safe for automation',
    });
  }

  private async checkBackwardsCompatibility(): Promise<void> {
    console.log('🔄 Checking backwards compatibility strategy...');
    
    // Check if conversion utilities exist
    const converterPath = join(this.rootDir, 'src', 'plugins', 'recipes', 'property-parser.ts');
    try {
      const content = await readFile(converterPath, 'utf-8');
      
      if (content.includes('replace(/-([a-z])/g')) {
        this.issues.push({
          severity: 'info',
          category: 'Compatibility',
          message: 'Kebab-to-camel converter already exists in property-parser.ts',
          suggestion: 'Can leverage existing converter for backwards compatibility',
        });
      }
    } catch {
      this.issues.push({
        severity: 'warning',
        category: 'Compatibility',
        message: 'No existing kebab-to-camel converter found',
        suggestion: 'Will need to implement compatibility layer',
      });
    }
  }

  private async checkDependencies(): Promise<void> {
    console.log('📦 Checking dependencies...');
    
    // Check for JSX/TSX support
    const tsconfigPath = join(this.rootDir, 'tsconfig.json');
    try {
      const tsconfig = JSON.parse(await readFile(tsconfigPath, 'utf-8'));
      
      if (tsconfig.compilerOptions?.jsx) {
        this.issues.push({
          severity: 'warning',
          category: 'Configuration',
          message: 'JSX already configured in tsconfig.json',
          suggestion: 'Check if current JSX settings are compatible',
        });
      } else {
        this.issues.push({
          severity: 'info',
          category: 'Configuration',
          message: 'JSX not configured in tsconfig.json',
          suggestion: 'Will need to add "jsx": "react-jsx" to compilerOptions',
        });
      }
    } catch {
      this.issues.push({
        severity: 'error',
        category: 'Configuration',
        message: 'Could not read tsconfig.json',
      });
    }

    // Check Vite configuration
    const viteConfigPath = join(this.rootDir, 'vite.config.ts');
    try {
      const viteConfig = await readFile(viteConfigPath, 'utf-8');
      
      if (!viteConfig.includes('.tsx')) {
        this.issues.push({
          severity: 'info',
          category: 'Build',
          message: 'Vite not configured for TSX files',
          suggestion: 'Will need to update Vite config to handle .tsx extensions',
        });
      }
    } catch {
      this.issues.push({
        severity: 'warning',
        category: 'Build',
        message: 'Could not read vite.config.ts',
      });
    }
  }

  private generateReport(): void {
    console.log('\n' + '='.repeat(80));
    console.log('📋 MIGRATION VALIDATION REPORT');
    console.log('='.repeat(80));

    // Group issues by severity
    const errors = this.issues.filter(i => i.severity === 'error');
    const warnings = this.issues.filter(i => i.severity === 'warning');
    const info = this.issues.filter(i => i.severity === 'info');

    // Summary
    console.log('\n📊 Summary:');
    console.log(`  ❌ Errors: ${errors.length}`);
    console.log(`  ⚠️  Warnings: ${warnings.length}`);
    console.log(`  ℹ️  Info: ${info.length}`);
    console.log(`  🔄 Total conversions needed: ${this.conversions.length}`);
    
    const ready = errors.length === 0;
    console.log(`\n  Migration Readiness: ${ready ? '✅ READY' : '❌ NOT READY'}`);

    // Errors (blockers)
    if (errors.length > 0) {
      console.log('\n❌ ERRORS (Must fix before migration):');
      console.log('-'.repeat(60));
      errors.forEach(issue => {
        console.log(`  [${issue.category}] ${issue.message}`);
        if (issue.suggestion) {
          console.log(`    → ${issue.suggestion}`);
        }
      });
    }

    // Warnings (should review)
    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS (Should review):');
      console.log('-'.repeat(60));
      warnings.forEach(issue => {
        console.log(`  [${issue.category}] ${issue.message}`);
        if (issue.suggestion) {
          console.log(`    → ${issue.suggestion}`);
        }
      });
    }

    // Info (helpful context)
    if (info.length > 0) {
      console.log('\nℹ️  INFORMATION:');
      console.log('-'.repeat(60));
      info.forEach(issue => {
        console.log(`  [${issue.category}] ${issue.message}`);
        if (issue.suggestion) {
          console.log(`    → ${issue.suggestion}`);
        }
      });
    }

    // Conversion details
    console.log('\n🔄 Conversion Plan:');
    console.log('-'.repeat(60));
    
    const highUsage = this.conversions.filter(c => c.usage > 10);
    const withConflicts = this.conversions.filter(c => c.conflicts.length > 0);
    
    console.log('\n  High-usage conversions (>10 occurrences):');
    highUsage.forEach(conv => {
      console.log(`    ${conv.from} → ${conv.to} (${conv.usage} uses)`);
    });
    
    if (withConflicts.length > 0) {
      console.log('\n  ⚠️  Conversions with conflicts:');
      withConflicts.forEach(conv => {
        console.log(`    ${conv.from} → ${conv.to} (${conv.conflicts.length} conflicts)`);
      });
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    console.log('-'.repeat(60));
    
    if (ready) {
      console.log('  1. Create safety branch before starting');
      console.log('  2. Run automated conversions first');
      console.log('  3. Handle conflicts manually');
      console.log('  4. Update tests incrementally');
      console.log('  5. Maintain dual support during transition');
    } else {
      console.log('  1. Fix all errors before proceeding');
      console.log('  2. Review and address warnings');
      console.log('  3. Ensure all tests are passing');
      console.log('  4. Re-run validation after fixes');
    }

    // Next steps
    console.log('\n📝 Next Steps:');
    console.log('-'.repeat(60));
    if (ready) {
      console.log('  ✅ Ready to proceed with Phase 0 implementation');
      console.log('  → Generate MIGRATION_MAP.md with detailed plan');
      console.log('  → Setup safety branches');
      console.log('  → Begin incremental migration');
    } else {
      console.log('  ❌ Address validation issues first');
      console.log('  → Fix errors and warnings');
      console.log('  → Re-run validation');
    }
  }
}

// Run the validator
const validator = new MigrationValidator(join(import.meta.dir, '..'));
validator.validate().catch(console.error);
