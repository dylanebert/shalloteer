# Shalloteer XML to JSX Migration Map

Generated: 2025-09-10

## Executive Summary

This document provides a comprehensive map for migrating Shalloteer from XML to JSX. Analysis shows **102 kebab-case occurrences** across **48 files**, with **31 files** having XML dependencies and **17 test files** requiring updates.

**Migration Readiness: ✅ READY**
- All tests passing
- Existing kebab-to-camel converter available
- No blocking conflicts identified
- Clear migration path established

## 1. Scope Analysis

### 1.1 Kebab-Case Usage (102 occurrences)

| Type | Count | Examples |
|------|-------|----------|
| **Component Names** | 4 | `orbit-camera`, `animated-character`, `character-controller`, `world-transform` |
| **Recipe Names** | 6 | `static-part`, `dynamic-part`, `kinematic-part`, `ambient-light` |
| **Property Names** | 31 | `target-distance`, `jump-height`, `cast-shadow`, `gravity-scale` |
| **Enum Values** | 4 | `kinematic-position`, `kinematic-velocity` |
| **Shorthands** | 57 | Easing functions (`sine-in`, `quad-out`), property mappings |

### 1.2 XML Dependencies (31 files)

| Category | Count | Critical Files |
|----------|-------|----------------|
| **Core Infrastructure** | 6 | `runtime.ts`, `core/xml/*`, `plugins/recipes/parser.ts` |
| **Plugin Files** | 8 | Recipe definitions and parsers |
| **Test Files** | 17 | Integration and E2E tests |

### 1.3 Recipe Definitions (10 recipes)

| Plugin | Recipes |
|--------|---------|
| **Physics** | `static-part`, `dynamic-part`, `kinematic-part` |
| **Rendering** | `ambient-light`, `directional-light`, `light` |
| **Player** | `player` |
| **Camera** | `camera` |
| **Base** | `entity` |

## 2. File-by-File Impact Assessment

### 2.1 High-Impact Files (>10 changes)

| File | Changes | Risk | Notes |
|------|---------|------|-------|
| `plugins/tweening/utils.ts` | 28 | Low | Easing function mappings |
| `core/validation/schemas.ts` | 26 | Medium | Zod schema definitions |
| `plugins/rendering/recipes.ts` | 16 | Medium | Recipe overrides |
| `plugins/player/recipes.ts` | 12 | Medium | Component property mappings |

### 2.2 Critical Path Files

These files form the core XML processing pipeline:

```
runtime.ts
  ├── core/xml/parser.ts        (XML parsing)
  ├── core/xml/values.ts        (Value conversion)
  └── plugins/recipes/parser.ts (Entity creation)
      ├── property-parser.ts    (Property parsing)
      └── shorthand-expander.ts (Shorthand expansion)
```

### 2.3 Test Files Requiring Updates

| Test Category | Files | XML Strings | Parser Calls |
|---------------|-------|-------------|--------------|
| **Unit Tests** | 2 | 18 | 12 |
| **Integration** | 13 | 169 | 287 |
| **E2E Tests** | 2 | 14 | 10 |

## 3. Conversion Mappings

### 3.1 Component Names

| Kebab-Case | CamelCase | Usage Count |
|------------|-----------|-------------|
| `orbit-camera` | `OrbitCamera` | 15 |
| `animated-character` | `AnimatedCharacter` | 5 |
| `character-controller` | `CharacterController` | 8 |
| `world-transform` | `WorldTransform` | 12 |

### 3.2 Recipe Names

| XML Tag | JSX Component | Priority |
|---------|---------------|----------|
| `<static-part>` | `<StaticPart />` | High |
| `<dynamic-part>` | `<DynamicPart />` | High |
| `<kinematic-part>` | `<KinematicPart />` | Medium |
| `<player>` | `<Player />` | High |
| `<camera>` | `<Camera />` | High |
| `<ambient-light>` | `<AmbientLight />` | Low |
| `<directional-light>` | `<DirectionalLight />` | Low |

### 3.3 Property Attributes

| Kebab-Case | CamelCase | Component |
|------------|-----------|-----------|
| `target-distance` | `targetDistance` | OrbitCamera |
| `jump-height` | `jumpHeight` | Player |
| `cast-shadow` | `castShadow` | Directional |
| `gravity-scale` | `gravityScale` | Body |
| `max-distance` | `maxDistance` | OrbitCamera |
| `min-pitch` | `minPitch` | OrbitCamera |

## 4. Risk Matrix

### 4.1 Risk Assessment by Component

| Component | Risk Level | Reason | Mitigation |
|-----------|------------|--------|------------|
| **XML Parser** | High | Core dependency | Maintain dual support |
| **Recipe System** | Medium | Many dependencies | Incremental migration |
| **Tests** | Low | Isolated changes | Update alongside code |
| **Property Parser** | Low | Has converter | Leverage existing code |

### 4.2 Potential Conflicts

| Area | Conflict | Resolution |
|------|----------|------------|
| **Naming** | None detected | Safe to proceed |
| **Types** | JSX types needed | Generate from Zod |
| **Build** | TSX not configured | Update configs |
| **Runtime** | Dual parsing paths | Temporary overhead |

## 5. Migration Strategy

### 5.1 Phase Breakdown

