# Math Module

<!-- LLM:OVERVIEW -->
Mathematical utilities for 3D transformations. Provides interpolation functions for smooth animations and transitions.
<!-- /LLM:OVERVIEW -->

## Purpose

- Vector and quaternion operations
- Interpolation utilities
- Common math constants
- Transformation helpers

## Layout

```
math/
├── context.md  # This file
├── utilities.ts  # Math utility functions
└── index.ts  # Module exports
```

## Scope

- **In-scope**: 3D math, interpolation, transforms
- **Out-of-scope**: Physics calculations, rendering math

## Entry Points

- **utilities.ts**: Math utility functions
- **index.ts**: Public exports

## Dependencies

- **Internal**: None
- **External**: Three.js math types

<!-- LLM:REFERENCE -->
## API Reference

### Exported Functions

#### lerp(a: number, b: number, t: number): number
Linear interpolation between two values.
- `a` - Start value
- `b` - End value  
- `t` - Interpolation factor (0-1)
- Returns interpolated value

#### slerp(fromX, fromY, fromZ, fromW, toX, toY, toZ, toW, t): Quaternion
Spherical linear interpolation between quaternions.
- `fromX/Y/Z/W` - Start quaternion components
- `toX/Y/Z/W` - End quaternion components
- `t` - Interpolation factor (0-1)
- Returns interpolated quaternion as `{x, y, z, w}`
<!-- /LLM:REFERENCE -->

<!-- LLM:EXAMPLES -->
## Examples

### Linear Interpolation

```typescript
import * as GAME from 'shalloteer';

// Interpolate position
const startPos = 0;
const endPos = 10;
const progress = 0.5; // 50%

const currentPos = GAME.lerp(startPos, endPos, progress); // 5

// Smooth animation over time
function animate(deltaTime) {
  const speed = 0.1;
  position = GAME.lerp(position, target, speed * deltaTime);
}
```

### Quaternion Interpolation

```typescript
import * as GAME from 'shalloteer';

// Interpolate rotation
const from = { x: 0, y: 0, z: 0, w: 1 }; // Identity
const to = { x: 0, y: 0.707, z: 0, w: 0.707 }; // 90° Y rotation

const result = GAME.slerp(
  from.x, from.y, from.z, from.w,
  to.x, to.y, to.z, to.w,
  0.5 // 50% between rotations
);
// result is halfway rotation (45° Y)
```
<!-- /LLM:EXAMPLES -->