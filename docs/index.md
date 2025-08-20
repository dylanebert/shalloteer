# Shalloteer

> A vibe coding 3D game engine with declarative HTML-like syntax, ECS architecture, and game-ready features including physics, rendering, and player controls out of the box.

## Quick Start

```html
<script src="https://cdn.jsdelivr.net/npm/shalloteer@latest/dist/cdn/shalloteer.standalone.iife.js"></script>

<world canvas="#game-canvas" sky="0x87ceeb">
  <!-- Main Platform -->
  <static-part
    pos="0 -0.5 0"
    shape="box"
    size="20 1 20"
    color="0x90ee90"
  ></static-part>

  <!-- Ball -->
  <dynamic-part
    pos="-2 4 3"
    shape="sphere"
    size="1"
    color="0xff4500"
  ></dynamic-part>
</world>

<canvas id="game-canvas"></canvas>

<script>
  GAME.run();
</script>
```

## XML Structure Rules

**CRITICAL**: All declarative content MUST be enclosed in a `<world>` tag. Inside `<world>`, only entities and recipes are allowed. No scripts in XML.

### Minimal Example

```html
<world canvas="#game-canvas" sky="0x87ceeb">
  <!-- Ground -->
  <static-part pos="0 -0.5 0" shape="box" size="20 1 20" color="0x90ee90"></static-part>
  
  <!-- Ball -->
  <dynamic-part pos="-2 4 -3" shape="sphere" size="1" color="0xff4500"></dynamic-part>
</world>
```

## Core Concepts

### ECS Architecture
- **Entities**: Just IDs (numbers)
- **Components**: Pure data structures (no methods)
- **Systems**: Functions that operate on entities with specific components
- **NOT classes or objects** - data and logic are separated
- Built on bitECS for high-performance WASM-ready operations
- Familiar patterns from modern game engines

### Physics & Timing
- Physics simulates at fixed 60Hz (deterministic) via Rapier 3D WASM
- Rendering interpolates between physics steps for smoothness (Three.js)
- Physics bodies initialize on next fixed update after creation
- Body components override Transform for physics entities
- Fixed timestep ensures consistent gameplay across different frame rates

### Component Definition (bitECS style)
```typescript
import * as GAME from 'shalloteer';

const Health = GAME.defineComponent({
  current: GAME.Types.f32,
  max: GAME.Types.f32
});
```

### System Definition
```typescript
const DamageSystem: GAME.System = {
  update: (state) => {
    // Query entities with Health component
    const entities = state.query(Health);
    for (const entity of entities) {
      // Access component data via arrays
      Health.current[entity] -= 1 * state.time.delta;
    }
  }
};
```

## Common Recipes

Recipes are pre-configured entity templates:

- `<static-part>` - Non-moving physics objects
- `<dynamic-part>` - Physics objects affected by gravity
- `<kinematic-part>` - Script-controlled physics objects
- `<player>` - Character controller with orbit camera (auto-created if omitted)
- `<entity>` - Base entity, requires explicit components

### Entity with Components
```xml
<entity 
  transform="pos: 0 2 0"
  body="type: dynamic"
  collider="shape: sphere"
  renderer="color: 0xff0000"
/>
```

### CSS-style Shorthand
```xml
<!-- 'pos' expands to both transform and body -->
<entity pos="0 2 0" transform body collider renderer></entity>
```

## Transform Hierarchy

Children inherit parent transforms:

```xml
<entity pos="0 0 0" euler="0 45 0" transform renderer>
  <!-- Child at local position [2,0,0], rotated with parent -->
  <entity pos="2 0 0" transform renderer></entity>
</entity>
```

## Imperative Usage

Use the state API in systems:

