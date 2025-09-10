# JSX Migration

**Branch**: `jsx-migration`  
**Status**: Phase 1 Complete, Phase 2 In Progress  
**Tests**: 718/718 passing

## Quick Start

For new conversations: `/peel @MIGRATION.md` to load context.

## Current State

### ✅ Phase 1 Complete
- JSX infrastructure operational alongside XML
- Zero breaking changes
- TypeScript interfaces for components
- Build system configured for TSX

### ⏳ Phase 2 In Progress
- Recipe components created (need testing)
- Entity.tsx using recipe bridge (temporary)
- Type generation script needs fixing

### Next Steps
1. Test all recipe JSX components
2. Fix Zod-to-TypeScript generator
3. Replace recipe bridge with direct entity creation
4. Create `example/jsx-demo.tsx`

## Files Created

```
src/jsx/
├── context.md              # Module context
├── runtime.ts              # JSX factory
├── types/
│   ├── components.d.ts     # Type definitions
│   └── generate.ts         # Type generator (broken)
└── components/
    ├── Entity.tsx          # Base entity component
    └── recipes.tsx         # Recipe components
```

## Testing

```bash
bun test                    # All tests
bun test jsx-xml-coexistence # JSX tests
bun run build              # Build check
```

## Timeline

- **Phase 0-1**: ✅ Complete (10 hours)
- **Phase 2**: ⏳ Recipe Migration (8 hours remaining)
- **Phase 3**: Kebab→Camel conversion (12 hours)
- **Phase 4**: Deprecation (6 hours)
- **Phase 5**: XML Removal (8 hours)
- **Total**: 44-60 hours

## Key Technical Details

- 102 kebab-case occurrences to migrate
- `toCamelCase` converter exists in `property-parser.ts`
- Dual XML/JSX support until Phase 4
- See `MIGRATION_MAP.md` for detailed mappings

## Principles

1. No breaking changes in Phase 1-2
2. Incremental migration
3. All tests must pass
4. Dual support maintained