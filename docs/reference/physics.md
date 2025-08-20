# Physics Reference

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