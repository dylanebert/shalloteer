# Physics Plugin

Rapier 3D WASM physics integration for realistic rigid body dynamics, collisions, and character control.

<!-- LLM:OVERVIEW -->
The Physics plugin provides 3D physics simulation using the Rapier physics engine. Use this plugin when you need realistic physics interactions including gravity, collisions, forces, and character controllers. It supports static objects (fixed), dynamic objects (affected by forces), and kinematic objects (script-controlled movement).
<!-- /LLM:OVERVIEW -->

## Physics Behavior

### Transform Synchronization
- **Body position is authoritative**: For entities with a Body component, the physics position/rotation overwrites Transform values
- **One-way sync**: Body → Transform (never Transform → Body except via teleportation)
- **Initialization delay**: Rapier bodies aren't created until the next fixed update after entity creation

### Fixed Timestep Execution
- **Fixed update rate**: Physics runs at 60Hz (1/60 second intervals), not every frame
- **Variable execution**: May run 0-N times per frame depending on performance
  - High FPS (144Hz): Multiple frames between physics updates
  - Low FPS (30Hz): Multiple physics updates per frame
- **Interpolation**: InterpolatedTransform smooths visual movement between physics steps

### Example Timing
```
144 FPS: Frame--Frame--[Physics]--Frame--Frame--[Physics]
 30 FPS: Frame--[Physics][Physics]--Frame--[Physics][Physics]
```

## Layout

```
physics/
├── context.md  # This file
├── index.ts  # Public exports
├── plugin.ts  # Plugin definition
├── components.ts  # Physics components
├── systems.ts  # Physics systems
├── recipes.ts  # Pre-configured physics entities
└── utils.ts  # Physics utilities
```

## Scope

- **In-scope**: Rigid body physics, collision detection, character controllers, forces/impulses
- **Out-of-scope**: Soft body physics, fluids, particles, cloth simulation

## Entry Points

- **plugin.ts**: PhysicsPlugin definition with all systems and configuration
- **systems.ts**: Physics simulation systems
- **index.ts**: Public API exports including initializePhysics()

## Dependencies

- **Internal**: Core ECS, Transform components
- **External**: @dimforge/rapier3d-compat (WASM physics engine)

<!-- LLM:REFERENCE -->
## API Reference

### Exported Constants

- `DEFAULT_GRAVITY`: -60 (default world gravity)

### Enums

#### BodyType
```typescript
enum BodyType {
  Dynamic = 0,        // Affected by gravity and forces
  Fixed = 1,          // Immovable, static objects  
  KinematicPositionBased = 2, // Script-controlled position
  KinematicVelocityBased = 3  // Script-controlled velocity
}
```

#### ColliderShape
```typescript
enum ColliderShape {
  Box = 0,      // Rectangular box shape
  Sphere = 1,   // Spherical shape
  Capsule = 2   // Capsule (cylinder with hemispheres)
}
```

### Components

#### PhysicsWorld
Global physics world configuration.
```typescript
PhysicsWorld {
  gravityX: f32  // X-axis gravity (default: 0)
  gravityY: f32  // Y-axis gravity (default: -60)
  gravityZ: f32  // Z-axis gravity (default: 0)
}
```

#### Body
Rigid body physics properties.
```typescript
Body {
  // Configuration
  type: ui8           // BodyType enum (default: Fixed)
  mass: f32           // Mass in kg (default: 1)
  linearDamping: f32  // Linear velocity damping (default: 0)
  angularDamping: f32 // Angular velocity damping (default: 0)
  gravityScale: f32   // Gravity multiplier (default: 1)
  ccd: ui8           // Continuous collision detection (0/1, default: 0)
  lockRotX: ui8      // Lock X rotation (0/1, default: 0)
  lockRotY: ui8      // Lock Y rotation (0/1, default: 0)
  lockRotZ: ui8      // Lock Z rotation (0/1, default: 0)
  
  // Position
  posX: f32, posY: f32, posZ: f32
  
  // Rotation (quaternion)
  rotX: f32, rotY: f32, rotZ: f32, rotW: f32 (default: 1)
  
  // Rotation (euler angles in radians)
  eulerX: f32, eulerY: f32, eulerZ: f32
  
  // Velocity
  velX: f32, velY: f32, velZ: f32         // Linear velocity
  rotVelX: f32, rotVelY: f32, rotVelZ: f32 // Angular velocity
}
```

