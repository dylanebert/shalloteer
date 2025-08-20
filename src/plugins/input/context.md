# Input Plugin

<!-- LLM:OVERVIEW -->
Unified input handling system that captures and normalizes mouse, keyboard, and gamepad events. Provides buffered action inputs with configurable grace periods for responsive gameplay controls.
<!-- /LLM:OVERVIEW -->

## Purpose

- Capture and normalize input events
- Provide unified input state
- Handle mouse movement and wheel
- Support gamepad input

## Layout

```
input/
├── context.md  # This file
├── index.ts  # Public exports
├── plugin.ts  # Plugin definition
├── components.ts  # InputState component
├── systems.ts  # InputSystem
├── utils.ts  # Input event handlers
└── config.ts  # Input configuration
```

## Scope

- **In-scope**: Browser input events, gamepad API
- **Out-of-scope**: Touch input, gestures

## Entry Points

- **plugin.ts**: InputPlugin definition
- **systems.ts**: InputSystem for state updates
- **utils.ts**: Event handler utilities

## Dependencies

- **Internal**: Core ECS
- **External**: Browser DOM/Gamepad APIs

## Components

- **InputState**: Current input state (keys, mouse, gamepad)

## Systems

- **InputSystem**: Updates input state each frame

## Utilities

- **consumeJump**: Consume jump input
- **consumePrimary/Secondary**: Consume action inputs
- **handleMouseMove/Down/Up/Wheel**: Mouse handlers

<!-- LLM:REFERENCE -->
## API Reference

### Components

#### InputState
Stores the current input state for an entity. All values are updated each frame by the InputSystem.

**Properties:**
- `moveX: f32` - Horizontal movement axis (-1 left, 0 neutral, 1 right)
- `moveY: f32` - Forward/backward axis (-1 back, 0 neutral, 1 forward)
- `moveZ: f32` - Vertical movement axis (-1 down, 0 neutral, 1 up)
- `lookX: f32` - Mouse delta X multiplied by sensitivity
- `lookY: f32` - Mouse delta Y multiplied by sensitivity
- `scrollDelta: f32` - Mouse wheel scroll delta
- `jump: ui8` - Jump action available (0 or 1)
- `primaryAction: ui8` - Primary action available (0 or 1)
- `secondaryAction: ui8` - Secondary action available (0 or 1)
- `leftMouse: ui8` - Left mouse button pressed (0 or 1)
- `rightMouse: ui8` - Right mouse button pressed (0 or 1)
- `middleMouse: ui8` - Middle mouse button pressed (0 or 1)
- `jumpBufferTime: f32` - Timestamp of last jump press
- `primaryBufferTime: f32` - Timestamp of last primary action press
- `secondaryBufferTime: f32` - Timestamp of last secondary action press

### Configuration

#### INPUT_CONFIG
Global input configuration object.

```typescript
{
  mappings: {
    moveForward: ['KeyW', 'ArrowUp'],
    moveBackward: ['KeyS', 'ArrowDown'],
    moveLeft: ['KeyA', 'ArrowLeft'],
    moveRight: ['KeyD', 'ArrowRight'],
    moveUp: ['KeyE'],
    moveDown: ['KeyQ'],
    jump: ['Space'],
    primaryAction: ['MouseLeft'],
    secondaryAction: ['MouseRight']
  },
  bufferWindow: 100,  // ms to buffer inputs
  gracePeriods: {
    coyoteTime: 100,    // ms after leaving ground
    landingBuffer: 50   // ms before landing
  },
  mouseSensitivity: {
    look: 0.5,
    scroll: 0.01
  }
}
```

#### InputAction
Type representing available input actions.

```typescript
type InputAction = 'moveForward' | 'moveBackward' | 'moveLeft' | 'moveRight' | 
                   'moveUp' | 'moveDown' | 'jump' | 'primaryAction' | 'secondaryAction'
```

### Plugin

#### InputPlugin
The main plugin export for registering input handling.

```typescript
const InputPlugin: Plugin = {
  systems: [InputSystem],
  components: { InputState }
}
```

### Systems

#### InputSystem
Manages input event listeners and updates InputState components each frame.

- **Group:** `simulation`
- **Setup:** Registers DOM event listeners and clears input state
- **Update:** Updates all InputState components with current input data, then resets frame deltas
- **Dispose:** Removes event listeners and clears input state

### Functions

#### consumeJump(): boolean
Consumes buffered jump input if available within the buffer window.
- **Returns:** `true` if jump was consumed, `false` otherwise

#### consumePrimary(): boolean
Consumes buffered primary action input if available.
- **Returns:** `true` if action was consumed, `false` otherwise

#### consumeSecondary(): boolean
Consumes buffered secondary action input if available.
- **Returns:** `true` if action was consumed, `false` otherwise

#### handleMouseMove(event: MouseEvent): void
Processes mouse movement events. Accumulates movement deltas.
- **Parameters:** `event` - Browser MouseEvent

#### handleMouseDown(event: MouseEvent): void
Processes mouse button press events. Updates button state and buffers actions.
- **Parameters:** `event` - Browser MouseEvent

#### handleMouseUp(event: MouseEvent): void
Processes mouse button release events. Updates button state.
- **Parameters:** `event` - Browser MouseEvent

#### handleWheel(event: WheelEvent): void
Processes mouse wheel events. Accumulates scroll delta with sensitivity.
- **Parameters:** `event` - Browser WheelEvent
<!-- /LLM:REFERENCE -->

<!-- LLM:EXAMPLES -->
## Examples

### Basic Plugin Registration

```typescript
import * as GAME from 'shalloteer';

GAME
  .withPlugin(GAME.InputPlugin)
  .run();
```

### Reading Input in a Custom System

```typescript
import * as GAME from 'shalloteer';

const PlayerControlSystem: GAME.System = {
  update: (state) => {
    const players = state.query(GAME.Player, GAME.InputState);
    
    for (const player of players) {
      // Read movement axes
      const moveX = GAME.InputState.moveX[player];
      const moveY = GAME.InputState.moveY[player];
      
      // Check for jump
      if (GAME.InputState.jump[player]) {
        // Jump is available this frame
      }
      
      // Check mouse buttons
      if (GAME.InputState.leftMouse[player]) {
        // Left mouse is held
      }
    }
  }
};
```

### Consuming Buffered Actions

```typescript
import * as GAME from 'shalloteer';

const CombatSystem: GAME.System = {
  update: (state) => {
    // Consume jump if available (prevents double consumption)
    if (GAME.consumeJump()) {
      // Perform jump
      velocity.y = JUMP_FORCE;
    }
    
    // Consume primary action
    if (GAME.consumePrimary()) {
      // Fire weapon
      spawnProjectile();
    }
  }
};
```

### Custom Input Mappings

```typescript
import * as GAME from 'shalloteer';

// Modify before starting the game
GAME.INPUT_CONFIG.mappings.jump = ['Space', 'KeyX'];
GAME.INPUT_CONFIG.mappings.moveForward = ['KeyW', 'KeyZ', 'ArrowUp'];
GAME.INPUT_CONFIG.mouseSensitivity.look = 0.3;

GAME.run();
```

### Manual Event Handling

```typescript
import * as GAME from 'shalloteer';

// Use the exported handlers directly if needed
canvas.addEventListener('mousedown', GAME.handleMouseDown);
canvas.addEventListener('mouseup', GAME.handleMouseUp);
```
<!-- /LLM:EXAMPLES -->
