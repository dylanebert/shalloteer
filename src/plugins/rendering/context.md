# Rendering Plugin

<!-- LLM:OVERVIEW -->
Three.js rendering pipeline for 3D visualization. Provides components for meshes, lights, and cameras, along with systems that automatically render entities to a WebGL canvas.
<!-- /LLM:OVERVIEW -->

## Layout

```
rendering/
├── context.md  # This file
├── index.ts  # Public exports
├── plugin.ts  # Plugin definition
├── components.ts  # Rendering components
├── systems.ts  # Rendering systems
├── operations.ts  # Mesh and shadow operations
├── utils.ts  # Canvas and context utilities
├── constants.ts  # Default values
└── recipes.ts  # Light recipes
```

## Scope

- **In-scope**: Three.js rendering, mesh management, lighting, camera sync
- **Out-of-scope**: Physics visualization, UI overlays

## Entry Points

- **plugin.ts**: RenderingPlugin bundles all components, systems, and recipes
- **systems.ts**: Rendering systems executed each frame
- **index.ts**: Public API exports

## Dependencies

- **Internal**: Transforms plugin (WorldTransform component)
- **External**: Three.js

<!-- LLM:REFERENCE -->
## API Reference

### Components

#### Renderer
Main rendering component for visual entities.

```javascript
Renderer: {
  shape: ui8,       // Shape type (0=box, 1=sphere, 2=cylinder, 3=plane)
  sizeX: f32,       // X-axis scale multiplier (default: 1)
  sizeY: f32,       // Y-axis scale multiplier (default: 1)
  sizeZ: f32,       // Z-axis scale multiplier (default: 1)
  color: ui32,      // Hex color value (default: 0xffffff)
  visible: ui8      // Visibility flag (0=hidden, 1=visible, default: 1)
}
```

#### RenderContext
Global rendering context (typically one per world).

```javascript
RenderContext: {
  clearColor: ui32,  // Background color (default: 0x000000)
  hasCanvas: ui8     // Canvas attached flag
}
```

#### MainCamera
Tag component marking an entity as the active camera.

```javascript
MainCamera: {}  // No properties - tag component
```

#### Ambient
Hemisphere light for ambient lighting.

```javascript
Ambient: {
  skyColor: ui32,     // Sky hemisphere color (default: 0x87ceeb)
  groundColor: ui32,  // Ground hemisphere color (default: 0x4a4a4a)
  intensity: f32      // Light intensity (default: 0.6)
}
```

#### Directional
Directional light with shadow support.

```javascript
Directional: {
  color: ui32,         // Light color (default: 0xffffff)
  intensity: f32,      // Light intensity (default: 1)
  castShadow: ui8,     // Enable shadows (0=off, 1=on, default: 1)
  shadowMapSize: ui32, // Shadow map resolution (default: 4096)
  directionX: f32,     // Light direction X (default: -1)
  directionY: f32,     // Light direction Y (default: 2)
  directionZ: f32,     // Light direction Z (default: -1)
  distance: f32        // Distance from target (default: 30)
}
```

### Systems

#### MeshInstanceSystem
Creates and updates Three.js instanced meshes for entities with Renderer component.
- **Group**: draw
- **Purpose**: Synchronizes entity transforms with Three.js mesh instances
- **Query**: Entities with Renderer component

#### LightSyncSystem
Updates Three.js lights based on Ambient and Directional components.
- **Group**: draw
- **Purpose**: Synchronizes lighting components with Three.js scene lights
- **Query**: Entities with Ambient or Directional components

#### CameraSyncSystem
Synchronizes camera entity transforms with Three.js PerspectiveCamera.
- **Group**: draw
- **Purpose**: Updates Three.js camera position and rotation
- **Query**: Entities with MainCamera and WorldTransform