| Phase | Duration | Risk | Rollback Point |
|-------|----------|------|----------------|
| **Phase 0: Preparation** | 4 hours | None | N/A |
| **Phase 1: JSX Infrastructure** | 6 hours | Low | Yes |
| **Phase 2: Recipe Migration** | 8 hours | Low | Yes |
| **Phase 3: Kebab→Camel** | 12 hours | High | Yes |
| **Phase 4: Deprecation** | 6 hours | Low | Yes |
| **Phase 5: XML Removal** | 8 hours | High | No |

### 5.2 Automated vs Manual Changes

| Change Type | Automated | Manual | Notes |
|-------------|-----------|--------|-------|
| **Component registration** | ✅ | | Script can handle |
| **Recipe names** | ✅ | | Simple find-replace |
| **Property names** | ✅ | | Existing converter |
| **Test updates** | ⚠️ | ✅ | Needs verification |
| **Type definitions** | ✅ | | Generate from Zod |

## 6. Backwards Compatibility Plan

### 6.1 Existing Infrastructure

- **Property Parser** (`property-parser.ts`): Already converts kebab-case to camelCase
- **Shorthand Expander** (`shorthand-expander.ts`): Handles property expansion
- **Validation Layer** (`core/validation`): Can validate both formats

### 6.2 Compatibility Layer Design

```typescript
// During transition period
function parseAttribute(value: string | JSXValue) {
  if (typeof value === 'string') {
    console.warn('String attributes deprecated, use JSX');
    return parseStringAttribute(value);
  }
  return value;
}
```

### 6.3 Deprecation Timeline

1. **v2.0.0**: Add JSX support alongside XML (dual support)
2. **v2.1.0**: Mark XML as deprecated with warnings
3. **v3.0.0**: Remove XML support (breaking change)

## 7. Implementation Checklist

### Phase 0: Preparation ✅
- [x] Run kebab-case analysis
- [x] Map XML dependencies
- [x] Create validation tools
- [x] Generate migration map
- [x] Setup safety branches

### Phase 1: JSX Infrastructure ✅ (Completed 2025-09-10)
- [x] Add TSX to tsconfig.json
- [x] Update Vite config for .tsx
- [x] Create JSX runtime factory
- [x] Generate types from Zod (manual generation)
- [x] Create first JSX component (Entity.tsx)
- [x] Create recipes.tsx with StaticPart
- [x] Test JSX and XML coexistence
- [x] All 718 tests passing
- [x] Build successful with JSX support

### Phase 2: Recipe Migration
- [ ] Migrate physics recipes
- [ ] Migrate player recipe
- [ ] Migrate camera recipe
- [ ] Migrate rendering recipes
- [ ] Update examples

### Phase 3: Custodial Changes
- [ ] Run automated conversions
- [ ] Update component registrations
- [ ] Fix property names
- [ ] Update all tests
- [ ] Update documentation

### Phase 4: Deprecation
- [ ] Add deprecation warnings
- [ ] Update documentation
- [ ] Create migration guide
- [ ] Performance validation

### Phase 5: XML Removal
- [ ] Remove XML parser
- [ ] Remove string parsing
- [ ] Simplify recipe system
- [ ] Final test suite update
- [ ] Major version release

## 8. Rollback Procedures

### Rollback Points

1. **After Phase 1**: `git checkout pre-jsx-backup`
2. **After Phase 2**: `git revert jsx-recipes`
3. **After Phase 3**: `git revert kebab-to-camel`
4. **After Phase 4**: Keep dual support indefinitely

### Emergency Rollback

```bash
# If critical issues arise
git checkout pre-jsx-backup
git branch -D jsx-migration
bun test  # Verify original state
```

## 9. Success Metrics

### Technical Metrics
- [ ] All tests passing (100%)
- [ ] No runtime errors
- [ ] Performance improvement (>20%)
- [ ] Bundle size reduction (>10%)
- [ ] TypeScript coverage (100%)

### Developer Experience
- [ ] IDE autocomplete working
- [ ] Type errors caught at compile time
- [ ] LLMs generate valid JSX
- [ ] Migration guide clear
- [ ] No breaking changes (until v3)

## 10. Next Actions

### Immediate (Phase 0 Completion)
1. Create safety branches
2. Setup CI for dual testing
3. Begin Phase 1 implementation

### Short-term (This Week)
1. Implement JSX infrastructure
2. Create first working JSX component
3. Validate approach with team

### Long-term (This Month)
1. Complete recipe migration
2. Begin custodial changes
3. Release v2.0.0-beta

## Appendix A: Tool Outputs

### Kebab-Case Analysis
- Total occurrences: 102
- Files affected: 11
- Estimated effort: 11 hours

### XML Dependency Map
- Total dependencies: 45
- Files with XML: 31
- Recipe definitions: 10
- Test files: 17

### Migration Validation
- Errors: 0
- Warnings: 0
- Ready: ✅ YES

## Appendix B: File Lists

### Files Requiring Manual Review
1. `plugins/tweening/utils.ts` - 28 easing mappings
2. `core/validation/schemas.ts` - 26 schema definitions
3. `plugins/rendering/recipes.ts` - 16 overrides
4. All test files - Manual verification needed

### Files for Automated Conversion
1. Component registration names
2. Recipe name definitions
3. Simple property mappings
4. Import statements

---

*This migration map is a living document. Update as migration progresses.*