```typescript
import * as GAME from 'shalloteer';

const Health = GAME.defineComponent({
  current: GAME.Types.f32,
  max: GAME.Types.f32
});

const MySystem: GAME.System = {
  setup: (state) => {
    // Get built-in components
    const Transform = state.getComponent('transform')!;
    
    // Create entity
    const entity = state.createEntity();
    
    // Add component with data
    state.addComponent(entity, Transform, {
      posX: 10, posY: 0, posZ: -5
    });
    
    // Query entities with both components
    const entities = state.query(Transform, Health);
    
    // Check/remove components
    if (state.hasComponent(entity, Health)) {
      state.removeComponent(entity, Health);
    }
    
    // Destroy entity
    state.destroyEntity(entity);
  }
};
```

### Physics Entity Movement

```typescript
// Dynamic bodies: Use forces and impulses
state.addComponent(entity, ApplyImpulse, { x: 0, y: 50, z: 0 }); // Jump
state.addComponent(entity, ApplyForce, { x: 10, y: 0, z: 0 }); // Push

// Kinematic bodies: Use movement components
state.addComponent(entity, KinematicMove, { x: 5, y: 2, z: 0 });

// Note: Never modify Transform directly for physics entities
```

## Custom Components

```html
<world>
  <!-- Custom component in XML -->
  <entity my-component="value: 10; speed: 5.5"></entity>
</world>
```

```typescript
import * as GAME from 'shalloteer';

// Define component
const MyComponent = GAME.defineComponent({
  value: GAME.Types.f32,
  speed: GAME.Types.f32
});

// Define system
const MySystem: GAME.System = {
  update: (state) => {
    const entities = state.query(MyComponent);
    for (const entity of entities) {
      MyComponent.value[entity] += MyComponent.speed[entity] * state.time.delta;
    }
  }
};

// Create plugin
const MyPlugin: GAME.Plugin = {
  components: { MyComponent },
  systems: [MySystem],
  config: {
    defaults: {
      "my-component": { value: 0, speed: 1 }
    }
  }
};

// Register and run
GAME.withPlugin(MyPlugin).run();
```

## Tweening

Animate any component property:

```xml
<kinematic-part pos="0 5 -5">
  <tween 
    target="body.pos-y" 
    from="5" 
    to="10" 
    duration="2" 
    ease="sine-in-out" 
    loop="ping-pong"
  />
</kinematic-part>
```

## Plugin System

Plugins bundle related functionality:

```typescript
import * as GAME from 'shalloteer';

GAME
  .withoutDefaultPlugins()
  .withPlugin(TransformsPlugin)
  .withPlugin(RenderingPlugin)
  .withPlugin(PhysicsPlugin)
  .run();
```

### Default Plugins
- **RecipePlugin** - XML parsing (required for declarative scenes)
- **TransformsPlugin** - Position, rotation, scale
- **RenderingPlugin** - Three.js rendering
- **PhysicsPlugin** - Rapier 3D physics
- **InputPlugin** - Keyboard, mouse, gamepad
- **TweenPlugin** - Animation tweening
- **OrbitCameraPlugin** - Orbital camera
- **PlayerPlugin** - Character controller

## State API

Available in all systems:

- `createEntity(): number` - Create entity
- `destroyEntity(entity: number)` - Destroy entity
- `addComponent(entity, Component, values?)` - Add component
- `removeComponent(entity, Component)` - Remove component
- `hasComponent(entity, Component): boolean` - Check component
- `query(...Components): number[]` - Get entities with components
- `time.delta: number` - Frame delta time
- `time.elapsed: number` - Total elapsed time

## Modules

### Core
Mathematical utilities for 3D transformations. Provides interpolation functions for smooth animations and transitions.

### Animation
Provides procedural character animation for player entities, automatically animating body parts based on movement states (walking, jumping, falling, landing). Creates a multi-part character model with head, torso, arms, and legs that respond to physics-based movement.

### Input
Unified input handling system that captures and normalizes mouse, keyboard, and gamepad events. Provides buffered action inputs with configurable grace periods for responsive gameplay controls.

