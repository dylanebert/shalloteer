# Startup Plugin

<!-- LLM:OVERVIEW -->
Automatically creates essential game entities (player, camera, and lighting) at startup if they don't already exist. This ensures the game always has a playable state without requiring explicit setup.
<!-- /LLM:OVERVIEW -->

## Layout

```
startup/
├── context.md  # This file, folder context (Tier 2)
├── index.ts    # Public exports
├── plugin.ts   # Plugin definition
└── systems.ts  # Startup system implementations
```

## Scope

- **In-scope**: One-time entity creation for player, camera, and lighting; default game state initialization
- **Out-of-scope**: Runtime systems, continuous updates, user-created entities

## Entry Points

- **StartupPlugin**: Exported from index.ts, registers all setup systems
- **Systems**: Run automatically in the 'setup' group during initialization

## Dependencies

- **Internal**: animation, input, orbit-camera, physics, player, recipes, rendering, respawn, transforms
- **External**: None

<!-- LLM:REFERENCE -->
## API Reference

### Plugin

**StartupPlugin**
- Type: `Plugin`
- Systems: `[LightingStartupSystem, CameraStartupSystem, PlayerStartupSystem, PlayerCharacterSystem]`
- Components: None
- Description: Bundle of systems that create default game entities on startup

### Systems

**LightingStartupSystem**
- Group: `'setup'`
- Purpose: Creates default lighting if no lights exist
- Creates: One entity with both Ambient and Directional light components
- Condition: Only runs if no Ambient or Directional lights exist
- Defaults: 
  - Ambient: Sky color 0xb0e0ff, ground color 0x4a3f2a, intensity 0.6
  - Directional: White light (0xffffff), intensity 1.0, casts shadows, points down-forward

**CameraStartupSystem**
- Group: `'setup'`
- Purpose: Creates main camera with orbit controls if none exists
- Creates: One entity with MainCamera, OrbitCamera, and Transform components
- Condition: Only runs if no MainCamera exists
- Defaults: Distance 10, pitch -30°, full rotation, smoothness 0.15

**PlayerStartupSystem**
- Group: `'setup'`
- Purpose: Creates a fully-functional player entity if none exists
- Creates: One entity with complete player setup
- Components added:
  - Player (movement stats, jump control)
  - CharacterMovement (velocity management)
  - Transform (position/rotation/scale)
  - Body (kinematic physics body)
  - Collider (capsule shape)
  - CharacterController (ground detection, auto-step)
  - InputState (input mapping)
  - Respawn (respawn position)
- Condition: Only runs if no Player entities exist
- Defaults: Position (0, 5, 0), capsule collider, kinematic body

**PlayerCharacterSystem**
- Group: `'setup'`
- Purpose: Attaches animated character model to player entities
- Creates: Child entity with AnimatedCharacter component
- Condition: Runs for any Player without HasAnimator tag
- Structure: Creates character at offset (0, 0.75, 0) as child of player
<!-- /LLM:REFERENCE -->

<!-- LLM:EXAMPLES -->
## Examples

### Basic Usage (Auto-Creation)

```typescript
// The plugin automatically creates defaults when included
import * as GAME from 'shalloteer';

// This will create player, camera, and lighting automatically
GAME.run(); // Uses DefaultPlugins which includes StartupPlugin
```

### Preventing Auto-Creation with XML

```xml
<world>
  <!-- Creating your own player prevents auto-creation -->
  <player pos="10 2 -5" speed="12" />
  
  <!-- Creating custom lighting prevents default lights -->
  <entity ambient="sky-color: 0xff0000" directional />
</world>
```

### Manual Plugin Registration

```typescript
import * as GAME from 'shalloteer';

// Use startup plugin without other defaults
GAME.withoutDefaultPlugins()
  .withPlugin(GAME.TransformsPlugin)
  .withPlugin(GAME.RenderingPlugin) 
  .withPlugin(GAME.StartupPlugin)
  .run();
```

### System Behavior

The startup systems are idempotent - they check for existing entities before creating:

```typescript
import * as GAME from 'shalloteer';

// First run: Creates player, camera, lights
state.query(GAME.Player).length // 0 -> creates player

// Subsequent runs: Skips creation
state.query(GAME.Player).length // 1 -> skips creation
```
<!-- /LLM:EXAMPLES -->