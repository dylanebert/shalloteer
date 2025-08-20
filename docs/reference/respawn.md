# Respawn Reference

## API Reference

### Components

#### Respawn
Stores the spawn position and rotation for an entity. When respawn triggers, the entity returns to this position.

**Properties:**
- `posX: f32` - Spawn X position
- `posY: f32` - Spawn Y position  
- `posZ: f32` - Spawn Z position
- `eulerX: f32` - Spawn rotation X (degrees)
- `eulerY: f32` - Spawn rotation Y (degrees)
- `eulerZ: f32` - Spawn rotation Z (degrees)

### Systems

#### RespawnSystem
Monitors entities with `Respawn` and `WorldTransform` components. Triggers respawn when `WorldTransform.posY` falls below -100.

**Behavior:**
- Runs in `simulation` group
- Resets position to stored spawn point
- Clears velocities for physics bodies
- Resets character controller state
- Resets player jump state

### Plugin Exports

```typescript
export const RespawnPlugin: Plugin = {
  components: { Respawn },
  systems: [RespawnSystem]
}
```