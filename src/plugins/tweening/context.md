# Tweening Plugin

<!-- LLM:OVERVIEW -->
Smooth property animations with easing functions and loop modes. Animate any numeric component property over time using declarative XML tweens or programmatic API.
<!-- /LLM:OVERVIEW -->

## Layout

```
tweening/
├── context.md  # This file
├── index.ts  # Public exports
├── plugin.ts  # Plugin definition
├── components.ts  # Tween components
├── systems.ts  # TweenSystem
├── parser.ts  # Tween XML parser
└── utils.ts  # Easing functions
```

## Scope

- **In-scope**: Property animations, easing functions, loop modes, XML tween definitions
- **Out-of-scope**: Skeletal animation, physics interpolation

## Entry Points

- **plugin.ts**: TweenPlugin definition for registration
- **systems.ts**: TweenSystem processes active tweens each frame
- **parser.ts**: Parses `<tween>` elements from XML scenes

## Dependencies

- **Internal**: Core ECS, math utilities (lerp)
- **External**: gsap (for easing functions)

<!-- LLM:REFERENCE -->
## API Reference

### Components

#### Tween
Active tween controller component
- `duration`: f32 - Animation duration in seconds (default: 1)
- `elapsed`: f32 - Time elapsed since start
- `easingIndex`: ui8 - Index into easing function array
- `loopMode`: ui8 - Loop behavior (0=Once, 1=Loop, 2=PingPong)

#### TweenValue
Individual animated property value
- `source`: ui32 - Parent tween entity
- `target`: ui32 - Target entity being animated
- `componentId`: ui32 - Component identifier
- `fieldIndex`: ui32 - Field index in component
- `from`: f32 - Starting value
- `to`: f32 - Target value  
- `value`: f32 - Current interpolated value

### Systems

#### TweenSystem
Updates all active tweens each frame
- Group: `simulation`
- Behavior: Interpolates values based on elapsed time and easing
- Auto-cleanup: Destroys completed one-shot tweens

### Functions

#### createTween(state, entity, target, options)
Creates a tween for a component property
- `state`: State - ECS state instance
- `entity`: number - Entity to animate
- `target`: string - Property path (e.g., "transform.pos-y", "body.velocity-x")
- `options`: TweenOptions
  - `from?`: number | number[] - Start value (current if omitted)
  - `to`: number | number[] - Target value
  - `duration?`: number - Seconds (default: 1)
  - `easing?`: string - Easing function name
  - `loop?`: string | number - Loop mode

Returns: number | null - Tween entity or null if target invalid

### Easing Functions

Available easing curves (use kebab-case in XML):
- `linear` - Constant speed
- `sine-in`, `sine-out`, `sine-in-out` - Smooth sine curve
- `quad-in`, `quad-out`, `quad-in-out` - Quadratic acceleration
- `cubic-in`, `cubic-out`, `cubic-in-out` - Cubic acceleration
- `quart-in`, `quart-out`, `quart-in-out` - Quartic acceleration
- `expo-in`, `expo-out`, `expo-in-out` - Exponential acceleration
- `circ-in`, `circ-out`, `circ-in-out` - Circular acceleration
- `back-in`, `back-out`, `back-in-out` - Overshooting motion
- `elastic-in`, `elastic-out`, `elastic-in-out` - Elastic bounce
- `bounce-in`, `bounce-out`, `bounce-in-out` - Bouncing motion

### Loop Modes

- `once` - Play once and destroy (default)
- `loop` - Repeat from start indefinitely
- `ping-pong` - Alternate between forward and reverse

### Shorthand Targets

Special targets that expand to multiple properties:
- `rotation` - Animates transform.eulerX/Y/Z (degrees)
- `at` - Animates transform.posX/Y/Z
- `scale` - Animates transform.scaleX/Y/Z
<!-- /LLM:REFERENCE -->

<!-- LLM:EXAMPLES -->
## Examples

### Basic XML Tween

```xml
<!-- Animate Y position from 5 to 10 over 2 seconds -->
<kinematic-part pos="0 5 -5">
  <tween 
    target="transform.pos-y" 
    from="5" 
    to="10" 
    duration="2" 
    ease="sine-in-out" 
    loop="ping-pong"
  />
</kinematic-part>
```

### Multiple Properties

```xml
<!-- Animate rotation on all axes -->
<entity transform renderer>
  <tween 
    target="rotation" 
    to="0 360 0" 
    duration="4" 
    loop="loop"
  />
</entity>
```

### Body Physics Properties

```xml
<!-- Animate physics body velocity -->
<dynamic-part pos="0 10 0">
  <tween 
    target="body.velocity-x" 
    from="0" 
    to="10" 
    duration="1" 
    ease="quad-out"
  />
</tween>
```

### Programmatic Usage

```typescript
import * as GAME from 'shalloteer';

// In a system
const MySystem = {
  setup: (state) => {
    const entity = state.createEntity();
    state.addComponent(entity, GAME.Transform);
    
    // Create tween programmatically
    GAME.createTween(state, entity, 'transform.pos-y', {
      from: 0,
      to: 10,
      duration: 2,
      easing: 'bounce-out',
      loop: 'once'
    });
  }
};
```

### Complex Animation Sequence

```xml
<!-- Platform with multiple animated properties -->
<kinematic-part pos="0 0 0" color="0xff0000">
  <!-- Position animation -->
  <tween target="transform.pos-x" from="-5" to="5" duration="3" loop="ping-pong"></tween>
  <!-- Rotation animation -->
  <tween target="transform.euler-y" to="360" duration="10" loop="loop"></tween>
  <!-- Scale pulse -->
  <tween target="transform.scale-x" from="1" to="1.5" duration="1" ease="sine-in-out" loop="ping-pong"></tween>
  <tween target="transform.scale-z" from="1" to="1.5" duration="1" ease="sine-in-out" loop="ping-pong"></tween>
</kinematic-part>
```
<!-- /LLM:EXAMPLES -->