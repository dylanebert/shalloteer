# Rendering Reference

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