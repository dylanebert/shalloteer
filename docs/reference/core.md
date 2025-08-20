# Core Reference

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