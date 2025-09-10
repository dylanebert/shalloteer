import type { State } from '../core';
import type { EntityProps } from './types/components';

type ComponentWithFields = Record<
  string,
  Float32Array | Int32Array | Uint8Array | Uint16Array | Uint32Array
>;

export function createEntityFromJSXProps(
  state: State,
  props: EntityProps,
  parent?: number
): number {
  const entity = state.createEntity();

  for (const [propName, propValue] of Object.entries(props)) {
    if (propName === 'children' || propName === 'key' || propName === 'ref') {
      continue;
    }

    const component = state.getComponent(propName);
    if (component) {
      state.addComponent(entity, component);

      if (typeof propValue === 'object' && propValue !== null && !Array.isArray(propValue)) {
        applyComponentProperties(entity, component as ComponentWithFields, propValue);
      }
    }
    else if (isShorthandProp(propName)) {
      applyShorthandProp(entity, propName, propValue, state);
    }
  }

  if (parent !== undefined) {
    const ParentComponent = state.getComponent('Parent');
    if (ParentComponent) {
      state.addComponent(entity, ParentComponent, { entity: parent });
    }
  }

  return entity;
}

function applyComponentProperties(
  entity: number,
  component: ComponentWithFields,
  properties: Record<string, any>
): void {
  for (const [fieldName, value] of Object.entries(properties)) {
    const camelField = toCamelCase(fieldName);
    if (camelField in component) {
      const convertedValue = convertValue(value, camelField);
      if (Array.isArray(component[camelField])) {
        component[camelField][entity] = convertedValue;
      }
    }
  }
}

function applyShorthandProp(
  entity: number,
  propName: string,
  propValue: any,
  state: State
): void {
  const shorthandMappings: Record<string, Array<{ component: string; fields: string[] }>> = {
    pos: [
      { component: 'Transform', fields: ['posX', 'posY', 'posZ'] },
      { component: 'Body', fields: ['posX', 'posY', 'posZ'] },
      { component: 'Respawn', fields: ['posX', 'posY', 'posZ'] }
    ],
    size: [
      { component: 'Collider', fields: ['sizeX', 'sizeY', 'sizeZ'] },
      { component: 'Renderer', fields: ['sizeX', 'sizeY', 'sizeZ'] }
    ],
    color: [
      { component: 'Renderer', fields: ['color'] },
      { component: 'Ambient', fields: ['skyColor', 'groundColor'] },
      { component: 'Directional', fields: ['color'] }
    ],
    shape: [
      { component: 'Collider', fields: ['shape'] },
      { component: 'Renderer', fields: ['shape'] }
    ],
    euler: [
      { component: 'Transform', fields: ['eulerX', 'eulerY', 'eulerZ'] },
      { component: 'Body', fields: ['eulerX', 'eulerY', 'eulerZ'] },
      { component: 'Respawn', fields: ['eulerX', 'eulerY', 'eulerZ'] }
    ],
    scale: [
      { component: 'Transform', fields: ['scaleX', 'scaleY', 'scaleZ'] }
    ]
  };

  const mappings = shorthandMappings[propName];
  if (!mappings) return;

  for (const mapping of mappings) {
    const component = state.getComponent(mapping.component);
    if (component && state.hasComponent(entity, component)) {
      applyShorthandToComponent(
        entity,
        component as ComponentWithFields,
        mapping.fields,
        propValue
      );
    }
  }
}

function applyShorthandToComponent(
  entity: number,
  component: ComponentWithFields,
  fields: string[],
  value: any
): void {
  if (fields.length === 1) {
    const field = fields[0];
    if (field in component) {
      component[field][entity] = convertValue(value, field);
    }
  } else if (fields.length === 3) {
    const vector = parseVector3(value);
    if (vector) {
      for (let i = 0; i < 3; i++) {
        if (fields[i] in component) {
          component[fields[i]][entity] = [vector.x, vector.y, vector.z][i];
        }
      }
    }
  }
}

function parseVector3(value: any): { x: number; y: number; z: number } | null {
  if (typeof value === 'object' && value !== null) {
    if ('x' in value && 'y' in value && 'z' in value) {
      return {
        x: Number(value.x) || 0,
        y: Number(value.y) || 0,
        z: Number(value.z) || 0
      };
    }
  } else if (typeof value === 'string') {
    const parts = value.trim().split(/\s+/).map(Number);
    if (parts.length === 3 && parts.every(n => !isNaN(n))) {
      return { x: parts[0], y: parts[1], z: parts[2] };
    }
  } else if (typeof value === 'number') {
    return { x: value, y: value, z: value };
  }
  return null;
}

function convertValue(value: any, fieldName: string): number {
  if (fieldName.toLowerCase().includes('color')) {
    return parseColor(value);
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return num;
    }
    if (value === 'true') return 1;
    if (value === 'false') return 0;
  }

  return 0;
}