#### Collider
Collision shape and properties.
```typescript
Collider {
  // Shape
  shape: ui8     // ColliderShape enum (default: Box)
  sizeX: f32     // Box half-width (default: 1)
  sizeY: f32     // Box half-height (default: 1)
  sizeZ: f32     // Box half-depth (default: 1)
  radius: f32    // Sphere/capsule radius (default: 0.5)
  height: f32    // Capsule height (default: 1)
  
  // Physics properties
  friction: f32     // Surface friction (default: 0.5)
  restitution: f32  // Bounciness 0-1 (default: 0)
  density: f32      // Mass density (default: 1)
  isSensor: ui8     // Trigger-only collider (0/1, default: 0)
  
  // Collision filtering (bitmasks)
  membershipGroups: ui16  // This collider belongs to (default: 0xffff)
  filterGroups: ui16      // Can collide with (default: 0xffff)
  
  // Transform offset from body
  posOffsetX: f32, posOffsetY: f32, posOffsetZ: f32
  rotOffsetX: f32, rotOffsetY: f32, rotOffsetZ: f32, rotOffsetW: f32 (default: 1)
}
```

#### CharacterController
Character movement controller for player/NPC physics.
```typescript
CharacterController {
  // Configuration
  offset: f32         // Collision margin (default: 0.08)
  maxSlope: f32      // Max walkable slope in radians (default: 45°)
  maxSlide: f32      // Max sliding angle in radians (default: 30°)
  snapDist: f32      // Ground snap distance (default: 0.5)
  
  // Auto-stepping
  autoStep: ui8      // Enable auto-step (0/1, default: 1)
  maxStepHeight: f32 // Max step height (default: 0.3)
  minStepWidth: f32  // Min step width (default: 0.05)
  
  // Up direction
  upX: f32, upY: f32 (default: 1), upZ: f32
  
  // Movement output
  moveX: f32, moveY: f32, moveZ: f32  // Last frame movement
  grounded: ui8  // Is on ground (0/1)
}
```

#### CharacterMovement
Character velocity and movement state.
```typescript
CharacterMovement {
  desiredVelX: f32, desiredVelY: f32, desiredVelZ: f32  // Input velocity
  velocityY: f32      // Vertical velocity (gravity/jumping)
  actualMoveX: f32, actualMoveY: f32, actualMoveZ: f32  // Actual movement
}
```

#### InterpolatedTransform
Smooth rendering between physics steps.
```typescript
InterpolatedTransform {
  // Previous frame
  prevPosX: f32, prevPosY: f32, prevPosZ: f32
  prevRotX: f32, prevRotY: f32, prevRotZ: f32, prevRotW: f32
  
  // Current frame
  posX: f32, posY: f32, posZ: f32
  rotX: f32, rotY: f32, rotZ: f32, rotW: f32
}
```

#### Force/Impulse Components
Apply physics forces and impulses to dynamic bodies.
```typescript
ApplyForce { x: f32, y: f32, z: f32 }          // Continuous force
ApplyTorque { x: f32, y: f32, z: f32 }         // Rotational force
ApplyImpulse { x: f32, y: f32, z: f32 }        // Instant velocity change
ApplyAngularImpulse { x: f32, y: f32, z: f32 } // Instant rotation change
SetLinearVelocity { x: f32, y: f32, z: f32 }   // Set velocity directly
SetAngularVelocity { x: f32, y: f32, z: f32 }  // Set rotation speed
KinematicMove { x: f32, y: f32, z: f32 }       // Move kinematic body
KinematicRotate { x: f32, y: f32, z: f32, w: f32 } // Rotate kinematic body
```

