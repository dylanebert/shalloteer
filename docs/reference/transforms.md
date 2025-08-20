# Transforms Reference

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