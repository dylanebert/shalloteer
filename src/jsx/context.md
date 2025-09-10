# JSX Module

Type-safe component definitions for Shalloteer using JSX/TSX syntax as an alternative to XML strings.

## Purpose

Provides compile-time validated JSX components that bridge to the existing entity creation system, enabling better IDE support and type safety.

## Structure

- **runtime.ts** - JSX factory functions for element creation
- **types/** - TypeScript interfaces for component props
  - **components.d.ts** - Manual type definitions for all components
  - **generate.ts** - Automated type generation from Zod (needs fix)
- **components/** - JSX component implementations
  - **Entity.tsx** - Base entity component bridging to ECS
  - **recipes.tsx** - Recipe components (StaticPart, DynamicPart, etc.)

## Design

JSX elements are transformed at compile-time into factory calls that bridge to the existing recipe system. This maintains full backward compatibility while adding type safety.

## Status

Phase 1 complete with dual XML/JSX support working. Entity creation currently uses recipe bridge - direct creation planned for Phase 2.