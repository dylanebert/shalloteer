# Orbit Camera Plugin

<!-- LLM:OVERVIEW -->
Orbital camera controller that smoothly orbits around a target entity in 3D space. Use for third-person views, character following, and cinematic camera movements.
<!-- /LLM:OVERVIEW -->

## Purpose

- Orbital camera movement around target
- Smooth camera interpolation
- Mouse/touch orbit controls
- Zoom and pan support

## Layout

```
orbit-camera/
├── context.md  # This file
├── index.ts  # Public exports
├── plugin.ts  # Plugin definition
├── components.ts  # OrbitCamera component
├── systems.ts  # OrbitCameraSystem
├── recipes.ts  # Camera recipes
├── operations.ts  # Camera operations
├── constants.ts  # Camera constants
└── math.ts  # Camera math utilities
```

## Scope

- **In-scope**: Orbital camera controls, smooth following
- **Out-of-scope**: First-person camera, fixed cameras

## Entry Points

- **plugin.ts**: OrbitCameraPlugin definition
- **systems.ts**: OrbitCameraSystem for updates
- **recipes.ts**: orbitCamera recipe

## Dependencies

- **Internal**: Core ECS, input, transforms
- **External**: Three.js Camera

## Components

- **OrbitCamera**: Camera configuration and state

## Systems

- **OrbitCameraSystem**: Updates camera position/rotation

## Recipes

- **orbitCamera**: Default orbital camera setup

<!-- LLM:REFERENCE -->
## API Reference

### Components

#### OrbitCamera

Controls orbital camera behavior around a target entity.

**Properties:**
- `target` (eid, default: 0) - Entity ID to orbit around
- `current-yaw` (f32, default: π) - Current horizontal rotation angle in radians
- `current-pitch` (f32, default: π/6) - Current vertical rotation angle in radians  
- `current-distance` (f32, default: 4) - Current distance from target
- `target-yaw` (f32, default: π) - Target horizontal rotation angle
- `target-pitch` (f32, default: π/6) - Target vertical rotation angle
- `target-distance` (f32, default: 4) - Target distance from target
- `min-distance` (f32, default: 1) - Minimum allowed distance
- `max-distance` (f32, default: 25) - Maximum allowed distance
- `min-pitch` (f32, default: 0) - Minimum pitch angle (looking down)
- `max-pitch` (f32, default: π/2) - Maximum pitch angle (looking up)
- `smoothness` (f32, default: 0.5) - Interpolation speed (0-1)
- `offset-x` (f32, default: 0) - X offset from target position
- `offset-y` (f32, default: 1.25) - Y offset from target position
- `offset-z` (f32, default: 0) - Z offset from target position

### Systems

#### OrbitCameraSystem

**Group:** `draw`

Updates camera position and rotation each frame:
- Smoothly interpolates current values toward target values
- Calculates camera position based on yaw, pitch, and distance
- Points camera at target entity with applied offsets
- Respects min/max constraints for distance and pitch

### Recipes

#### camera

Creates an orbital camera entity with default settings.

**Components added:**
- `orbit-camera` - Orbital camera controls
- `transform` - Position and rotation
- `world-transform` - World space transform
- `main-camera` - Marks as main camera

**Default overrides:**
- `transform.pos-y`: 8
- `transform.pos-z`: 10
<!-- /LLM:REFERENCE -->

<!-- LLM:EXAMPLES -->
## Examples

### Basic Camera

```xml
<!-- Create default orbital camera -->
<camera />
```

### Camera Following Player

```xml
<world>
  <!-- Player entity -->
  <player id="player" pos="0 0 0" />
  
  <!-- Camera following player -->
  <camera 
    target="#player"
    target-distance="10"
    min-distance="5"
    max-distance="20"
    offset-y="2"
  />
</world>
```

### Custom Orbit Settings

```xml
<entity 
  orbit-camera="
    target: #boss;
    target-distance: 15;
    target-yaw: 0;
    target-pitch: 0.5;
    smoothness: 0.2;
    offset-y: 3
  "
  transform
  main-camera
/>
```

### Programmatic Usage

```typescript
import * as GAME from 'shalloteer';

const CameraControlSystem = {
  update: (state) => {
    const cameras = state.query(GAME.OrbitCamera);
    
    for (const camera of cameras) {
      // Rotate camera on input
      if (state.input.mouse.deltaX) {
        GAME.OrbitCamera.targetYaw[camera] += state.input.mouse.deltaX * 0.01;
      }
      
      // Zoom on scroll
      if (state.input.mouse.wheel) {
        GAME.OrbitCamera.targetDistance[camera] = Math.max(
          GAME.OrbitCamera.minDistance[camera],
          Math.min(
            GAME.OrbitCamera.maxDistance[camera],
            GAME.OrbitCamera.targetDistance[camera] - state.input.mouse.wheel * 0.5
          )
        );
      }
    }
  }
};
```

### Dynamic Target Switching

```typescript
import * as GAME from 'shalloteer';

// Switch camera target
const switchTarget = (state, cameraEntity, newTargetEntity) => {
  GAME.OrbitCamera.target[cameraEntity] = newTargetEntity;
};
```
<!-- /LLM:EXAMPLES -->