function parseColor(value: any): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    if (value.startsWith('#')) {
      return parseInt(value.slice(1), 16);
    }
    if (value.startsWith('rgb')) {
      const match = value.match(/\d+/g);
      if (match && match.length >= 3) {
        const r = parseInt(match[0]);
        const g = parseInt(match[1]);
        const b = parseInt(match[2]);
        return (r << 16) | (g << 8) | b;
      }
    }
  }
  return 0xffffff;
}

function isShorthandProp(propName: string): boolean {
  const shorthands = ['pos', 'size', 'color', 'shape', 'euler', 'scale', 'rotation'];
  return shorthands.includes(propName);
}

function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function createEntityFromRecipeJSX(
  state: State,
  recipeName: string,
  props: EntityProps,
  parent?: number
): number {
  const recipeComponentMap: Record<string, string[]> = {
    'static-part': ['Transform', 'Body', 'Collider', 'Renderer', 'Respawn'],
    'dynamic-part': ['Transform', 'Body', 'Collider', 'Renderer', 'Respawn'],
    'kinematic-part': ['Transform', 'Body', 'Collider', 'Renderer', 'Respawn'],
    'player': ['Transform', 'Body', 'Collider', 'CharacterController', 'CharacterMovement', 'Player', 'InputState', 'Respawn'],
    'camera': ['Transform', 'WorldTransform', 'OrbitCamera', 'MainCamera'],
    'ambient-light': ['Ambient'],
    'directional-light': ['Directional'],
    'entity': []
  };

  const entity = state.createEntity();

  const components = recipeComponentMap[recipeName] || [];
  for (const componentName of components) {
    const component = state.getComponent(componentName);
    if (component) {
      state.addComponent(entity, component);
      applyRecipeDefaults(entity, component as ComponentWithFields, recipeName, componentName);
    }
  }

  for (const [propName, propValue] of Object.entries(props)) {
    if (propName === 'children' || propName === 'key' || propName === 'ref') {
      continue;
    }

    const component = state.getComponent(propName);
    if (component) {
      if (!state.hasComponent(entity, component)) {
        state.addComponent(entity, component);
      }
      if (typeof propValue === 'object' && propValue !== null && !Array.isArray(propValue)) {
        applyComponentProperties(entity, component as ComponentWithFields, propValue);
      }
    } else if (isShorthandProp(propName)) {
      applyShorthandToRecipeEntity(entity, propName, propValue, components, state);
    }
  }

  if (parent !== undefined) {
    const ParentComponent = state.getComponent('Parent');
    if (ParentComponent) {
      state.addComponent(entity, ParentComponent, { entity: parent });
    }
  }

  return entity;
}

function applyRecipeDefaults(
  entity: number,
  component: ComponentWithFields,
  recipeName: string,
  componentName: string
): void {
  const recipeOverrides: Record<string, Record<string, Record<string, number>>> = {
    'static-part': {
      'Body': { type: 1 }
    },
    'dynamic-part': {
      'Body': { type: 0 }
    },
    'kinematic-part': {
      'Body': { type: 2 }
    }
  };

  const overrides = recipeOverrides[recipeName]?.[componentName];
  if (overrides) {
    for (const [fieldName, value] of Object.entries(overrides)) {
      if (fieldName in component) {
        component[fieldName][entity] = value;
      }
    }
  }
}

function applyShorthandToRecipeEntity(
  entity: number,
  propName: string,
  propValue: any,
  componentNames: string[],
  state: State
): void {
  const shorthandComponentMap: Record<string, string[]> = {
    pos: ['Transform', 'Body', 'Respawn'],
    size: ['Collider', 'Renderer'],
    color: ['Renderer', 'Ambient', 'Directional'],
    shape: ['Collider', 'Renderer'],
    euler: ['Transform', 'Body', 'Respawn'],
    scale: ['Transform']
  };

  const applicableComponents = shorthandComponentMap[propName] || [];
  
  for (const componentName of applicableComponents) {
    if (componentNames.includes(componentName)) {
      const component = state.getComponent(componentName);
      if (component && state.hasComponent(entity, component)) {
        const fieldMap: Record<string, Record<string, string[]>> = {
          pos: {
            Transform: ['posX', 'posY', 'posZ'],
            Body: ['posX', 'posY', 'posZ'],
            Respawn: ['posX', 'posY', 'posZ']
          },
          size: {
            Collider: ['sizeX', 'sizeY', 'sizeZ'],
            Renderer: ['sizeX', 'sizeY', 'sizeZ']
          },
          color: {
            Renderer: ['color'],
            Ambient: ['skyColor'],
            Directional: ['color']
          },
          shape: {
            Collider: ['shape'],
            Renderer: ['shape']
          },
          euler: {
            Transform: ['eulerX', 'eulerY', 'eulerZ'],
            Body: ['eulerX', 'eulerY', 'eulerZ'],
            Respawn: ['eulerX', 'eulerY', 'eulerZ']
          },
          scale: {
            Transform: ['scaleX', 'scaleY', 'scaleZ']
          }
        };

        const fields = fieldMap[propName]?.[componentName];
        if (fields) {
          applyShorthandToComponent(entity, component as ComponentWithFields, fields, propValue);
        }
      }
    }
  }
}