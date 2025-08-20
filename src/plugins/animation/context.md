# Animation Plugin

Procedural character animation system for player models

<!-- LLM:OVERVIEW -->
Provides procedural character animation for player entities, automatically animating body parts based on movement states (walking, jumping, falling, landing). Creates a multi-part character model with head, torso, arms, and legs that respond to physics-based movement.
<!-- /LLM:OVERVIEW -->

## Purpose

- Create animated character models with body parts
- Procedurally animate based on movement states
- Handle walk cycles, jumping, falling, and landing animations
- Synchronize animations with physics state

## Layout

```
animation/
├── context.md  # This file, folder context (Tier 2)
├── index.ts  # Public exports
├── plugin.ts  # Plugin definition
├── components.ts  # AnimatedCharacter, HasAnimator
├── systems.ts  # Initialization and update systems
├── utils.ts  # Animation helper functions
└── constants.ts  # Body part definitions and config
```

## Scope

- **In-scope**: Procedural character animation, body part management, movement-based animation states
- **Out-of-scope**: Three.js animation clips, tween animations, non-character animations

## Entrypoints

- **plugin.ts**: AnimationPlugin definition with systems and components
- **systems.ts**: AnimatedCharacterInitializationSystem (setup batch), AnimatedCharacterUpdateSystem (simulation batch)
- **index.ts**: Public exports (AnimatedCharacter, HasAnimator, AnimationPlugin)

## Dependencies

- **Internal**: Core ECS, transforms (Transform), rendering (Renderer), physics (CharacterController, InterpolatedTransform), recipes (Parent)
- **External**: None (purely procedural)

<!-- LLM:REFERENCE -->
## API Reference

### Components

#### AnimatedCharacter
Stores references to body part entities and animation state data.

**Properties:**
- `headEntity` (eid): Entity ID of the head part
- `torsoEntity` (eid): Entity ID of the torso part
- `leftArmEntity` (eid): Entity ID of the left arm
- `rightArmEntity` (eid): Entity ID of the right arm
- `leftLegEntity` (eid): Entity ID of the left leg
- `rightLegEntity` (eid): Entity ID of the right leg
- `phase` (f32): Current animation phase (0-1) for walk cycle
- `jumpTime` (f32): Time elapsed since jump started
- `fallTime` (f32): Time elapsed since falling started
- `animationState` (ui8): Current animation state (0=IDLE, 1=WALKING, 2=JUMPING, 3=FALLING, 4=LANDING)
- `stateTransition` (f32): Transition time for landing animation

#### HasAnimator
Tag component to mark entities that have an animated character attached (no properties).

### Systems

#### AnimatedCharacterInitializationSystem
- **Group**: `setup`
- **Purpose**: Creates body part entities for uninitialized AnimatedCharacter components
- **Behavior**: Automatically generates head, torso, arms, and legs as child entities

#### AnimatedCharacterUpdateSystem
- **Group**: `simulation`
- **Purpose**: Updates character animation based on movement and physics state
- **Behavior**: 
  - Detects movement state from CharacterController and InterpolatedTransform
  - Applies appropriate animations (walk, jump, fall, landing, idle)
  - Modulates body part rotations and scales based on animation state

### Configuration

**Plugin Defaults:**
```javascript
{
  animatedCharacter: {
    playerEntity: -1,
    headEntity: -1,
    torsoEntity: -1,
    leftArmEntity: -1,
    rightArmEntity: -1,
    leftLegEntity: -1,
    rightLegEntity: -1
  }
}
```

### Animation States

- `IDLE` (0): Standing still, minimal animation
- `WALKING` (1): Walk cycle with arm and leg swinging
- `JUMPING` (2): Jump animation with body stretch and arm raise
- `FALLING` (3): Falling animation with arm flailing
- `LANDING` (4): Landing impact with squash and stretch
<!-- /LLM:REFERENCE -->

<!-- LLM:EXAMPLES -->
## Examples

### Basic Usage

```typescript
import * as GAME from 'shalloteer';

// Add animated character to a player entity
const player = state.createEntity();
state.addComponent(player, GAME.AnimatedCharacter);
state.addComponent(player, GAME.CharacterController);
state.addComponent(player, GAME.Transform);

// The AnimatedCharacterInitializationSystem will automatically
// create body parts in the next setup phase
```

### Accessing Animation State

```typescript
import * as GAME from 'shalloteer';

const MySystem: GAME.System = {
  update: (state) => {
    const characters = state.query(GAME.AnimatedCharacter);
    for (const entity of characters) {
      const animState = GAME.AnimatedCharacter.animationState[entity];
      if (animState === 2) { // JUMPING
        console.log('Character is jumping!');
      }
    }
  }
};
```

### XML Declaration

```xml
<!-- Player entity with animated character -->
<entity 
  animated-character
  character-controller
  transform="pos: 0 2 0"
/>
```
<!-- /LLM:EXAMPLES -->