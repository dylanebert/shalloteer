# Recipes Plugin

XML recipe system for declarative entity creation

<!-- LLM:OVERVIEW -->
The Recipes Plugin provides the foundation for declarative entity creation in Shalloteer. It parses XML elements into ECS entities with components, supports parent-child hierarchies, and enables A-frame style syntax with attribute shorthands. This plugin is essential for loading XML-based scenes and creating entities from recipes.
<!-- /LLM:OVERVIEW -->

## Layout

```
recipes/
context.md  # This file, folder context (Tier 2)
├── index.ts  # Public exports
├── plugin.ts  # Plugin definition
├── components.ts  # Parent component
├── recipes.ts  # Base entity recipe
├── parser.ts  # XML to entity parser
├── property-parser.ts  # Attribute parsing
├── shorthand-expander.ts  # Shorthand expansion
├── diagnostics.ts  # Error reporting
├── types.ts  # Recipe types
└── utils.ts  # Recipe utilities
```

## Scope

- **In-scope**: XML parsing, entity creation from recipes, parent-child relationships, attribute parsing with shorthands, property validation, error diagnostics
- **Out-of-scope**: Component logic implementation, rendering, physics simulation, game logic

## Entry Points

- **parseXMLToEntities**: Called by the core XML system to convert parsed XML elements into entities
- **createEntityFromRecipe**: Called internally and by other plugins to create entities from recipe definitions
- **RecipePlugin**: Registered during game initialization to enable the recipe system
- **fromEuler**: Utility called when converting Euler angles to quaternions

## Dependencies

- **Internal**: Core ECS system, XML parser, Transform plugin (for hierarchies), all component plugins (for recipe attributes)
- **External**: bitECS, Three.js (for Euler/Quaternion conversions), DOM API

<!-- LLM:REFERENCE -->
## API Reference

### Components

#### Parent
Parent-child relationship component for entity hierarchies.

```typescript
const Parent = defineComponent({
  entity: Types.i32  // Parent entity ID
});
```

### Functions

#### parseXMLToEntities
Converts parsed XML elements into ECS entities with components.

```typescript
function parseXMLToEntities(
  state: State,
  xmlContent: ParsedElement
): EntityCreationResult[]
```

**Parameters:**
- `state`: Game state with access to ECS, recipes, and configuration
- `xmlContent`: Parsed XML element tree

**Returns:** Array of EntityCreationResult objects with entity IDs and hierarchy

**Features:**
- Recursively processes nested elements
- Automatically establishes parent-child relationships
- Validates recipe names and attributes
- Provides helpful error messages with typo suggestions

#### createEntityFromRecipe
Creates a single entity from a recipe definition with attributes.

```typescript
function createEntityFromRecipe(
  state: State,
  recipeName: string,
  attributes?: Record<string, XMLValue>
): number
```

**Parameters:**
- `state`: Game state
- `recipeName`: Name of the recipe (e.g., "entity", "static-part")
- `attributes`: Optional attributes to apply to the entity

**Returns:** Entity ID (number)

**Features:**
- Applies recipe component defaults
- Processes attribute shorthands
- Handles component property parsing
- Validates attribute names and values

#### fromEuler
Converts Euler angles (in radians) to a quaternion.

```typescript
function fromEuler(
  x: number,
  y: number,
  z: number
): { x: number, y: number, z: number, w: number }
```

**Parameters:**
- `x`, `y`, `z`: Euler angles in radians

**Returns:** Quaternion object with x, y, z, w components

### Types

#### EntityCreationResult
Result of entity creation with hierarchy information.

```typescript
interface EntityCreationResult {
  entity: number;        // Entity ID
  tagName: string;       // Recipe/element name
  children: EntityCreationResult[];  // Child entities
}
```

### Plugin

#### RecipePlugin
Core plugin that enables the recipe system.

```typescript
const RecipePlugin: Plugin = {
  components: {
    parent: Parent
  },
  recipes: [entityRecipe]
}
```

### Recipes

#### entityRecipe
Base recipe for generic entities without preset components.

```typescript
const entityRecipe: Recipe = {
  name: 'entity',
  components: []  // No default components
}
```

