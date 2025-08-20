# Core Module

<!-- LLM:OVERVIEW -->
Engine foundation providing Entity Component System (ECS) architecture, XML parsing for declarative entity creation, and essential utilities. The core module exports the State class for world management, plugin system interfaces, and bitECS integration.
<!-- /LLM:OVERVIEW -->

## Purpose

- ECS scheduler and state management
- XML parser for declarative entity creation
- Math utilities for 3D transformations
- Core types and interfaces

## Layout

```
core/
├── context.md  # This file
├── ecs/  # Entity Component System
│   ├── context.md
│   ├── constants.ts
│   ├── ordering.ts  # System execution order
│   ├── scheduler.ts  # Batch scheduling
│   ├── state.ts  # World state
│   ├── types.ts  # Core types
│   └── index.ts
├── xml/  # XML parsing
│   ├── context.md
│   ├── parser.ts  # Main parser
│   ├── traverser.ts  # DOM traversal
│   ├── types.ts  # XML types
│   ├── values.ts  # Value parsing
│   └── index.ts
├── math/  # Math utilities
│   ├── context.md
│   ├── utilities.ts
│   └── index.ts
├── utils/  # Core utilities
│   ├── naming.ts
│   └── index.ts
└── index.ts  # Core exports
```

## Scope

- **In-scope**: ECS foundation, XML parsing, math, core types
- **Out-of-scope**: Game logic, rendering, physics

## Entry Points

- **index.ts**: Core exports (State, Plugin, System, Component types)
- **ecs/scheduler.ts**: System scheduling and batches
- **xml/parser.ts**: XML to ECS entity conversion

## Dependencies

- **Internal**: None (foundation layer)
- **External**: bitECS, Three.js types

## Key Concepts

- **State**: Central world state managing entities/components
- **Plugin**: Bundle of systems, components, recipes
- **System**: Logic that operates on component queries
- **Scheduler**: Manages SetupBatch, FixedBatch, DrawBatch

### Execution Model

The engine uses a semi-fixed timestep model with three execution phases:

1. **SetupBatch**: Runs once per frame for input and frame setup
2. **FixedBatch**: Runs at 60Hz fixed intervals (may run 0-N times per frame)
   - Catches up if behind: multiple steps on slow frames
   - Waits if ahead: skips steps on fast frames
3. **DrawBatch**: Runs once per frame for rendering with interpolation

<!-- LLM:REFERENCE -->
## API Reference

### State Class

Central game state managing entities, components, systems, and plugins.

#### Methods

- `createEntity(): number` - Create a new entity and return its ID
- `destroyEntity(eid: number): void` - Remove an entity from the world
- `addComponent<T>(eid: number, component: T, values?: Record<string, number>): void` - Add component to entity with optional initial values
- `removeComponent<T>(eid: number, component: T): void` - Remove component from entity
- `hasComponent<T>(eid: number, component: T): boolean` - Check if entity has component
- `query<T>(...components: T): number[]` - Get all entities with specified components
- `registerPlugin(plugin: Plugin): void` - Register a plugin with its components, systems, recipes, and config
- `registerSystem(system: System): void` - Register a system for execution
- `registerRecipe(recipe: Recipe): void` - Register an entity recipe
- `registerComponent(name: string, component: Component): void` - Register a component by name
- `registerConfig(config: Config): void` - Register configuration (parsers, defaults, enums, etc.)
- `getRecipe(name: string): Recipe | undefined` - Get recipe by name
- `getComponent(name: string): Component | undefined` - Get component by kebab-case name
- `getParser(tag: string): Parser | undefined` - Get XML tag parser
- `step(deltaTime?: number): void` - Execute one frame step with all systems
- `dispose(): void` - Clean up all systems and resources

#### Properties

- `world: IWorld` - The bitECS world instance
- `time: GameTime` - Time tracking object with deltaTime, fixedDeltaTime, elapsed
- `scheduler: Scheduler` - System scheduler managing execution order
- `systems: Set<System>` - Registered systems
- `config: ConfigRegistry` - Configuration registry

### Type Definitions

#### System

```typescript
interface System {
  readonly update?: (state: State) => void;     // Called every frame
  readonly setup?: (state: State) => void;      // Called once on registration
  readonly dispose?: (state: State) => void;    // Called on cleanup
  readonly group?: 'setup' | 'simulation' | 'fixed' | 'draw';
  readonly first?: boolean;                     // Run first in group
  readonly last?: boolean;                      // Run last in group
  readonly before?: readonly System[];          // Run before these systems
  readonly after?: readonly System[];           // Run after these systems
}
```

#### Plugin

```typescript
interface Plugin {
  readonly systems?: readonly System[];         // Systems to register
  readonly recipes?: readonly Recipe[];         // Entity recipes
  readonly components?: Record<string, Component>; // Components by name
  readonly config?: Config;                     // Plugin configuration
}
```

#### Recipe

```typescript
interface Recipe {
  readonly name: string;                        // Recipe tag name
  readonly components?: string[];               // Component names to add
  readonly overrides?: Record<string, number>;  // Default value overrides
}
```

#### Config

