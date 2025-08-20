# Transforms Plugin

<!-- LLM:OVERVIEW -->
Provides 3D transform components for position, rotation, and scale. Supports transform hierarchies with parent-child relationships and automatic world/local space conversions. Synchronizes between Euler angles and quaternions for rotation representation.
<!-- /LLM:OVERVIEW -->

## Layout

```
transforms/
├── context.md  # This file
├── index.ts  # Public exports
├── plugin.ts  # Plugin definition
├── components.ts  # Transform and WorldTransform components
├── systems.ts  # TransformHierarchySystem
└── utils.ts  # Transform conversion utilities
```

## Scope

- **In-scope**: 3D transforms, hierarchies, world/local space conversion, euler/quaternion sync
- **Out-of-scope**: Physics transforms, animations, tweening

## Entry Points

- **plugin.ts**: TransformsPlugin definition
- **systems.ts**: Transform hierarchy updates in simulation phase
- **components.ts**: Core transform components (Transform, WorldTransform)

## Dependencies

- **Internal**: Core ECS, Parent component from recipes
- **External**: Three.js math (Matrix4, Vector3, Quaternion, Euler)

<!-- LLM:REFERENCE -->
## API Reference

### Components

#### Transform
Local transform component with position, rotation (both quaternion and Euler), and scale.

**Properties:**
- `posX: f32` - Position X coordinate (default: 0)
- `posY: f32` - Position Y coordinate (default: 0) 
- `posZ: f32` - Position Z coordinate (default: 0)
- `rotX: f32` - Rotation quaternion X component (default: 0)
- `rotY: f32` - Rotation quaternion Y component (default: 0)
- `rotZ: f32` - Rotation quaternion Z component (default: 0)
- `rotW: f32` - Rotation quaternion W component (default: 1)
- `eulerX: f32` - Euler rotation X in degrees (default: 0)
- `eulerY: f32` - Euler rotation Y in degrees (default: 0)
- `eulerZ: f32` - Euler rotation Z in degrees (default: 0)
- `scaleX: f32` - Scale X factor (default: 1)
- `scaleY: f32` - Scale Y factor (default: 1)
- `scaleZ: f32` - Scale Z factor (default: 1)

**XML Attributes:**
- `transform` - Accepts pos, euler, and scale sub-properties
- Default values: rotW=1, scaleX=1, scaleY=1, scaleZ=1

#### WorldTransform
Computed world-space transform (read-only). Automatically added to entities with Transform component.

**Properties:**
- Same as Transform component
- Represents world-space values after parent hierarchy is applied
- Should not be set directly in XML (validation warning provided)

### Systems

#### TransformHierarchySystem
Updates transform hierarchies and synchronizes rotation representations.

**Behavior:**
1. Synchronizes quaternion values from euler angles for all Transform entities
2. Creates WorldTransform component for entities with Transform
3. Copies local transform to world transform for root entities (no Parent)
4. Computes world transform by multiplying parent and local matrices for child entities
5. Synchronizes euler angles from quaternions for world transforms

**Update Phase:** `simulation` (last system in phase)

### Functions

#### eulerToQuaternion(x, y, z)
Converts Euler angles (in degrees) to quaternion representation.

**Parameters:**
- `x: number` - X rotation in degrees
- `y: number` - Y rotation in degrees  
- `z: number` - Z rotation in degrees

**Returns:** `{ x, y, z, w }` - Quaternion components

#### quaternionToEuler(x, y, z, w)
Converts quaternion to Euler angles (in degrees).

**Parameters:**
- `x: number` - Quaternion X component
- `y: number` - Quaternion Y component
- `z: number` - Quaternion Z component
- `w: number` - Quaternion W component

**Returns:** `{ x, y, z }` - Euler angles in degrees

#### syncEulerFromQuaternion(transform, entity)
Updates euler angle values from quaternion values on a transform component.