#### Collision Events
```typescript
CollisionEvents {
  activeEvents: ui8  // Event types to detect
}

TouchedEvent {
  other: ui32     // Other entity ID
  handle1: ui32   // Collider handle 1
  handle2: ui32   // Collider handle 2  
}

TouchEndedEvent {
  other: ui32     // Other entity ID
  handle1: ui32   // Collider handle 1
  handle2: ui32   // Collider handle 2
}
```

### Systems

- **PhysicsWorldSystem**: Initializes the physics world with gravity
- **PhysicsInitializationSystem**: Creates rigid bodies and colliders for entities
- **CharacterMovementSystem**: Handles character controller movement and grounding
- **PhysicsCleanupSystem**: Removes physics bodies when entities are destroyed
- **CollisionEventCleanupSystem**: Clears collision events each frame
- **ApplyForcesSystem**: Applies continuous forces to dynamic bodies
- **ApplyTorquesSystem**: Applies rotational forces to dynamic bodies
- **ApplyImpulsesSystem**: Applies instant velocity changes
- **ApplyAngularImpulsesSystem**: Applies instant rotation changes
- **SetVelocitySystem**: Sets velocities directly on bodies
- **TeleportationSystem**: Instantly moves bodies to new positions
- **KinematicMovementSystem**: Moves kinematic bodies
- **PhysicsStepSystem**: Steps the physics simulation forward
- **PhysicsRapierSyncSystem**: Syncs Rapier physics to ECS components
- **PhysicsInterpolationSystem**: Interpolates positions for smooth rendering

### Functions

#### initializePhysics()
```typescript
async function initializePhysics(): Promise<void>
```
Initializes the Rapier WASM physics engine. Must be called before using physics.

### Recipes

Pre-configured entity templates for common physics objects:

- **static-part**: Immovable physics objects (walls, floors, platforms)
- **dynamic-part**: Physics objects affected by gravity (boxes, balls, debris)
- **kinematic-part**: Script-controlled physics objects (moving platforms, doors)

### Configuration

The plugin provides extensive configuration through defaults and enums:

#### Body Type Aliases
- `fixed`, `static` → BodyType.Fixed (0)
- `dynamic` → BodyType.Dynamic (1)
- `kinematic-position`, `kinematic-position-based` → BodyType.KinematicPositionBased (2)
- `kinematic`, `kinematic-velocity`, `kinematic-velocity-based` → BodyType.KinematicVelocityBased (3)

#### Collider Shape Aliases  
- `box`, `cuboid` → ColliderShape.Box (0)
- `sphere`, `ball` → ColliderShape.Sphere (1)
- `capsule` → ColliderShape.Capsule (2)
<!-- /LLM:REFERENCE -->

<!-- LLM:EXAMPLES -->
## Examples

### Basic Usage

#### XML Recipes

##### Static Floor
```xml
<static-part
  pos="0 -0.5 0"
  shape="box"
  size="20 1 20"
  color="0x90ee90"
/>
```

##### Dynamic Ball
```xml
<dynamic-part
  pos="0 5 0"
  shape="sphere"
  radius="0.5"
  color="0xff0000"
  mass="2"
  restitution="0.8"
/>
```

##### Moving Platform
```xml
<kinematic-part
  pos="0 2 0"
  shape="box"
  size="3 0.2 3"
  color="0x4169e1"
>
  <!-- Add movement with tweening -->
  <tween
    target="body.pos-y"
    from="2"
    to="5"
    duration="3"
    ease="sine-in-out"
    loop="ping-pong"
  />
</kinematic-part>
```

##### Character with Controller
```xml
<entity
  pos="0 1 0"
  body="type: kinematic-position"
  collider="shape: capsule; height: 1.8; radius: 0.4"
  character-controller
  character-movement
  transform
  renderer
/>
```