#### WebGLRenderSystem
Main rendering system that renders the scene to canvas.
- **Group**: draw
- **Last**: true (runs after all other draw systems)
- **Purpose**: Renders the Three.js scene using WebGLRenderer
- **Setup**: Initializes renderer and canvas
- **Dispose**: Cleans up renderer resources

### Functions

#### setCanvasElement(entity: number, canvas: HTMLCanvasElement): void
Associates a canvas element with a RenderContext entity for rendering.

### Constants

#### AMBIENT_DEFAULTS
Default values for ambient lighting:
```javascript
{
  skyColor: 0x87ceeb,
  groundColor: 0x4a4a4a,
  intensity: 0.6
}
```

#### DIRECTIONAL_DEFAULTS
Default values for directional lighting:
```javascript
{
  color: 0xffffff,
  intensity: 1,
  castShadow: 1,
  shadowMapSize: 4096,
  directionX: -1,
  directionY: 2,
  directionZ: -1,
  distance: 30
}
```

### Recipes

#### ambient-light
Creates an entity with ambient hemisphere lighting.
- **Components**: ambient
- **Defaults**: Uses AMBIENT_DEFAULTS

#### directional-light
Creates an entity with directional lighting and shadows.
- **Components**: directional
- **Defaults**: Uses DIRECTIONAL_DEFAULTS

#### light
Creates an entity with both ambient and directional lighting.
- **Components**: ambient, directional
- **Defaults**: Uses both AMBIENT_DEFAULTS and DIRECTIONAL_DEFAULTS
<!-- /LLM:REFERENCE -->

<!-- LLM:EXAMPLES -->
## Examples

### Basic Rendering Setup

```xml
<!-- Declarative scene with lighting and rendered objects -->
<world canvas="#game-canvas" sky="0x87ceeb">
  <!-- Default lighting -->
  <light></light>
  
  <!-- Rendered box -->
  <entity 
    transform
    renderer="shape: box; color: 0xff0000; size-x: 2"
    pos="0 1 0"
  />
  
  <!-- Rendered sphere -->
  <entity
    transform
    renderer="shape: sphere; color: 0x00ff00"
    pos="3 1 0"
  />
</world>
```

### Custom Lighting

```xml
<!-- Separate ambient and directional lights -->
<ambient-light 
  sky-color="0xffd4a3"
  ground-color="0x808080"
  intensity="0.4"
/>

<directional-light
  color="0xffffff"
  intensity="1.5"
  direction-x="-1"
  direction-y="3"
  direction-z="-0.5"
  cast-shadow="1"
  shadow-map-size="2048"
/>
```

### Imperative Usage

```typescript
import * as GAME from 'shalloteer';

// Create rendered entity programmatically
const entity = state.createEntity();

// Add transform for positioning
state.addComponent(entity, GAME.Transform, {
  posX: 0, posY: 5, posZ: 0
});

// Add renderer component
state.addComponent(entity, GAME.Renderer, {
  shape: 1,        // sphere
  sizeX: 2,
  sizeY: 2,
  sizeZ: 2,
  color: 0xff00ff,
  visible: 1
});

// Set canvas for rendering context
const contextEntity = state.query(GAME.RenderContext)[0];
const canvas = document.getElementById('game-canvas');
GAME.setCanvasElement(contextEntity, canvas);
```

### Shape Types

```typescript
import * as GAME from 'shalloteer';

// Available shape enums
const shapes = {
  box: 0,
  sphere: 1,
  cylinder: 2,
  plane: 3
};

// Use in XML
<entity renderer="shape: sphere"></entity>

// Or with enum names
<entity renderer="shape: 1"></entity>
```

### Visibility Control

```typescript
import * as GAME from 'shalloteer';

// Hide/show entities
GAME.Renderer.visible[entity] = 0; // Hide
GAME.Renderer.visible[entity] = 1; // Show

// In XML
<entity renderer="visible: 0"></entity>  <!-- Initially hidden -->
```
<!-- /LLM:EXAMPLES -->