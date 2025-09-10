import type { State } from '../core';

export type JSXElement = {
  type: string | ((props: any) => JSXElement);
  props: Record<string, any>;
  children: JSXElement[];
};

export type JSXFactory = {
  createElement: (
    type: string | ((props: any) => JSXElement),
    props: Record<string, any> | null,
    ...children: JSXElement[]
  ) => JSXElement;
  Fragment: (props: { children?: JSXElement[] }) => JSXElement;
};

export const JSX: JSXFactory = {
  createElement(type, props, ...children) {
    return {
      type,
      props: props || {},
      children: children.flat(),
    };
  },
  Fragment({ children = [] }) {
    return {
      type: 'Fragment',
      props: {},
      children,
    };
  },
};

function applyPropsToEntity(
  state: State,
  entity: number,
  props: Record<string, any>
): void {
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
        for (const [fieldName, value] of Object.entries(propValue)) {
          if (fieldName in component) {
            (component as any)[fieldName][entity] = value;
          }
        }
      }
    }
  }
}

export function processJSXElement(
  state: State,
  element: JSXElement,
  parent?: number
): number | null {
  if (element.type === 'Fragment') {
    element.children.forEach((child) => processJSXElement(state, child, parent));
    return null;
  }

  if (typeof element.type === 'function') {
    const resultElement = element.type(element.props);
    return processJSXElement(state, resultElement, parent);
  }

  const tagName = element.type;
  
  if (tagName === 'tween' && parent !== undefined) {
    const parser = state.getParser('tween');
    if (parser) {
      const parsedElement = {
        tagName: 'tween',
        attributes: element.props,
        children: [],
      };
      return parser(parent, parsedElement as any, state);
    } else {
      console.warn('Tween parser not found - ensure TweenPlugin is loaded');
      return null;
    }
  }
  
  const recipe = state.getRecipe(tagName);
  
  let entity: number;
  
  if (recipe) {
    entity = state.createEntity();
    
    for (const componentName of recipe.components || []) {
      const component = state.getComponent(componentName);
      if (component) {
        state.addComponent(entity, component);
      }
    }
    
    if (element.props) {
      applyPropsToEntity(state, entity, element.props);
    }
  } else if (tagName === 'entity') {
    entity = state.createEntity();
    
    if (element.props) {
      applyPropsToEntity(state, entity, element.props);
    }
  } else {
    console.warn(`Unknown JSX element type: ${tagName}`);
    return null;
  }
  
  if (parent !== undefined) {
    const ParentComponent = state.getComponent('Parent');
    if (ParentComponent) {
      state.addComponent(entity, ParentComponent, { entity: parent });
    }
  }
  
  if (element.children) {
    for (const child of element.children) {
      processJSXElement(state, child, entity);
    }
  }
  
  return entity;
}

declare global {
  namespace JSX {
    interface Element extends JSXElement {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}