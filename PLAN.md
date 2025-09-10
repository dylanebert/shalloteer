# Shalloteer Architecture Transformation Plan

## Vision
Transform Shalloteer from runtime XML parsing to compile-time validated JSX, providing perfect IDE integration for LLM-assisted game development.

## ⚠️ Reality Check: Scope Analysis

### Custodial Changes Required
- **212+ kebab-case occurrences** across 20+ files need renaming
- **90+ source files** potentially need updates
- **20+ test files** need rewriting
- **17 context.md files** need documentation updates
- **Multiple example files** need complete rewrites
- **Build configurations** need JSX support

**Realistic Timeline: 40-60 hours** (not 12 hours)

## 1. Planned Architecture

### Core Principle: Progressive Enhancement
Add JSX alongside XML first, then gradually migrate, then remove XML.

### Architecture Layers

```
Phase 1: Dual Support
┌─────────────────────────────────────┐
│    XML Strings  |  JSX Components   │  ← Both work
├─────────────────────────────────────┤
│    XML Parser   |  JSX Compiler     │  ← Dual paths
├─────────────────────────────────────┤
│         Unified Entity Creation      │  ← Shared core
├─────────────────────────────────────┤
│         ECS Runtime (bitECS)        │  ← Unchanged
└─────────────────────────────────────┘

Phase 2: JSX Primary (after validation)
┌─────────────────────────────────────┐
│         JSX Components (TSX)        │  ← Primary path
├─────────────────────────────────────┤
│      TypeScript + JSX Compiler      │  ← Compile-time
├─────────────────────────────────────┤
│    Direct Entity Creation Calls      │  ← No parsing
├─────────────────────────────────────┤
│         ECS Runtime (bitECS)        │  ← Unchanged
└─────────────────────────────────────┘
```

## 2. Implementation Plan - Small Testable Iterations

### Phase 0: Preparation & Analysis (4 hours)
**Goal**: Understand scope and prepare for migration

#### 0.1 Codebase Analysis (1 hour)
- [ ] Run analysis script to find all kebab-case usage
- [ ] Map all files that import XML parser
- [ ] List all recipe definitions
- [ ] Document all test dependencies
- [ ] Output: `MIGRATION_MAP.md` with exact changes needed

#### 0.2 Create Migration Tools (2 hours)
- [ ] Script: `tools/kebab-to-camel.ts` - automated renaming
- [ ] Script: `tools/find-xml-usage.ts` - find XML strings
- [ ] Script: `tools/validate-migration.ts` - check consistency
- [ ] Test: Tools work on sample files

#### 0.3 Backup & Branch Strategy (1 hour)
- [ ] Create `pre-jsx` branch for safety
- [ ] Set up parallel `jsx-migration` branch
- [ ] Document rollback procedure
- [ ] Set up CI to test both branches

### Phase 1: JSX Infrastructure WITHOUT Breaking Changes (6 hours)
**Goal**: Add JSX support while keeping XML 100% functional

#### 1.1 Minimal JSX Config (1 hour)
- [ ] Add `tsconfig.jsx.json` (separate config)
- [ ] Update Vite to handle `.tsx` files
- [ ] Create `src/jsx/runtime.ts` with factory
- [ ] Test: Can compile empty TSX file
- [ ] Test: Existing XML tests still pass

#### 1.2 Type Generation from Zod (2 hours)
- [ ] Create `src/jsx/types/generate.ts`
- [ ] Generate `src/jsx/types/components.d.ts`
- [ ] Map Zod schemas → TypeScript interfaces
- [ ] Add to build pipeline
- [ ] Test: Generated types match schemas

#### 1.3 First JSX Component - Entity (1 hour)
- [ ] Create `src/jsx/components/Entity.tsx`
- [ ] Bridge to existing entity creation
- [ ] Support basic props
- [ ] Test: `<Entity />` creates same as XML

#### 1.4 Parallel Recipe System (2 hours)
- [ ] Create `src/jsx/components/recipes.tsx`
- [ ] Map ONE recipe: `StaticPart` as proof of concept
- [ ] Bridge to existing recipe system
- [ ] Test: JSX and XML create identical entities
- [ ] Test: Both can exist in same file

### Phase 2: Incremental Recipe Migration (8 hours)
**Goal**: Migrate recipes one by one, maintaining dual support

#### 2.1 Physics Recipes (2 hours)
- [ ] Migrate `static-part` → `StaticPart`
- [ ] Migrate `dynamic-part` → `DynamicPart`  
- [ ] Migrate `kinematic-part` → `KinematicPart`
- [ ] Test: Each works in JSX
- [ ] Test: XML versions still work

