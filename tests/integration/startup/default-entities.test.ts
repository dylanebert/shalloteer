import { beforeEach, describe, expect, it } from 'bun:test';
import { JSDOM } from 'jsdom';
import {
  State,
  XMLParser,
  parseXMLToEntities,
  DefaultPlugins,
  OrbitCamera,
  Player,
  Transform,
  MainCamera,
  Ambient,
  Directional,
  CharacterMovement,
  Body,
  Collider,
  CharacterController,
  InputState,
  Respawn,
  StartupPlugin,
  TransformsPlugin,
  RenderingPlugin,
  AnimatedCharacter,
  HasAnimator,
  Parent,
} from 'shalloteer';

describe('Startup Plugin - Auto-Creation', () => {
  beforeEach(() => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.DOMParser = dom.window.DOMParser;
  });

  it('should automatically create player, camera, and lighting with DefaultPlugins', () => {
    const state = new State();
    for (const plugin of DefaultPlugins) {
      state.registerPlugin(plugin);
    }

    expect(state.query(Player).length).toBe(0);
    expect(state.query(MainCamera).length).toBe(0);
    expect(state.query(Ambient).length).toBe(0);
    expect(state.query(Directional).length).toBe(0);

    state.scheduler.step(state, 0);

    expect(state.query(Player).length).toBe(1);
    expect(state.query(MainCamera).length).toBe(1);
    expect(state.query(Ambient).length).toBe(1);
    expect(state.query(Directional).length).toBe(1);

    const player = state.query(Player)[0];
    const camera = state.query(MainCamera)[0];
    const light = state.query(Ambient)[0];

    expect(state.hasComponent(player, CharacterMovement)).toBe(true);
    expect(state.hasComponent(player, Transform)).toBe(true);
    expect(state.hasComponent(player, Body)).toBe(true);
    expect(state.hasComponent(player, Collider)).toBe(true);
    expect(state.hasComponent(player, CharacterController)).toBe(true);
    expect(state.hasComponent(player, InputState)).toBe(true);
    expect(state.hasComponent(player, Respawn)).toBe(true);

    expect(state.hasComponent(camera, OrbitCamera)).toBe(true);
    expect(state.hasComponent(camera, Transform)).toBe(true);
    expect(OrbitCamera.target[camera]).toBe(player);

    expect(state.hasComponent(light, Directional)).toBe(true);
  });

  it('should work with manual plugin registration', () => {
    const state = new State();
    state.registerPlugin(TransformsPlugin);
    state.registerPlugin(RenderingPlugin);
    state.registerPlugin(StartupPlugin);

    expect(state.query(Player).length).toBe(0);
    expect(state.query(MainCamera).length).toBe(0);
    expect(state.query(Ambient).length).toBe(0);

    state.scheduler.step(state, 0);

    expect(state.query(Player).length).toBe(1);
    expect(state.query(MainCamera).length).toBe(1);
    expect(state.query(Ambient).length).toBe(1);
    expect(state.query(Directional).length).toBe(1);
  });
});

describe('Startup Plugin - Preventing Auto-Creation', () => {
  let state: State;

  beforeEach(() => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.DOMParser = dom.window.DOMParser;

    state = new State();
    for (const plugin of DefaultPlugins) {
      state.registerPlugin(plugin);
    }
  });

  it('should not create player when one already exists from XML', () => {
    const xml = '<root><player pos="10 2 -5" speed="12" /></root>';
    const parsed = XMLParser.parse(xml);
    parseXMLToEntities(state, parsed.root);

    expect(state.query(Player).length).toBe(1);
    const xmlPlayer = state.query(Player)[0];
    expect(Transform.posX[xmlPlayer]).toBe(10);
    expect(Transform.posY[xmlPlayer]).toBe(2);
    expect(Transform.posZ[xmlPlayer]).toBe(-5);
    expect(Player.speed[xmlPlayer]).toBe(12);

    state.scheduler.step(state, 0);

    expect(state.query(Player).length).toBe(1);
    const afterStartup = state.query(Player)[0];
    expect(afterStartup).toBe(xmlPlayer);
  });

  it('should not create camera when one already exists from XML', () => {
    const xml =
      '<root><camera orbit-camera="target-distance: 20; target-pitch: -45" /></root>';
    const parsed = XMLParser.parse(xml);
    parseXMLToEntities(state, parsed.root);

    expect(state.query(MainCamera).length).toBe(1);
    const xmlCamera = state.query(MainCamera)[0];
    expect(OrbitCamera.targetDistance[xmlCamera]).toBe(20);
    expect(OrbitCamera.targetPitch[xmlCamera]).toBe(-45);

    state.scheduler.step(state, 0);

    expect(state.query(MainCamera).length).toBe(1);
    expect(state.query(Player).length).toBe(1);

    const afterStartup = state.query(MainCamera)[0];
    expect(afterStartup).toBe(xmlCamera);
  });

  it('should not create lighting when ambient light already exists from XML', () => {
    const xml = '<root><entity ambient="sky-color: 0xff0000" /></root>';
    const parsed = XMLParser.parse(xml);
    parseXMLToEntities(state, parsed.root);

    expect(state.query(Ambient).length).toBe(1);
    const xmlLight = state.query(Ambient)[0];
    expect(Ambient.skyColor[xmlLight]).toBe(0xff0000);

    state.scheduler.step(state, 0);

    expect(state.query(Ambient).length).toBe(1);
    const afterStartup = state.query(Ambient)[0];
    expect(afterStartup).toBe(xmlLight);
  });

  it('should not create lighting when directional light already exists from XML', () => {
    const xml = '<root><entity directional="" /></root>';
    const parsed = XMLParser.parse(xml);
    parseXMLToEntities(state, parsed.root);

    expect(state.query(Directional).length).toBe(1);

    state.scheduler.step(state, 0);

    expect(state.query(Directional).length).toBe(1);
    expect(state.query(Ambient).length).toBe(0);
  });

  it('should not create lighting when combined light already exists from XML', () => {
    const xml = '<root><light /></root>';
    const parsed = XMLParser.parse(xml);
    parseXMLToEntities(state, parsed.root);

    expect(state.query(Ambient).length).toBe(1);
    expect(state.query(Directional).length).toBe(1);

    state.scheduler.step(state, 0);

    expect(state.query(Ambient).length).toBe(1);
    expect(state.query(Directional).length).toBe(1);
  });
});

