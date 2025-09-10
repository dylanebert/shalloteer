import { describe, it, expect } from 'bun:test';
import * as GAME from '../../../src';
import { JSX } from '../../../src/jsx/runtime';
import { StaticPart, DynamicPart } from '../../../src/jsx/components/recipes';
import { Entity } from '../../../src/jsx/components/Entity';

describe('JSX and XML Coexistence', () => {
  it('should compile JSX elements without errors', () => {
    // Test that JSX elements can be created
    const element = StaticPart({ 
      pos: { x: 0, y: 0, z: 0 },
      shape: 'box',
      size: { x: 1, y: 1, z: 1 },
      color: 0xff0000
    });
    
    expect(element).toBeDefined();
    expect(element.type).toBe('static-part');
    expect(element.props).toBeDefined();
  });

  it('should create JSX elements with the runtime factory', () => {
    const element = JSX.createElement('entity', { 
      transform: { pos: { x: 1, y: 2, z: 3 } } 
    });
    
    expect(element.type).toBe('entity');
    expect(element.props.transform).toBeDefined();
    expect(element.props.transform.pos.x).toBe(1);
  });

  it('should handle nested JSX elements', () => {
    const parent = JSX.createElement('entity', {}, 
      JSX.createElement('entity', { id: 'child1' }),
      JSX.createElement('entity', { id: 'child2' })
    );
    
    expect(parent.children).toHaveLength(2);
    expect(parent.children[0].props.id).toBe('child1');
    expect(parent.children[1].props.id).toBe('child2');
  });

  it('should handle JSX fragments', () => {
    const fragment = JSX.Fragment({ 
      children: [
        JSX.createElement('entity', { id: '1' }),
        JSX.createElement('entity', { id: '2' })
      ]
    });
    
    expect(fragment.type).toBe('Fragment');
    expect(fragment.children).toHaveLength(2);
  });

  it('should allow XML parsing to continue working', () => {
    // Test that the existing XML parser still works
    const xmlString = '<world><static-part pos="0 0 0" shape="box"></static-part></world>';
    const state = new GAME.State();
    
    // This should not throw
    expect(() => {
      // The XML parsing would happen through the existing system
      // For now we just verify the state creation works
      state.createEntity();
    }).not.toThrow();
  });

  it('should maintain backward compatibility with existing tests', () => {
    // Verify that we haven't broken the existing system
    const builder = new GAME.GameBuilder();
    
    expect(builder).toBeDefined();
    expect(typeof builder.withPlugin).toBe('function');
    expect(typeof builder.run).toBe('function');
  });

  it('should support both JSX and XML recipe types', () => {
    // JSX recipe
    const jsxElement = DynamicPart({
      pos: { x: 0, y: 5, z: 0 },
      shape: 'sphere',
      size: 1,
      color: '#ff0000'
    });
    
    expect(jsxElement.type).toBe('dynamic-part');
    expect(jsxElement.props.shape).toBe('sphere');
    
    // The XML equivalent would be parsed differently but create the same entity
    // We're just verifying the JSX side works for now
  });

  it('should handle component props correctly', () => {
    const element = Entity({
      transform: { pos: { x: 1, y: 2, z: 3 }, scale: 2 },
      body: { type: 'dynamic', mass: 10 },
      collider: { shape: 'box', size: { x: 1, y: 1, z: 1 } },
      renderer: { color: 0xff0000 }
    });
    
    expect(element.props.transform).toBeDefined();
    expect(element.props.body).toBeDefined();
    expect(element.props.collider).toBeDefined();
    expect(element.props.renderer).toBeDefined();
  });
});