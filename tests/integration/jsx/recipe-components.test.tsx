import { describe, it, expect } from 'bun:test';
import { JSX } from '../../../src/jsx/runtime';
import { 
  StaticPart, 
  DynamicPart, 
  KinematicPart,
  Player,
  Camera,
  AmbientLight,
  DirectionalLight,
  World
} from '../../../src/jsx/components/recipes';

describe('Recipe JSX Components', () => {
  // Note: Most tests below are for JSX element creation only
  // They don't need ECS state or plugin initialization

  describe('StaticPart Component', () => {
    it('should create JSX element with correct type and props', () => {
      const element = StaticPart({ 
        pos: { x: 1, y: 2, z: 3 },
        shape: 'box',
        size: { x: 2, y: 2, z: 2 },
        color: 0xff0000
      });
      
      expect(element).toBeDefined();
      expect(element.type).toBe('static-part');
      expect(element.props.pos).toEqual({ x: 1, y: 2, z: 3 });
      expect(element.props.shape).toBe('box');
      expect(element.props.size).toEqual({ x: 2, y: 2, z: 2 });
      expect(element.props.color).toBe(0xff0000);
    });

    it('should handle string-based position and size', () => {
      const element = StaticPart({ 
        pos: "0 5 0",
        size: "1 1 1",
        shape: 'sphere',
        color: '#ff0000'
      });
      
      expect(element.type).toBe('static-part');
      expect(element.props.pos).toBe("0 5 0");
      expect(element.props.size).toBe("1 1 1");
      expect(element.props.color).toBe('#ff0000');
    });

    it('should handle single numeric size (broadcast)', () => {
      const element = StaticPart({ 
        pos: { x: 0, y: 0, z: 0 },
        size: 2,
        shape: 'box'
      });
      
      expect(element.props.size).toBe(2);
    });

    it('should handle children elements', () => {
      const child1 = JSX.createElement('entity', { id: 'child1' });
      const child2 = JSX.createElement('entity', { id: 'child2' });
      
      const element = StaticPart({ 
        pos: { x: 0, y: 0, z: 0 },
        children: [child1, child2]
      });
      
      expect(element.children).toHaveLength(2);
      expect(element.children[0].props.id).toBe('child1');
      expect(element.children[1].props.id).toBe('child2');
    });
  });

  describe('DynamicPart Component', () => {
    it('should create JSX element with dynamic properties', () => {
      const element = DynamicPart({ 
        pos: { x: 0, y: 5, z: 0 },
        shape: 'sphere',
        size: 1,
        color: '#00ff00',
        mass: 10
      });
      
      expect(element.type).toBe('dynamic-part');
      expect(element.props.shape).toBe('sphere');
      expect(element.props.mass).toBe(10);
    });

    it('should handle physics-specific properties', () => {
      const element = DynamicPart({ 
        pos: { x: 0, y: 10, z: 0 },
        body: {
          mass: 5,
          linearDamping: 0.1,
          angularDamping: 0.2,
          gravityScale: 2
        },
        collider: {
          restitution: 0.8,
          friction: 0.3
        }
      });
      
      expect(element.props.body.mass).toBe(5);
      expect(element.props.body.linearDamping).toBe(0.1);
      expect(element.props.collider.restitution).toBe(0.8);
    });
  });

  describe('KinematicPart Component', () => {
    it('should create JSX element for kinematic bodies', () => {
      const element = KinematicPart({ 
        pos: { x: 5, y: 2, z: 0 },
        shape: 'box',
        size: { x: 3, y: 0.5, z: 3 },
        color: 0x0000ff
      });
      
      expect(element.type).toBe('kinematic-part');
      expect(element.props.shape).toBe('box');
      expect(element.props.pos).toEqual({ x: 5, y: 2, z: 0 });
    });

    it('should support nested tween elements', () => {
      const tween = JSX.createElement('tween', {
        target: 'body.pos-y',
        from: 2,
        to: 5,
        duration: 3,
        loop: 'ping-pong'
      });
      
      const element = KinematicPart({
        pos: { x: 0, y: 2, z: 0 },
        children: [tween]
      });
      
      expect(element.children).toHaveLength(1);
      expect(element.children[0].type).toBe('tween');
      expect(element.children[0].props.loop).toBe('ping-pong');
    });
  });

  describe('Player Component', () => {
    it('should create player with custom properties', () => {
      const element = Player({ 
        pos: { x: 0, y: 10, z: 0 },
        speed: 8,
        jumpHeight: 3
      });
      
      expect(element.type).toBe('player');
      expect(element.props.pos).toEqual({ x: 0, y: 10, z: 0 });
      expect(element.props.speed).toBe(8);
      expect(element.props.jumpHeight).toBe(3);
    });

    it('should handle player-specific properties', () => {
      const element = Player({
        pos: "0 1 0",
        speed: 5.3,
        jumpHeight: 2.3,
        rotationSpeed: 10,
        cameraSensitivity: 0.007,
        cameraZoomSensitivity: 1.5
      });
      
      expect(element.props.speed).toBe(5.3);
      expect(element.props.rotationSpeed).toBe(10);
      expect(element.props.cameraSensitivity).toBe(0.007);
    });
  });

  describe('Camera Component', () => {
    it('should create camera with orbit settings', () => {
      const element = Camera({ 
        orbitCamera: {
          distance: 10,
          targetPitch: 0.5,
          minDistance: 2,
          maxDistance: 20
        }
      });
      
      expect(element.type).toBe('camera');
      expect(element.props.orbitCamera.distance).toBe(10);
      expect(element.props.orbitCamera.targetPitch).toBe(0.5);
      expect(element.props.orbitCamera.minDistance).toBe(2);
      expect(element.props.orbitCamera.maxDistance).toBe(20);
    });

    it('should handle boolean orbit camera flag', () => {
      const element = Camera({ 
        orbitCamera: true
      });
      
      expect(element.type).toBe('camera');
      expect(element.props.orbitCamera).toBe(true);
    });
  });

  describe('AmbientLight Component', () => {
    it('should create ambient light with colors', () => {
      const element = AmbientLight({ 
        skyColor: '#87ceeb',
        groundColor: '#4a4a4a',
        intensity: 0.8
      });
      
      expect(element.type).toBe('ambient-light');
      expect(element.props.skyColor).toBe('#87ceeb');
      expect(element.props.groundColor).toBe('#4a4a4a');
      expect(element.props.intensity).toBe(0.8);
    });

    it('should handle numeric color values', () => {
      const element = AmbientLight({ 
        skyColor: 0x87ceeb,
        groundColor: 0x4a4a4a,
        intensity: 0.6
      });
      
      expect(element.props.skyColor).toBe(0x87ceeb);
      expect(element.props.groundColor).toBe(0x4a4a4a);
    });
  });

  describe('DirectionalLight Component', () => {
    it('should create directional light with properties', () => {
      const element = DirectionalLight({ 
        color: '#ffffff',
        intensity: 1,
        direction: { x: -1, y: -2, z: -1 },
        castShadow: true
      });
      
      expect(element.type).toBe('directional-light');
      expect(element.props.color).toBe('#ffffff');
      expect(element.props.intensity).toBe(1);
      expect(element.props.direction).toEqual({ x: -1, y: -2, z: -1 });
      expect(element.props.castShadow).toBe(true);
    });

    it('should handle shadow map size', () => {
      const element = DirectionalLight({ 
        color: 0xffffff,
        shadowMapSize: 2048,
        distance: 50
      });
      
      expect(element.props.shadowMapSize).toBe(2048);
      expect(element.props.distance).toBe(50);
    });
  });

  describe('World Component', () => {
    it('should create world container with canvas', () => {
      const element = World({ 
        canvas: '#game-canvas',
        sky: '#87ceeb'
      });
      
      expect(element.type).toBe('world');
      expect(element.props.canvas).toBe('#game-canvas');
      expect(element.props.sky).toBe('#87ceeb');
    });

    it('should handle nested children', () => {
      const ground = StaticPart({ 
        pos: { x: 0, y: -0.5, z: 0 },
        shape: 'box',
        size: { x: 20, y: 1, z: 20 }
      });
      
      const ball = DynamicPart({ 
        pos: { x: 0, y: 5, z: 0 },
        shape: 'sphere',
        size: 1
      });
      
      const element = World({
        canvas: '#game-canvas',
        children: [ground, ball]
      });
      
      expect(element.children).toHaveLength(2);
      expect(element.children[0].type).toBe('static-part');
      expect(element.children[1].type).toBe('dynamic-part');
    });
  });

  // Entity Processing tests would require full state initialization
  // These are tested in the integration tests with full plugin setup

  describe('Recipe Integration', () => {
    it('should handle complex nested structure', () => {
      const world = World({
        canvas: '#game-canvas',
        sky: '#87ceeb',
        children: [
          StaticPart({ 
            pos: { x: 0, y: -0.5, z: 0 },
            shape: 'box',
            size: { x: 20, y: 1, z: 20 },
            color: '#90ee90'
          }),
          KinematicPart({
            pos: { x: 0, y: 3, z: 5 },
            shape: 'box',
            size: { x: 4, y: 0.5, z: 4 },
            color: '#4169e1',
            children: [
              JSX.createElement('tween', {
                target: 'body.pos-x',
                from: -10,
                to: 10,
                duration: 5,
                loop: 'ping-pong'
              })
            ]
          }),
          DynamicPart({ 
            pos: { x: -2, y: 10, z: 0 },
            shape: 'sphere',
            size: 1,
            color: '#ff0000'
          })
        ]
      });
      
      expect(world.type).toBe('world');
      expect(world.children).toHaveLength(3);
      expect(world.children[0].type).toBe('static-part');
      expect(world.children[1].type).toBe('kinematic-part');
      expect(world.children[1].children).toHaveLength(1);
      expect(world.children[2].type).toBe('dynamic-part');
    });
  });

  describe('Type Safety', () => {
    it('should accept valid shape types', () => {
      const shapes = ['box', 'sphere', 'cylinder', 'capsule', 'cone', 'torus', 'plane'] as const;
      
      shapes.forEach(shape => {
        const element = StaticPart({ 
          pos: { x: 0, y: 0, z: 0 },
          shape
        });
        expect(element.props.shape).toBe(shape);
      });
    });

    it('should handle all body types', () => {
      const bodyTypes = ['dynamic', 'fixed', 'kinematic-position', 'kinematic-velocity'] as const;
      
      bodyTypes.forEach(type => {
        const element = DynamicPart({ 
          pos: { x: 0, y: 0, z: 0 },
          body: { type }
        });
        expect(element.props.body.type).toBe(type);
      });
    });

    it('should handle all loop modes for tweens', () => {
      const loopModes = ['once', 'loop', 'ping-pong'] as const;
      
      loopModes.forEach(loop => {
        const tween = JSX.createElement('tween', {
          target: 'transform.pos-x',
          from: 0,
          to: 10,
          duration: 1,
          loop
        });
        expect(tween.props.loop).toBe(loop);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty props', () => {
      const element = StaticPart({});
      expect(element.type).toBe('static-part');
      expect(element.props).toBeDefined();
    });

    it('should handle undefined children', () => {
      const element = StaticPart({ 
        pos: { x: 0, y: 0, z: 0 },
        children: undefined
      });
      expect(element.children).toEqual([]);
    });

    it('should handle null children gracefully', () => {
      const element = StaticPart({ 
        pos: { x: 0, y: 0, z: 0 },
        children: null as any
      });
      expect(element.children).toEqual([]);
    });

    it('should handle mixed child types', () => {
      const validChild = JSX.createElement('entity', {});
      const nullChild = null;
      const undefinedChild = undefined;
      
      const element = StaticPart({ 
        pos: { x: 0, y: 0, z: 0 },
        children: [validChild, nullChild, undefinedChild] as any
      });
      
      expect(element.children).toHaveLength(3);
      expect(element.children[0]).toBe(validChild);
    });
  });
});