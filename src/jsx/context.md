# JSX Module

Type-safe component definitions for Shalloteer using JSX/TSX syntax as an alternative to XML strings.

## Purpose

Provides compile-time validated JSX components with direct ECS entity creation, enabling IDE support, type safety, and autocomplete.

## Structure

- **runtime.ts** - JSX factory functions for element creation
- **entity-creator.ts** - Direct JSX-to-ECS entity conversion
- **types/** - TypeScript interfaces for component props
  - **components.d.ts** - Generated type definitions for all components
  - **generate.ts** - Type generator script
- **components/** - JSX component implementations
  - **Entity.tsx** - Base entity component with direct ECS creation
  - **recipes.tsx** - Recipe components (StaticPart, DynamicPart, etc.)

## Design

JSX elements are processed directly into ECS entities without recipe indirection. Component props map directly to ECS component fields with automatic type conversion and shorthand expansion.

## Status

Phase 2 complete with direct entity creation, comprehensive testing, and full TypeScript support. JSX and XML work side-by-side with zero breaking changes.