#### 2.2 Player & Camera Recipes (2 hours)
- [ ] Migrate `player` → `Player`
- [ ] Migrate `orbit-camera` → `OrbitCamera`
- [ ] Handle nested children
- [ ] Test: Player with children works
- [ ] Test: Camera configuration works

#### 2.3 Rendering Recipes (2 hours)
- [ ] Migrate `ambient-light` → `AmbientLight`
- [ ] Migrate `directional-light` → `DirectionalLight`
- [ ] Migrate `light` → `Light`
- [ ] Test: Lighting setup works
- [ ] Test: All rendering tests pass

#### 2.4 Update Examples - Dual Format (2 hours)
- [ ] Create `example/src/jsx-version.tsx`
- [ ] Keep `example/index.html` with XML
- [ ] Document both approaches
- [ ] Test: Both examples run identically
- [ ] Test: Performance is equivalent

### Phase 3: Custodial - Kebab to Camel Migration (12 hours)
**Goal**: Systematically rename all kebab-case to camelCase

#### 3.1 Component Properties (4 hours)
- [ ] Run tool: Rename in `src/plugins/*/components.ts`
- [ ] Update all component definitions
- [ ] Update TypeScript types
- [ ] Test: All components compile
- [ ] Test: No runtime errors

#### 3.2 Recipe Attributes (3 hours)
- [ ] Update recipe schemas in Zod
- [ ] Regenerate TypeScript types
- [ ] Update shorthand mappings
- [ ] Test: JSX props validate correctly
- [ ] Test: Can still parse old format (compatibility)

#### 3.3 Test File Updates (3 hours)
- [ ] Update 20+ test files with new names
- [ ] Maintain dual assertions where needed
- [ ] Fix any broken imports
- [ ] Test: All tests pass

#### 3.4 Documentation Updates (2 hours)
- [ ] Update 17 context.md files
- [ ] Update README.md
- [ ] Update llms-template.txt
- [ ] Regenerate llms.txt
- [ ] Test: Documentation builds

### Phase 4: XML Deprecation (6 hours)
**Goal**: Mark XML as deprecated, JSX as primary

#### 4.1 Add Deprecation Warnings (2 hours)
- [ ] Add console warnings for XML usage
- [ ] Update documentation with deprecation notice
- [ ] Provide migration guide
- [ ] Test: Warnings appear correctly

#### 4.2 Convert Remaining Examples (2 hours)
- [ ] Convert all example files to JSX
- [ ] Remove XML from documentation examples
- [ ] Update getting started guide
- [ ] Test: All examples work

#### 4.3 Performance Validation (2 hours)
- [ ] Benchmark JSX vs XML creation
- [ ] Profile memory usage
- [ ] Check bundle size impact
- [ ] Test: JSX is faster than XML

### Phase 5: XML Removal (8 hours)
**Goal**: Remove XML support entirely (major breaking change)

#### 5.1 Remove Parser Code (2 hours)
- [ ] Delete `src/core/xml/` directory
- [ ] Remove XML imports from recipes
- [ ] Remove XML validation code
- [ ] Test: No XML references remain

#### 5.2 Simplify Recipe System (2 hours)
- [ ] Remove dual-path logic
- [ ] Optimize for JSX-only path
- [ ] Remove string parsing utilities
- [ ] Test: Simplified code works

#### 5.3 Final Test Suite Update (2 hours)
- [ ] Remove all XML test cases
- [ ] Update integration tests
- [ ] Fix any remaining issues
- [ ] Test: Full test suite passes

#### 5.4 Bundle & Release (2 hours)
- [ ] Update package.json version (major bump)
- [ ] Update all documentation
- [ ] Create migration guide
- [ ] Test: Clean install works

## 3. Risk Mitigation

### Rollback Points
1. **After Phase 1**: Can abort with no changes to XML
2. **After Phase 2**: Can keep dual support indefinitely
3. **After Phase 3**: Can revert naming if issues
4. **After Phase 4**: Last chance before breaking changes

### Testing Strategy
- **Every iteration**: Run full test suite
- **Parallel testing**: Test XML and JSX produce identical results
- **Performance testing**: Ensure no regression
- **User testing**: Beta test with select developers

### Migration Support
```typescript
// Compatibility layer during transition
function parseRecipeAttribute(value: string | number | number[]) {
  // Handle both old string format and new array format
  if (typeof value === 'string' && value.includes(' ')) {
    console.warn('String positions are deprecated, use arrays');
    return value.split(' ').map(Number);
  }
  return value;
}
```

