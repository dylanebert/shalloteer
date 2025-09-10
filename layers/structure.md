# Project Structure

Shalloteer - A vibe coding game engine using ECS architecture with bitECS, featuring a Bevy-inspired plugin system and A-frame-style declarative XML recipes.

**Required**: Read [llms.txt](llms.txt) to understand current project

## Stack

- Runtime: Bun/Node.js
- Language: TypeScript 5.6
- Physics: Rapier 3D WASM
- Build: Vite 5.4 with TypeScript declarations

## Commands

- Build: `bun run build` (production build)
- Build: `bun run build:release` (release build)
- Example: `bun run example` (build and run demo application)
- Type Check: `bun run check` (TypeScript validation)
- Lint: `bun run lint --fix` (ESLint code analysis and formatting)
- Test: `bun test` (Unit and integration tests)
- Validate: `bun run validate` (XML recipe validation)

## llms.txt

An [llms.txt](../llms.txt) is provided to make the engine usable and optimized for large language models. It is automatically built from [layers/llms-template.txt](llms-template.txt) on `bun run build:release`. The template contains comprehensive usage patterns, and automatically pulls in additional reference material from context.md files on build.

## Layout

```
shalloteer/
├── CLAUDE.md  # Global context (Tier 0)
├── src/
│   ├── core/  # Engine foundation
│   │   ├── context.md  # Core module context
│   │   ├── ecs/  # ECS scheduler, state, ordering
│   │   ├── xml/  # XML parsing and entity creation
│   │   ├── math/  # Math utilities
│   │   ├── utils/  # Core utilities
│   │   └── index.ts  # Core exports
│   ├── plugins/  # Plugin modules
│   │   ├── animation/  # Animation system
│   │   ├── input/  # Input handling
│   │   ├── orbit-camera/  # Orbital camera
│   │   ├── physics/  # Rapier 3D physics
│   │   ├── player/  # Player controller
│   │   ├── recipes/  # XML recipe system
│   │   ├── rendering/  # Three.js rendering
│   │   ├── respawn/  # Respawn system
│   │   ├── startup/  # Initialization
│   │   ├── transforms/  # Transform hierarchy
│   │   ├── tweening/  # Tween animations
│   │   └── defaults.ts  # Default plugin bundle
│   ├── jsx/  # JSX/TSX support
│   │   ├── context.md  # JSX module context
│   │   ├── runtime.ts  # JSX factory and processing
│   │   ├── entity-creator.ts  # Direct entity creation
│   │   ├── types/  # TypeScript definitions
│   │   └── components/  # JSX components
│   ├── vite/  # Vite plugins
│   │   ├── index.ts  # Plugin exports
│   │   ├── console-plugin.ts  # Console forwarding
│   │   └── context.md  # Module context
│   ├── builder.ts  # Builder pattern API
│   ├── runtime.ts  # Game runtime engine
│   └── index.ts  # Main exports
├── example/  # XML demo application
│   ├── src/
│   │   └── main.ts
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── example-jsx/  # JSX demo application
│   ├── src/
│   │   ├── main.tsx
│   │   ├── Game.tsx
│   │   └── components/
│   │       └── Playground.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── layers/
│   ├── structure.md  # Project-level context (Tier 1)
│   ├── context-template.md  # Template for context files
|   └── llms-template.md # Template for llms.txt
├── dist/  # Built output
├── tests/
│   ├── unit/  # Unit tests
│   ├── integration/  # Integration tests
│   └── e2e/  # End-to-end tests
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .prettierrc  # Code formatting config
├── .prettierignore  # Prettier ignore patterns
├── eslint.config.js  # Linting configuration
└── README.md
```

## Plugin Architecture

### Standard Plugin Structure

Every plugin follows a predictable file structure for easy context loading:

