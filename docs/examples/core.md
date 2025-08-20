# Core Examples

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