**Parameters:**
- `transform: TransformComponent` - Transform or WorldTransform component
- `entity: number` - Entity ID

#### syncQuaternionFromEuler(transform, entity)
Updates quaternion values from euler angle values on a transform component.

**Parameters:**
- `transform: TransformComponent` - Transform or WorldTransform component
- `entity: number` - Entity ID
<!-- /LLM:REFERENCE -->

<!-- LLM:EXAMPLES -->
## Examples

### Basic Usage

#### XML Position and Rotation
```xml
<!-- Position only -->
<entity transform="pos: 0 5 -3"></entity>

<!-- Euler rotation (degrees) -->
<entity transform="euler: 0 45 0"></entity>

<!-- Scale (single value applies to all axes) -->
<entity transform="scale: 2"></entity>

<!-- Combined transform -->
<entity transform="pos: 0 5 0; euler: 0 45 0; scale: 1.5"></entity>
```

#### JavaScript API
```typescript
import * as GAME from 'shalloteer';

// In a system
const MySystem = {
  update: (state) => {
    const entity = state.createEntity();
    
    // Add transform component
    state.addComponent(entity, GAME.Transform, {
      posX: 10, posY: 5, posZ: -3,
      scaleX: 2, scaleY: 2, scaleZ: 2
    });
    
    // Set rotation using euler angles
    const quat = GAME.eulerToQuaternion(0, 45, 0);
    GAME.Transform.rotX[entity] = quat.x;
    GAME.Transform.rotY[entity] = quat.y;
    GAME.Transform.rotZ[entity] = quat.z;
    GAME.Transform.rotW[entity] = quat.w;
  }
};
```

### Transform Hierarchy

#### Parent-Child Relationships
```xml
<!-- Parent at origin -->
<entity transform="pos: 0 0 0">
  <!-- Children positioned relative to parent -->
  <entity transform="pos: 2 0 0"></entity>
  <entity transform="pos: -2 0 0"></entity>
</entity>

<!-- Rotating parent affects all children -->
<entity transform="euler: 0 45 0">
  <entity id="arm" transform="pos: 0 2 0">
    <entity id="hand" transform="pos: 0 2 0"></entity>
  </entity>
</entity>
```

#### Accessing World Transform
```typescript
import * as GAME from 'shalloteer';

const WorldTransformSystem = {
  update: (state) => {
    // Query entities with both transforms
    const entities = state.query(GAME.Transform, GAME.WorldTransform);
    
    for (const entity of entities) {
      // Local position
      const localX = GAME.Transform.posX[entity];
      
      // World position (after parent transforms)
      const worldX = GAME.WorldTransform.posX[entity];
      
      console.log(`Local: ${localX}, World: ${worldX}`);
    }
  }
};
```

### Common Patterns

#### Setting Transform Values
```typescript
import * as GAME from 'shalloteer';

// Direct property access (bitECS style)
GAME.Transform.posX[entity] = 10;
GAME.Transform.posY[entity] = 5;
GAME.Transform.posZ[entity] = -3;

// Using euler angles for rotation
GAME.Transform.eulerX[entity] = 0;
GAME.Transform.eulerY[entity] = 45;
GAME.Transform.eulerZ[entity] = 0;
// Quaternion will be auto-synced by TransformHierarchySystem

// Uniform scale
GAME.Transform.scaleX[entity] = 2;
GAME.Transform.scaleY[entity] = 2;
GAME.Transform.scaleZ[entity] = 2;
```

#### Transform Interpolation
```typescript
import * as GAME from 'shalloteer';

// Interpolate between two positions
const t = 0.5; // 50% between start and end
GAME.Transform.posX[entity] = startX + (endX - startX) * t;
GAME.Transform.posY[entity] = startY + (endY - startY) * t;
GAME.Transform.posZ[entity] = startZ + (endZ - startZ) * t;
```
<!-- /LLM:EXAMPLES -->