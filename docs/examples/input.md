# Input Examples

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