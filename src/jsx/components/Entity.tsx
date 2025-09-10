import type { State } from '../../core';
import { JSX, type JSXElement } from '../runtime';
import type { EntityProps } from '../types/components';
import { createEntityFromRecipe } from '../../plugins/recipes/parser';

export function Entity(props: EntityProps): JSXElement {
  return JSX.createElement('entity', props, ...(props.children as JSXElement[] || []));
}

export function processEntityElement(
  state: State,
  props: EntityProps,
  children?: JSXElement[],
  parent?: number
): number {
  const entity = createEntityFromRecipe(state, 'entity', props);
  if (children) {
    for (const child of children) {
      if (child && typeof child === 'object' && 'type' in child) {
        processJSXChild(state, child, entity);
      }
    }
  }
  if (parent !== undefined) {
    const Parent = state.getComponent('Parent');
    if (Parent) {
      state.addComponent(entity, Parent, { entity: parent });
    }
  }
  
  return entity;
}

function processJSXChild(state: State, element: JSXElement, parent: number): void {
  if (element.type === 'entity' || typeof element.type === 'string') {
    processEntityElement(state, element.props, element.children, parent);
  } else if (typeof element.type === 'function') {
    const result = element.type(element.props);
    if (result) {
      processJSXChild(state, result, parent);
    }
  }
}