### Orbit Camera
Orbital camera controller that smoothly orbits around a target entity in 3D space. Use for third-person views, character following, and cinematic camera movements.

### Physics
The Physics plugin provides 3D physics simulation using the Rapier physics engine. Use this plugin when you need realistic physics interactions including gravity, collisions, forces, and character controllers. It supports static objects (fixed), dynamic objects (affected by forces), and kinematic objects (script-controlled movement).

### Player
Provides a complete player character controller with physics-based movement, jumping mechanics, and orbit camera integration. Auto-creates a player entity if none exists in the scene.

### Recipes
The Recipes Plugin provides the foundation for declarative entity creation in Shalloteer. It parses XML elements into ECS entities with components, supports parent-child hierarchies, and enables A-frame style syntax with attribute shorthands. This plugin is essential for loading XML-based scenes and creating entities from recipes.

### Rendering
Three.js rendering pipeline for 3D visualization. Provides components for meshes, lights, and cameras, along with systems that automatically render entities to a WebGL canvas.

### Respawn
Automatic respawn system that resets entity position and state when they fall out of bounds. Included by default in player entities to handle falling off the world. Triggers when entities fall below Y=-100.

### Startup
Automatically creates essential game entities (player, camera, and lighting) at startup if they don't already exist. This ensures the game always has a playable state without requiring explicit setup.

### Transforms
Provides 3D transform components for position, rotation, and scale. Supports transform hierarchies with parent-child relationships and automatic world/local space conversions. Synchronizes between Euler angles and quaternions for rotation representation.

### Tweening
Smooth property animations with easing functions and loop modes. Animate any numeric component property over time using declarative XML tweens or programmatic API.

## API Reference

- [Core](https://dylanebert.github.io/shalloteer/reference/core)
- [Animation](https://dylanebert.github.io/shalloteer/reference/animation)
- [Input](https://dylanebert.github.io/shalloteer/reference/input)
- [Orbit Camera](https://dylanebert.github.io/shalloteer/reference/orbit-camera)
- [Physics](https://dylanebert.github.io/shalloteer/reference/physics)
- [Player](https://dylanebert.github.io/shalloteer/reference/player)
- [Recipes](https://dylanebert.github.io/shalloteer/reference/recipes)
- [Rendering](https://dylanebert.github.io/shalloteer/reference/rendering)
- [Respawn](https://dylanebert.github.io/shalloteer/reference/respawn)
- [Startup](https://dylanebert.github.io/shalloteer/reference/startup)
- [Transforms](https://dylanebert.github.io/shalloteer/reference/transforms)
- [Tweening](https://dylanebert.github.io/shalloteer/reference/tweening)

## Examples

- [Core](https://dylanebert.github.io/shalloteer/examples/core)
- [Animation](https://dylanebert.github.io/shalloteer/examples/animation)
- [Input](https://dylanebert.github.io/shalloteer/examples/input)
- [Orbit Camera](https://dylanebert.github.io/shalloteer/examples/orbit-camera)
- [Physics](https://dylanebert.github.io/shalloteer/examples/physics)
- [Player](https://dylanebert.github.io/shalloteer/examples/player)
- [Recipes](https://dylanebert.github.io/shalloteer/examples/recipes)
- [Rendering](https://dylanebert.github.io/shalloteer/examples/rendering)
- [Respawn](https://dylanebert.github.io/shalloteer/examples/respawn)
- [Startup](https://dylanebert.github.io/shalloteer/examples/startup)
- [Transforms](https://dylanebert.github.io/shalloteer/examples/transforms)
- [Tweening](https://dylanebert.github.io/shalloteer/examples/tweening)

## Installation (NPM)

```bash
npm install shalloteer
```

```typescript
import * as GAME from 'shalloteer';
GAME.run();
```

Alternatively, with CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/shalloteer@latest/dist/cdn/shalloteer.standalone.iife.js"></script>
<script>
  GAME.run();
</script>
```

## License

MIT
