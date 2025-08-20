# Recipes Reference

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