#### JavaScript API

##### Create Physics Entity
```typescript
import * as GAME from 'shalloteer';

// Create a dynamic physics box
const entity = state.createEntity();

state.addComponent(entity, GAME.Body, {
  type: GAME.BodyType.Dynamic,
  mass: 5,
  posX: 0, posY: 10, posZ: 0
});

state.addComponent(entity, GAME.Collider, {
  shape: GAME.ColliderShape.Box,
  sizeX: 1, sizeY: 1, sizeZ: 1,
  friction: 0.7,
  restitution: 0.3
});

// Note: Physics body won't exist until next fixed update
// Transform will be overwritten by Body position after initialization
```

##### Moving Physics Bodies

```typescript
import * as GAME from 'shalloteer';

// Dynamic bodies - Use forces/impulses for movement
if (GAME.Body.type[entity] === GAME.BodyType.Dynamic) {
  // Apply force for gradual acceleration
  state.addComponent(entity, GAME.ApplyForce, { x: 10, y: 0, z: 0 });
  
  // Apply impulse for instant velocity change
  state.addComponent(entity, GAME.ApplyImpulse, { x: 0, y: 50, z: 0 });
  
  // Direct position setting only for teleportation
  GAME.Body.posX[entity] = 10; // Teleport - use sparingly
}

// Kinematic bodies - Direct control via movement components
if (GAME.Body.type[entity] === GAME.BodyType.KinematicPositionBased) {
  state.addComponent(entity, GAME.KinematicMove, { x: 5, y: 2, z: 0 });
}

if (GAME.Body.type[entity] === GAME.BodyType.KinematicVelocityBased) {
  state.addComponent(entity, GAME.SetLinearVelocity, { x: 3, y: 0, z: 0 });
}

// Never modify Transform directly for physics entities
// GAME.Transform.posX[entity] = 10; // ❌ Will be overwritten by Body
```

##### Apply Forces
```typescript
import * as GAME from 'shalloteer';

// Apply upward impulse (jump)
state.addComponent(entity, GAME.ApplyImpulse, {
  x: 0, y: 50, z: 0
});

// Apply continuous force
state.addComponent(entity, GAME.ApplyForce, {
  x: 10, y: 0, z: 0
});

// Set velocity directly
state.addComponent(entity, GAME.SetLinearVelocity, {
  x: 0, y: 5, z: 0
});
```

##### Handle Collisions
```typescript
import * as GAME from 'shalloteer';

const CollisionSystem: GAME.System = {
  update: (state) => {
    // Query entities with collision events
    for (const entity of state.query(GAME.TouchedEvent)) {
      const otherEntity = GAME.TouchedEvent.other[entity];
      console.log(`Entity ${entity} collided with ${otherEntity}`);
      
      // React to collision
      state.addComponent(entity, GAME.ApplyImpulse, {
        x: 0, y: 10, z: 0
      });
    }
  }
};
```

##### Character Movement
```typescript
import * as GAME from 'shalloteer';

const PlayerMovementSystem: GAME.System = {
  update: (state) => {
    for (const entity of state.query(GAME.CharacterMovement, GAME.CharacterController)) {
      // Set desired movement based on input
      GAME.CharacterMovement.desiredVelX[entity] = input.x * 5;
      GAME.CharacterMovement.desiredVelZ[entity] = input.z * 5;
      
      // Jump if grounded
      if (GAME.CharacterController.grounded[entity] && input.jump) {
        GAME.CharacterMovement.velocityY[entity] = 10;
      }
    }
  }
};
```

##### Custom Plugin Integration
```typescript
import * as GAME from 'shalloteer';

// Initialize physics before running
await GAME.initializePhysics();

// Use with builder
GAME
  .withPlugin(GAME.PhysicsPlugin)
  .run();
```
<!-- /LLM:EXAMPLES -->
