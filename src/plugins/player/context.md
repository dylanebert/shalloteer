# Player Plugin

Character controller for player movement

<!-- LLM:OVERVIEW -->
Provides a complete player character controller with physics-based movement, jumping mechanics, and orbit camera integration. Auto-creates a player entity if none exists in the scene.
<!-- /LLM:OVERVIEW -->

## Purpose

- Player character movement and physics
- Jump, walk, run mechanics
- Input-driven character control
- Camera target for orbit camera

## Layout

```
player/
├── context.md  # This file
├── index.ts  # Public exports
├── plugin.ts  # Plugin definition
├── components.ts  # Player, Jumper components
├── systems.ts  # PlayerMovementSystem
├── recipes.ts  # Player recipes
├── utils.ts  # Movement utilities
└── constants.ts  # Movement constants
```

## Scope

- **In-scope**: Player movement, jumping, input handling
- **Out-of-scope**: AI characters, NPCs

## Entry Points

- **plugin.ts**: PlayerPlugin definition
- **systems.ts**: PlayerMovementSystem
- **recipes.ts**: player recipe

## Dependencies

- **Internal**: Physics, input, transforms
- **External**: Rapier character controller

## Components

- **Player**: Player marker and config
- **Jumper**: Jump state and configuration

## Systems

- **PlayerMovementSystem**: Input to movement

## Recipes

- **player**: Complete player setup with physics

<!-- LLM:REFERENCE -->
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
<!-- /LLM:REFERENCE -->

<!-- LLM:EXAMPLES -->
## Examples

### Basic Player Usage (XML)

```xml
<world>
  <!-- Player auto-created if not specified -->
  <player pos="0 2 0" speed="6" jump-height="3" />
</world>
```

### Custom Player Configuration (XML)

```xml
<world>
  <player 
    pos="5 1 -10"
    speed="8"
    jump-height="4"
    rotation-speed="15"
    camera-sensitivity="0.005"
  />
</world>
```

### Accessing Player Component (JavaScript)

```typescript
import * as GAME from 'shalloteer';

const MySystem: GAME.System = {
  update: (state) => {
    const players = state.query(GAME.Player);
    for (const entity of players) {
      // Check if player is jumping
      if (GAME.Player.isJumping[entity]) {
        console.log('Player is airborne!');
      }
      
      // Modify player speed
      GAME.Player.speed[entity] = 10;
    }
  }
};
```

### Creating Player Programmatically

```typescript
import * as GAME from 'shalloteer';

const PlayerSpawnSystem: GAME.System = {
  setup: (state) => {
    // Create player entity
    const player = state.createEntity();
    
    // Add player recipe components
    state.addComponent(player, GAME.Player, {
      speed: 7,
      jumpHeight: 3.5,
      cameraSensitivity: 0.01
    });
    
    // Add required components
    state.addComponent(player, GAME.Transform, { posY: 5 });
    state.addComponent(player, GAME.Body, { type: GAME.BodyType.KinematicPositionBased });
    state.addComponent(player, GAME.CharacterController);
    state.addComponent(player, GAME.InputState);
  }
};
```

### Movement Controls

**Keyboard:**
- W/S or Arrow Up/Down - Move forward/backward
- A/D or Arrow Left/Right - Move left/right 
- Space - Jump

**Mouse:**
- Right-click + drag - Rotate camera
- Scroll wheel - Zoom in/out

### Plugin Registration

```typescript
import * as GAME from 'shalloteer';

GAME
  .withPlugin(GAME.PlayerPlugin)  // Included in defaults
  .run();
```
<!-- /LLM:EXAMPLES -->