```typescript
interface Config {
  readonly parsers?: Record<string, Parser>;    // Custom XML tag parsers
  readonly defaults?: Record<string, Record<string, number>>; // Component defaults
  readonly shorthands?: Record<string, Record<string, ShorthandMapping>>; // Attribute shorthands
  readonly enums?: Record<string, Record<string, EnumMapping>>; // Enum mappings
  readonly validations?: ValidationRule[];      // Validation rules
}
```

#### GameTime

```typescript
interface GameTime {
  deltaTime: number;        // Frame delta time in seconds
  fixedDeltaTime: number;   // Fixed update timestep (1/60)
  elapsed: number;          // Total elapsed time in seconds
}
```

#### Parser

```typescript
type Parser = (entity: number, element: ParsedElement, state: State) => void;
```

### XML Parser

#### XMLParser.parse(xmlString: string): XMLParseResult

Parses XML string into a structured element tree.

```typescript
interface ParsedElement {
  tagName: string;                          // Lowercase tag name
  attributes: Record<string, XMLValue>;     // Parsed attributes
  children: ParsedElement[];                // Child elements
}

type XMLValue = string | number | boolean | number[];
```

### Utility Functions

#### Naming Utilities

- `toKebabCase(str: string): string` - Convert PascalCase/camelCase to kebab-case
- `toCamelCase(str: string): string` - Convert kebab-case to camelCase

#### Math Utilities

- `lerp(a: number, b: number, t: number): number` - Linear interpolation
- `slerp(qa: Quaternion, qb: Quaternion, t: number): Quaternion` - Spherical linear interpolation for quaternions

### Constants

- `NULL_ENTITY: 4294967295` - Invalid entity ID constant (-1 JS Number -> 4294967295 WASM uint32)
- `TIME_CONSTANTS.FIXED_TIMESTEP: 1/60` - Fixed update rate (60 FPS)
- `TIME_CONSTANTS.DEFAULT_DELTA: 1/144` - Default frame delta (144 FPS)

### Re-exported from bitECS

- `defineComponent(schema: ComponentSchema): Component` - Define a new component
- `Types` - bitECS type definitions (f32, i32, ui8, etc.)
- `addComponent(world, component, eid)` - Low-level component addition
- `removeComponent(world, component, eid)` - Low-level component removal
- `hasComponent(world, component, eid)` - Low-level component check
- `addEntity(world)` - Low-level entity creation
- `removeEntity(world, eid)` - Low-level entity removal
- `createWorld()` - Create a new ECS world
<!-- /LLM:REFERENCE -->

<!-- LLM:EXAMPLES -->
## Examples

### Creating and Managing Entities

```typescript
import * as GAME from 'shalloteer';

// Define a component
const Health = GAME.defineComponent({
  current: GAME.Types.f32,
  max: GAME.Types.f32
});

// Create state and entity
const state = new GAME.State();
const entity = state.createEntity();

// Add component with initial values
state.addComponent(entity, Health, {
  current: 100,
  max: 100
});

// Query entities with Health
const entities = state.query(Health);
for (const eid of entities) {
  Health.current[eid] -= 10; // Direct array access
}

// Remove component and entity
state.removeComponent(entity, Health);
state.destroyEntity(entity);
```

### Defining Systems

```typescript
import * as GAME from 'shalloteer';
// Gameplay logic in fixed timestep (consistent simulation)
const PhysicsSystem = {
  group: 'fixed',
  update: (state) => {
    // Runs at 60Hz regardless of framerate
    // Use state.time.fixedDeltaTime (always 1/60)
    velocity += gravity * state.time.fixedDeltaTime;
  }
};

// Visual updates in draw phase (every frame)
const RenderSystem = {
  group: 'draw',
  update: (state) => {
    // Runs once per frame
    // Use state.time.deltaTime for frame-dependent animations
    particleAlpha -= fadeRate * state.time.deltaTime;
  }
};

// Input handling in setup phase
const InputSystem = {
  group: 'setup',
  first: true, // Run first in setup
  update: (state) => {
    // Gather input before other systems
  }
};

state.registerSystem(PhysicsSystem);
state.registerSystem(RenderSystem);
state.registerSystem(InputSystem);
```

### Creating Plugins

```typescript
import * as GAME from 'shalloteer';
const HealthPlugin: GAME.Plugin = {
  components: { Health },
  systems: [DamageSystem, RegenerationSystem],
  recipes: [{
    name: 'enemy',
    components: ['health', 'transform'],
    overrides: { 'health.max': 50 }
  }],
  config: {
    defaults: {
      health: { current: 100, max: 100 }
    },
    enums: {
      health: {
        difficulty: { easy: 50, normal: 100, hard: 200 }
      }
    }
  }
};

state.registerPlugin(HealthPlugin);
```

### Parsing XML

```typescript
import * as GAME from 'shalloteer';

const xml = `
  <world>
    <entity transform="pos: 0 5 0" health="max: 100"></entity>
  </world>
`;

const result = GAME.XMLParser.parse(xml);
// result.root contains ParsedElement tree

// Custom parser for a tag
const customParser: GAME.Parser = (entity, element, state) => {
  const pos = element.attributes.pos as number[];
  state.addComponent(entity, GAME.Transform, {
    posX: pos[0], posY: pos[1], posZ: pos[2]
  });
};

state.registerConfig({
  parsers: { 'my-tag': customParser }
});
```
<!-- /LLM:EXAMPLES -->
