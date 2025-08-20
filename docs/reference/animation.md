# Animation Reference

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