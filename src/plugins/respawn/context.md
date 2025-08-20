# Respawn Plugin

<!-- LLM:OVERVIEW -->
Automatic respawn system that resets entity position and state when they fall out of bounds. Included by default in player entities to handle falling off the world. Triggers when entities fall below Y=-100.
<!-- /LLM:OVERVIEW -->

## Layout

```
respawn/
├── context.md  # This file
├── index.ts  # Public exports
├── plugin.ts  # Plugin definition
├── components.ts  # Respawn component
├── systems.ts  # RespawnSystem
└── utils.ts  # Respawn utilities
```

## Scope

- **In-scope**: Respawn position tracking, fall detection, state reset
- **Out-of-scope**: Death animations, checkpoints, game over screens

## Entry Points

- **index.ts**: Exports `Respawn` component and `RespawnPlugin`
- **systems.ts**: `RespawnSystem` runs during simulation phase

## Dependencies

- **Internal**: Transforms, Physics, Player components
- **External**: None

<!-- LLM:REFERENCE -->
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
<!-- /LLM:REFERENCE -->

<!-- LLM:EXAMPLES -->
## Examples

### Player with Respawn (Automatic)

The `<player>` recipe automatically includes respawn:

```xml
<world>
  <!-- Player spawns at 0,5,0 and respawns there if falling -->
  <player pos="0 5 0"></player>
</world>
```

### Manual Respawn Component

```xml
<entity transform body collider respawn="pos: 0 10 -5">
  <!-- Entity respawns at 0,10,-5 when falling below Y=-100 -->
</entity>
```

### Imperative Usage

```typescript
import * as GAME from 'shalloteer';

// Add respawn to an entity
const entity = state.createEntity();

// Set spawn point from current transform
state.addComponent(entity, GAME.Transform, {
  posX: 0, posY: 10, posZ: 0,
  eulerX: 0, eulerY: 0, eulerZ: 0
});

state.addComponent(entity, GAME.Respawn, {
  posX: 0, posY: 10, posZ: 0,
  eulerX: 0, eulerY: 0, eulerZ: 0
});

// Entity will respawn at (0,10,0) when falling
```

### Update Spawn Point

```typescript
import * as GAME from 'shalloteer';

// Change respawn position dynamically
GAME.Respawn.posX[entity] = 20;
GAME.Respawn.posY[entity] = 5;
GAME.Respawn.posZ[entity] = -10;
```

### XML with Transform Sync

Position attributes automatically populate the respawn component:

```xml
<!-- Position sets both transform and respawn -->
<player pos="5 3 -2" euler="0 90 0"></player>
```
<!-- /LLM:EXAMPLES -->