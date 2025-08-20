# Player Reference

## API Reference

### Components

#### Player
Player controller configuration and state.

**Properties:**
- `speed: f32` - Movement speed (default: 5.3)
- `jumpHeight: f32` - Jump height in units (default: 2.3)
- `rotationSpeed: f32` - Turn speed in radians/second (default: 10)
- `canJump: ui8` - Whether player can jump (default: 1)
- `isJumping: ui8` - Currently jumping state (default: 0)
- `jumpCooldown: f32` - Jump cooldown timer (default: 0)
- `lastGroundedTime: f32` - Timestamp when last grounded (default: 0)
- `jumpBufferTime: f32` - Jump input buffer timestamp (default: -10000)
- `cameraSensitivity: f32` - Camera rotation sensitivity (default: 0.007)
- `cameraZoomSensitivity: f32` - Camera zoom sensitivity (default: 1.5)
- `cameraEntity: eid` - Linked camera entity ID (default: 0)

### Systems

#### PlayerMovementSystem
Handles player movement, rotation, and jumping based on input.
- **Group**: `fixed`
- **Queries**: Player, CharacterMovement, Transform, Body, InputState
- **Behavior**: Processes input, applies movement forces, handles jump mechanics, updates rotation

#### PlayerGroundedSystem
Tracks grounded state and manages jump availability.
- **Group**: `fixed`
- **Before**: PlayerMovementSystem
- **Queries**: Player, CharacterMovement, CharacterController, InputState, Body
- **Behavior**: Updates grounded state, resets jump ability when landing

#### PlayerCameraLinkingSystem
Automatically links player to orbit camera.
- **Group**: `simulation`
- **Queries**: Player, OrbitCamera
- **Behavior**: Links first player to first camera if not already linked

#### PlayerCameraControlSystem
Handles camera control through player input.
- **Group**: `simulation`
- **After**: PlayerCameraLinkingSystem
- **Queries**: Player, InputState
- **Behavior**: Controls camera yaw/pitch with mouse, zoom with scroll

### Recipes

#### playerRecipe
Complete player entity configuration.

**Components included:**
- `player` - Player controller
- `character-movement` - Movement state
- `transform` - Position/rotation
- `world-transform` - World space transform
- `body` - Physics body (kinematic)
- `collider` - Capsule collider
- `character-controller` - Rapier character controller
- `input-state` - Input handling
- `respawn` - Respawn position

**Default overrides:**
- Body type: Kinematic position-based
- Collider shape: Capsule (radius: 0.3, height: 0.9)
- Rotation locked on X and Z axes
- Continuous collision detection enabled

### Constants

#### PLAYER_DEFAULTS
Default values for Player component:
```javascript
{
  speed: 5.3,
  jumpHeight: 2.3,
  rotationSpeed: 10,
  canJump: 1,
  isJumping: 0,
  jumpCooldown: 0,
  lastGroundedTime: 0,
  jumpBufferTime: -10000,
  cameraSensitivity: 0.007,
  cameraZoomSensitivity: 1.5,
  cameraEntity: 0
}
```

#### CHARACTER_MOVEMENT_DEFAULTS
Default movement velocities (all zero).

#### PLAYER_TRANSFORM_DEFAULTS
Default transform values (origin position, identity rotation, unit scale).

#### PLAYER_BODY_DEFAULTS
Physics body configuration for player (kinematic, rotation locked).

#### PLAYER_COLLIDER_DEFAULTS
Capsule collider configuration (radius: 0.3, height: 0.9, offset Y: 0.75).

#### PLAYER_CHARACTER_CONTROLLER_DEFAULTS
Character controller settings (auto-step, slope handling).

#### PLAYER_INPUT_DEFAULTS
Default input state (all inputs zero/inactive).

#### PLAYER_RESPAWN_DEFAULTS
Default spawn position (origin).

### Utility Functions

#### processInput(moveForward, moveRight, cameraYaw)
Converts input to world-space movement vector.
- **Parameters**: 
  - `moveForward: number` - Forward/backward input (-1 to 1)
  - `moveRight: number` - Left/right input (-1 to 1)
  - `cameraYaw: number` - Camera yaw rotation
- **Returns**: `THREE.Vector3` - World-space movement direction

#### handleJump(entity, jumpPressed, currentTime)
Processes jump input with buffering and coyote time.
- **Parameters**:
  - `entity: number` - Player entity ID
  - `jumpPressed: number` - Jump input state (0 or 1)
  - `currentTime: number` - Current time in milliseconds
- **Returns**: `number` - Jump velocity to apply (0 if not jumping)

#### updateRotation(entity, inputVector, deltaTime, rotationData)
Smooth rotation towards movement direction.
- **Parameters**:
  - `entity: number` - Player entity ID
  - `inputVector: THREE.Vector3` - Movement direction
  - `deltaTime: number` - Fixed timestep
  - `rotationData: object` - Current quaternion rotation
- **Returns**: `object` - New quaternion rotation {x, y, z, w}