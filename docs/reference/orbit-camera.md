# Orbit Camera Reference

## API Reference

### Components

#### OrbitCamera

Controls orbital camera behavior around a target entity.

**Properties:**
- `target` (eid, default: 0) - Entity ID to orbit around
- `current-yaw` (f32, default: π) - Current horizontal rotation angle in radians
- `current-pitch` (f32, default: π/6) - Current vertical rotation angle in radians  
- `current-distance` (f32, default: 4) - Current distance from target
- `target-yaw` (f32, default: π) - Target horizontal rotation angle
- `target-pitch` (f32, default: π/6) - Target vertical rotation angle
- `target-distance` (f32, default: 4) - Target distance from target
- `min-distance` (f32, default: 1) - Minimum allowed distance
- `max-distance` (f32, default: 25) - Maximum allowed distance
- `min-pitch` (f32, default: 0) - Minimum pitch angle (looking down)
- `max-pitch` (f32, default: π/2) - Maximum pitch angle (looking up)
- `smoothness` (f32, default: 0.5) - Interpolation speed (0-1)
- `offset-x` (f32, default: 0) - X offset from target position
- `offset-y` (f32, default: 1.25) - Y offset from target position
- `offset-z` (f32, default: 0) - Z offset from target position

### Systems

#### OrbitCameraSystem

**Group:** `draw`

Updates camera position and rotation each frame:
- Smoothly interpolates current values toward target values
- Calculates camera position based on yaw, pitch, and distance
- Points camera at target entity with applied offsets
- Respects min/max constraints for distance and pitch

### Recipes

#### camera

Creates an orbital camera entity with default settings.

**Components added:**
- `orbit-camera` - Orbital camera controls
- `transform` - Position and rotation
- `world-transform` - World space transform
- `main-camera` - Marks as main camera

**Default overrides:**
- `transform.pos-y`: 8
- `transform.pos-z`: 10