describe('Startup Plugin - Idempotent Behavior', () => {
  let state: State;

  beforeEach(() => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.DOMParser = dom.window.DOMParser;

    state = new State();
    for (const plugin of DefaultPlugins) {
      state.registerPlugin(plugin);
    }
  });

  it('should be idempotent and only create entities once', () => {
    expect(state.query(Player).length).toBe(0);
    expect(state.query(MainCamera).length).toBe(0);
    expect(state.query(Ambient).length).toBe(0);

    state.scheduler.step(state, 0);

    expect(state.query(Player).length).toBe(1);
    expect(state.query(MainCamera).length).toBe(1);
    expect(state.query(Ambient).length).toBe(1);

    const firstPlayer = state.query(Player)[0];
    const firstCamera = state.query(MainCamera)[0];
    const firstLight = state.query(Ambient)[0];

    state.scheduler.step(state, 0);

    expect(state.query(Player).length).toBe(1);
    expect(state.query(MainCamera).length).toBe(1);
    expect(state.query(Ambient).length).toBe(1);

    expect(state.query(Player)[0]).toBe(firstPlayer);
    expect(state.query(MainCamera)[0]).toBe(firstCamera);
    expect(state.query(Ambient)[0]).toBe(firstLight);
  });
});

describe('Startup Plugin - Player Character System', () => {
  let state: State;

  beforeEach(() => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.DOMParser = dom.window.DOMParser;

    state = new State();
    for (const plugin of DefaultPlugins) {
      state.registerPlugin(plugin);
    }
  });

  it('should attach animated character to player entities', () => {
    state.scheduler.step(state, 0);

    const player = state.query(Player)[0];
    expect(state.hasComponent(player, HasAnimator)).toBe(true);

    const characters = state.query(AnimatedCharacter);
    const characterQuery = characters.filter((e) =>
      state.hasComponent(e, Parent)
    );
    expect(characterQuery.length).toBe(1);

    const character = characterQuery[0];
    expect(Parent.entity[character]).toBe(player);
    expect(state.hasComponent(character, Transform)).toBe(true);
    expect(Transform.posY[character]).toBe(0.75);
  });

  it('should not attach character to players that already have HasAnimator', () => {
    const xml = '<root><player /></root>';
    const parsed = XMLParser.parse(xml);
    parseXMLToEntities(state, parsed.root);

    const player = state.query(Player)[0];
    state.addComponent(player, HasAnimator);

    state.scheduler.step(state, 0);

    const characters = state.query(AnimatedCharacter);
    const characterQuery = characters.filter((e) =>
      state.hasComponent(e, Parent)
    );
    expect(characterQuery.length).toBe(0);
  });
});