### Property Parsing

The plugin supports several property formats:

#### Single Values
```xml
<entity transform="scale: 2"></entity>
```

#### Vector3 Properties
```xml
<!-- Explicit x, y, z -->
<entity transform="pos: 0 5 -3"></entity>

<!-- Broadcast single value -->
<entity transform="scale: 2"></entity>  <!-- Becomes scale: 2 2 2 -->
```

#### Euler Angles
```xml
<!-- Degrees, automatically converted to quaternion -->
<entity transform="euler: 0 45 0"></entity>
<entity transform="rotation: 0 45 0"></entity>  <!-- Alias for euler -->
```

#### Component String Format
```xml
<!-- Multiple properties separated by semicolons -->
<entity transform="pos: 0 5 0; euler: 0 45 0; scale: 1.5"></entity>
```

#### Shorthand Attributes
```xml
<!-- These expand to component properties -->
<entity pos="0 5 0"></entity>  <!-- Expands to transform.pos -->
<entity color="0xff0000"></entity>  <!-- Expands to renderer.color -->
```

### Error Diagnostics

The plugin provides detailed error messages with suggestions:

- **Unknown elements**: Suggests similar recipe names
- **Unknown attributes**: Suggests similar attribute names or shorthands
- **Property errors**: Shows available properties for components
- **Syntax errors**: Explains expected format
- **Type mismatches**: Shows expected vs received types
- **Value count errors**: Indicates expected number of values

<!-- /LLM:REFERENCE -->

<!-- LLM:EXAMPLES -->
## Examples

### Basic Entity Creation

```xml
<!-- Create a basic entity with no components -->
<entity></entity>

<!-- Entity with transform component -->
<entity transform="pos: 0 5 0"></entity>

<!-- Entity with multiple components -->
<entity 
  transform="pos: 0 5 0; euler: 0 45 0"
  renderer="shape: box; color: 0xff0000"
/>
```

### Using Shorthands

```xml
<!-- Position shorthand expands to transform component -->
<entity pos="0 5 0"></entity>

<!-- Multiple shorthands -->
<entity 
  pos="0 5 0"
  euler="0 45 0"
  scale="2"
  color="0xff0000"
/>
```

### Parent-Child Hierarchies

```xml
<!-- Parent with children -->
<entity transform="pos: 0 0 0">
  <!-- Children inherit parent transform -->
  <entity transform="pos: 2 0 0"></entity>
  <entity transform="pos: -2 0 0"></entity>
</entity>

<!-- Nested hierarchy -->
<entity id="root" transform>
  <entity id="arm" transform="pos: 0 2 0">
    <entity id="hand" transform="pos: 0 2 0"></entity>
  </entity>
</entity>
```

### JavaScript API Usage

```typescript
import * as GAME from 'shalloteer';

// Create entity from recipe
const entity = GAME.createEntityFromRecipe(state, 'entity', {
  pos: '0 5 0',
  color: '0xff0000'
});

// Parse XML to entities
const xmlElement = {
  tagName: 'entity',
  attributes: { transform: 'pos: 0 5 0' },
  children: []
};
const results = GAME.parseXMLToEntities(state, xmlElement);

// Convert Euler to quaternion
const quat = GAME.fromEuler(0, Math.PI / 4, 0);  // 45 degrees on Y
```

### Error Handling

```typescript
import * as GAME from 'shalloteer';

try {
  // This will throw with helpful message
  GAME.createEntityFromRecipe(state, 'unkown-recipe', {});
} catch (error) {
  console.error(error.message);
  // Output: Unknown element <unkown-recipe> - did you mean <unknown-recipe>?
  // Available recipes: entity, static-part, dynamic-part...
}
```

### Custom Component Properties

```xml
<!-- Component with enum values -->
<entity body="type: dynamic"></entity>

<!-- Vector properties with broadcast -->
<entity transform="scale: 2"></entity>  <!-- All axes set to 2 -->

<!-- Quaternion (deprecated, use euler instead) -->
<entity transform="rot: 0 0 0 1"></entity>
```
<!-- /LLM:EXAMPLES -->