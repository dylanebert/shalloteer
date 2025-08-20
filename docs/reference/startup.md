# Startup Reference

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