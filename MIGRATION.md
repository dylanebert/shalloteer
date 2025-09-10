# JSX Migration

**Branch**: `jsx-migration`  
**Status**: Phase 2 Complete  
**Tests**: 744/748 passing

## Quick Start

For new conversations: `/peel @MIGRATION.md` to load context.

## Current State

### ✅ Phase 1 Complete
- JSX infrastructure operational alongside XML
- Zero breaking changes
- TypeScript interfaces for components
- Build system configured for TSX

### ✅ Phase 2 Complete
- All recipe JSX components tested (26 tests passing)
- Type generator rewritten and working
- Direct entity creation implemented (`entity-creator.ts`)
- JSX and XML coexistence verified

### Next Steps
1. Create standalone JSX example (separate from XML demo)
2. Document JSX usage patterns in llms.txt
3. Phase 3: Kebab-to-camel conversion (102 occurrences)
4. Phase 4: Deprecation warnings
5. Phase 5: XML removal

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