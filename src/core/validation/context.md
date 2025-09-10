# Validation Module

<!-- LLM:OVERVIEW -->
Zod-based validation system providing compile-time and runtime validation for XML recipes and component attributes. Single source of truth for all validation rules.
<!-- /LLM:OVERVIEW -->

## Purpose

- Define validation schemas using Zod
- Validate XML at compile-time and runtime
- Generate TypeScript types from schemas
- Format validation errors with helpful suggestions

## Layout

```
validation/
├── context.md         # This file
├── schemas.ts         # Zod schema definitions
├── types.ts           # Generated TypeScript types
├── parser.ts          # Zod-based validation parser
├── error-formatter.ts # Format Zod errors with diagnostics
├── build-validator.ts # Build-time validation script
└── index.ts           # Module exports
```

## Scope

- **In-scope**: Schema definitions, validation logic, error formatting, type generation
- **Out-of-scope**: Component implementation, XML parsing (uses core/xml)

## Entry Points

- **schemas.ts**: All Zod schema definitions
- **parser.ts**: Runtime validation functions
- **build-validator.ts**: Build-time validation script

## Dependencies

- **Internal**: core/xml, plugins/recipes/diagnostics
- **External**: zod

<!-- LLM:REFERENCE -->
## API Reference

### Schemas

- `vector3Schema` - Validates 3D vectors (single value or "x y z")
- `colorSchema` - Validates colors (hex, 0x prefix, or numeric)
- `transformSchema` - Validates transform component properties
- `recipeSchemas` - Map of recipe names to their schemas

### Functions

- `validateRecipeAttributes(recipeName, attributes)` - Validate recipe attributes
- `validateXMLContent(xmlString, options?)` - Validate XML string
- `formatZodError(error, context)` - Format Zod errors with suggestions

### Types

- `RecipeAttributes` - Inferred types for all recipes
- `Vector3` - Type for 3D vectors
- `Color` - Type for colors
<!-- /LLM:REFERENCE -->

<!-- LLM:EXAMPLES -->
## Examples

### Runtime Validation

```typescript
import { validateRecipeAttributes } from 'shalloteer/core/validation';

const attributes = {
  pos: "0 5 0",
  shape: "box",
  size: "1 1 1",
  color: "#ff0000"
};

const validated = validateRecipeAttributes('static-part', attributes);
// Returns parsed and validated attributes
```

### Build-Time Validation

```bash
bun run validate
# Validates all XML in project files
```

### Type Generation

```typescript
import type { RecipeAttributes } from 'shalloteer/core/validation';

type StaticPart = RecipeAttributes['static-part'];
// { pos: Vector3, shape: 'box' | 'sphere' | ..., size: Vector3, color: Color }
```
<!-- /LLM:EXAMPLES -->