describe('Startup Plugin - Component Defaults', () => {
  let state: State;
  let startupState: State;

  beforeEach(() => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.DOMParser = dom.window.DOMParser;

    state = new State();
    for (const plugin of DefaultPlugins) {
      state.registerPlugin(plugin);
    }

    startupState = new State();
    for (const plugin of DefaultPlugins) {
      startupState.registerPlugin(plugin);
    }
    startupState.scheduler.step(startupState, 0);
  });

  it('should match player defaults between XML and startup system', () => {
    const xml = '<root><player /></root>';
    const parsed = XMLParser.parse(xml);
    parseXMLToEntities(state, parsed.root);

    const xmlPlayer = state.query(Player)[0];
    const startupPlayer = startupState.query(Player)[0];

    expect(Transform.posX[xmlPlayer]).toBe(Transform.posX[startupPlayer]);
    expect(Transform.posY[xmlPlayer]).toBe(Transform.posY[startupPlayer]);
    expect(Transform.posZ[xmlPlayer]).toBe(Transform.posZ[startupPlayer]);

    expect(Player.speed[xmlPlayer]).toBe(Player.speed[startupPlayer]);
    expect(Player.jumpHeight[xmlPlayer]).toBe(Player.jumpHeight[startupPlayer]);
    expect(Player.rotationSpeed[xmlPlayer]).toBe(
      Player.rotationSpeed[startupPlayer]
    );

    expect(Body.type[xmlPlayer]).toBe(Body.type[startupPlayer]);
    expect(Body.lockRotX[xmlPlayer]).toBe(Body.lockRotX[startupPlayer]);
    expect(Body.lockRotY[xmlPlayer]).toBe(Body.lockRotY[startupPlayer]);
    expect(Body.lockRotZ[xmlPlayer]).toBe(Body.lockRotZ[startupPlayer]);

    expect(Collider.shape[xmlPlayer]).toBe(Collider.shape[startupPlayer]);
    expect(Collider.radius[xmlPlayer]).toBe(Collider.radius[startupPlayer]);
    expect(Collider.height[xmlPlayer]).toBe(Collider.height[startupPlayer]);

    expect(CharacterController.offset[xmlPlayer]).toBe(
      CharacterController.offset[startupPlayer]
    );
    expect(CharacterController.autoStep[xmlPlayer]).toBe(
      CharacterController.autoStep[startupPlayer]
    );
    expect(CharacterController.maxStepHeight[xmlPlayer]).toBe(
      CharacterController.maxStepHeight[startupPlayer]
    );
  });

  it('should match camera defaults between XML and startup system', () => {
    const xml = '<root><player /><camera /></root>';
    const parsed = XMLParser.parse(xml);
    parseXMLToEntities(state, parsed.root);
    state.scheduler.step(state, 0);

    const xmlCamera = state.query(MainCamera)[0];
    const startupCamera = startupState.query(MainCamera)[0];

    expect(OrbitCamera.currentDistance[xmlCamera]).toBe(
      OrbitCamera.currentDistance[startupCamera]
    );
    expect(OrbitCamera.targetDistance[xmlCamera]).toBe(
      OrbitCamera.targetDistance[startupCamera]
    );
    expect(OrbitCamera.currentPitch[xmlCamera]).toBe(
      OrbitCamera.currentPitch[startupCamera]
    );
    expect(OrbitCamera.targetPitch[xmlCamera]).toBe(
      OrbitCamera.targetPitch[startupCamera]
    );
    expect(OrbitCamera.smoothness[xmlCamera]).toBe(
      OrbitCamera.smoothness[startupCamera]
    );
  });

  it('should match lighting defaults between XML and startup system', () => {
    const xml = '<root><light /></root>';
    const parsed = XMLParser.parse(xml);
    parseXMLToEntities(state, parsed.root);

    const xmlLight = state.query(Ambient)[0];
    const startupLight = startupState.query(Ambient)[0];

    expect(Ambient.skyColor[xmlLight]).toBe(Ambient.skyColor[startupLight]);
    expect(Ambient.groundColor[xmlLight]).toBe(
      Ambient.groundColor[startupLight]
    );
    expect(Ambient.intensity[xmlLight]).toBe(Ambient.intensity[startupLight]);

    expect(Directional.color[xmlLight]).toBe(Directional.color[startupLight]);
    expect(Directional.intensity[xmlLight]).toBe(
      Directional.intensity[startupLight]
    );
    expect(Directional.castShadow[xmlLight]).toBe(
      Directional.castShadow[startupLight]
    );
    expect(Directional.directionX[xmlLight]).toBe(
      Directional.directionX[startupLight]
    );
    expect(Directional.directionY[xmlLight]).toBe(
      Directional.directionY[startupLight]
    );
    expect(Directional.directionZ[xmlLight]).toBe(
      Directional.directionZ[startupLight]
    );
  });
});

describe('Startup Plugin - Individual Light Types', () => {
  let state: State;

  beforeEach(() => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.DOMParser = dom.window.DOMParser;

    state = new State();
    for (const plugin of DefaultPlugins) {
      state.registerPlugin(plugin);
    }
  });

  it('should handle ambient-light recipe separately', () => {
    const xml = '<root><ambient-light /></root>';
    const parsed = XMLParser.parse(xml);
    parseXMLToEntities(state, parsed.root);

    const ambient = state.query(Ambient)[0];
    expect(state.hasComponent(ambient, Ambient)).toBe(true);
    expect(state.hasComponent(ambient, Directional)).toBe(false);
  });

  it('should handle directional-light recipe separately', () => {
    const xml = '<root><directional-light /></root>';
    const parsed = XMLParser.parse(xml);
    parseXMLToEntities(state, parsed.root);

    const directional = state.query(Directional)[0];
    expect(state.hasComponent(directional, Ambient)).toBe(false);
    expect(state.hasComponent(directional, Directional)).toBe(true);
  });

  it('should handle combined light recipe', () => {
    const xml = '<root><light /></root>';
    const parsed = XMLParser.parse(xml);
    parseXMLToEntities(state, parsed.root);

    const light = state.query(Ambient)[0];
    expect(state.hasComponent(light, Ambient)).toBe(true);
    expect(state.hasComponent(light, Directional)).toBe(true);
  });
});