- **index.ts** - Public API exports (front-facing interface)
- **plugin.ts** - Plugin definition bundling components, systems, recipes, and config
- **components.ts** - ECS component definitions (data structures)
- **systems.ts** - System definitions with logic factored out
- **recipes.ts** - Entity-component bundles for XML creation
- **utils.ts** - Business logic and helper functions

Optional files:

- **operations.ts** - Complex operations and algorithms
- **constants.ts** - Plugin-specific constants
- **parser.ts** - Custom tag parsing logic for XML elements
- **math.ts** - Mathematical utilities

### Plugin Registry

1. **animation** - Animation mixer and clip management
2. **input** - Mouse, keyboard, gamepad input handling
3. **orbit-camera** - Orbital camera controller
4. **physics** - Rapier 3D WASM physics integration
5. **player** - Player character controller
6. **recipes** - XML recipe system for declarative entities
7. **rendering** - Three.js rendering pipeline
8. **respawn** - Entity respawn system
9. **startup** - Initialization and setup systems
10. **transforms** - Transform component hierarchy
11. **tweening** - Tween-based animations
12. **defaults** - Bundle of standard plugins

## Architecture

Bevy-inspired ECS with explicit update phases:

- **SetupBatch**: Input gathering and frame setup
- **FixedBatch**: Physics simulation and gameplay logic
- **DrawBatch**: Rendering and interpolation

### Declarative Design

- Plugin definitions are self-documenting through structure
- Components define data without behavior
- Systems contain logic with dependencies declared
- Recipes enable XML-based entity creation like A-frame
- Config bundles all parsing-related settings (defaults, shorthands, enums, validations, parsers)

## Entry Points

- **Package entry**: src/index.ts (namespace API with builder pattern)
- **Core module**: src/core/index.ts (ECS foundation, types, utilities)
- **Plugin modules**: src/plugins/\*/index.ts (individual plugin exports)
- **JSX module**: src/jsx/index.ts (JSX components and runtime)
- **Vite plugin**: src/vite/index.ts (WASM setup for Rapier physics)
- **Builder API**: src/builder.ts (fluent builder pattern)
- **Runtime**: src/runtime.ts (game runtime engine)
- **XML example**: example/src/main.ts (XML demo)
- **JSX example**: example-jsx/src/main.tsx (JSX demo)

## Naming Conventions

**All files and directories use kebab-case**

- Files: `components.ts`, `systems.ts`, `utils.ts`, `plugin.ts`
- Directories: `src/`, `core/`, `plugins/`, `orbit-camera/`, `input/`
- Components: PascalCase exports from `components.ts`
- Systems: PascalCase with `System` suffix from `systems.ts`
- Plugins: PascalCase with `Plugin` suffix from `plugin.ts`
- Recipes: camelCase exports from `recipes.ts`

## Configuration

- TypeScript: tsconfig.json (strict mode, ES2020 target, DOM types)
- Build: vite.config.ts (library mode, ESM output, DTS generation)
- Package: package.json
- Code Quality: eslint.config.js (TypeScript linting), .prettierrc (formatting)

## Where to Add Code

### Adding to Existing Plugin

1. Components → src/plugins/[plugin-name]/components.ts
2. Systems → src/plugins/[plugin-name]/systems.ts
3. Recipes → src/plugins/[plugin-name]/recipes.ts
4. Utils → src/plugins/[plugin-name]/utils.ts
5. Update exports → src/plugins/[plugin-name]/index.ts
6. Register in plugin → src/plugins/[plugin-name]/plugin.ts

### Creating New Plugin

1. Create directory → src/plugins/[plugin-name]/
2. Add standard files:
   - index.ts (exports)
   - plugin.ts (plugin definition)
   - components.ts (if needed)
   - systems.ts (if needed)
   - recipes.ts (if needed)
   - utils.ts (if needed)
3. Export from package.json
4. Add to DefaultPlugins if standard

### Core Modifications

- ECS changes → src/core/ecs/
- XML parsing → src/core/xml/
- Math utilities → src/core/math/
- Core types → src/core/ecs/types.ts
