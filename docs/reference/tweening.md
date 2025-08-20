# Tweening Reference

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