## 4. Detailed File Impact Analysis

### High-Impact Files (Need Complete Rewrite)
- `src/plugins/recipes/parser.ts` - XML parsing logic
- `src/plugins/recipes/property-parser.ts` - String parsing
- `src/core/xml/*` - Entire directory
- `example/index.html` - Game example

### Medium-Impact Files (Significant Changes)
- All recipe definitions (10+ files)
- All component definitions (15+ files)
- Test files (20+ files)
- Documentation (17+ context.md files)

### Low-Impact Files (Minor Updates)
- Plugin exports
- Type definitions
- Build configuration

## 5. Success Metrics

### Phase 1-2 Success (Dual Support)
- [ ] JSX and XML work side-by-side
- [ ] No breaking changes
- [ ] All tests pass
- [ ] Performance unchanged

### Phase 3-4 Success (Migration)
- [ ] All kebab-case removed
- [ ] JSX is primary path
- [ ] IDE autocomplete works
- [ ] LLMs generate valid JSX

### Phase 5 Success (Completion)
- [ ] Zero XML code remains
- [ ] 20% performance improvement
- [ ] Bundle size reduced
- [ ] 100% TypeScript coverage


## Example: Before vs After

### Before (Current XML)
```html
<world canvas="#game-canvas">
  <static-part pos="0 -0.5 0" shape="box" size="20 1 20" color="#90ee90"></static-part>
  <dynamic-part pos="0 5 0" shape="sphere" size="1" color="#ff0000" 
                collider="restitution: 0.9"></dynamic-part>
</world>
```

Problems:
- No IDE validation
- Strings parsed at runtime
- Typos crash at runtime
- LLMs generate invalid attributes

### After (JSX)
```tsx
<World canvas="#game-canvas">
  <StaticPart 
    position={[0, -0.5, 0]} 
    shape="box"              // ← IDE autocompletes: "box" | "sphere" | "cylinder"
    size={[20, 1, 20]} 
    color={0x90ee90}
  />
  <DynamicPart 
    position={[0, 5, 0]} 
    shape="sphere" 
    size={1} 
    color={0xff0000}
    collider={{ restitution: 0.9 }}  // ← Nested object with full typing
  />
</World>
```

Benefits:
- ✅ IDE shows errors immediately
- ✅ Autocomplete for everything
- ✅ No runtime parsing
- ✅ LLMs know this pattern perfectly

## 6. Critical Warnings & Realistic Timeline

### ⚠️ Major Custodial Tasks
1. **Kebab-to-Camel Renaming**: 212+ occurrences across 20+ files
   - Cannot be done manually - needs automation
   - Will touch almost every file in the codebase
   - High risk of breaking something

2. **Test Suite Updates**: 20+ test files
   - Each test needs careful migration
   - Must maintain coverage during transition
   - Double testing burden during dual-support phase

3. **Documentation Overhaul**: 17+ context files + llms.txt
   - Must keep in sync with code changes
   - Critical for LLM understanding
   - Easy to forget and create inconsistencies

### 📅 Realistic Timeline

| Phase | Hours | Weeks | Notes |
|-------|-------|-------|-------|
| Phase 0: Preparation | 4 | 0.5 | Critical - don't skip |
| Phase 1: JSX Infrastructure | 6 | 1 | Can pause here safely |
| Phase 2: Recipe Migration | 8 | 1 | Incremental, low risk |
| Phase 3: Custodial Changes | 12 | 1.5 | High risk, needs focus |
| Phase 4: Deprecation | 6 | 1 | User communication critical |
| Phase 5: XML Removal | 8 | 1 | Point of no return |
| **Total** | **44-60 hours** | **6-8 weeks** | Part-time development |

### 🛑 Go/No-Go Decision Points

1. **After Phase 0**: Abort if scope too large
2. **After Phase 1**: Abort if JSX complexity too high
3. **After Phase 2**: Last chance to keep XML forever
4. **After Phase 3**: Commit or revert naming
5. **After Phase 4**: Final decision before breaking changes

## Decision: Phased Commitment

Given the scope (40-60 hours, not 12), recommend:
1. **Phase 0-1 First** - Validate JSX approach (1 week)
2. **Evaluate** - Is it worth the effort?
3. **Phase 2** - Add JSX alongside XML (1 week)
4. **Long-term Dual Support** - Let users choose
5. **Phase 3-5 Later** - Only if clear benefits emerge

This positions Shalloteer as flexible and modern without forcing a risky all-or-nothing migration.
