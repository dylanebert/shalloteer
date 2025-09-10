import type { State } from '../../core';
import { JSX, type JSXElement } from '../runtime';
import type { EntityProps } from '../types/components';
import { createEntityFromJSXProps, createEntityFromRecipeJSX } from '../entity-creator';

export function Entity(props: EntityProps): JSXElement {
  return JSX.createElement('entity', props, ...(props.children as JSXElement[] || []));
}

export function processEntityElement(
  state: State,
  props: EntityProps,
  children?: JSXElement[],
  parent?: number
): number {
  const entity = createEntityFromJSXProps(state, props, parent);
  
  if (children) {
    for (const child of children) {
      if (child && typeof child === 'object' && 'type' in child) {
        processJSXChild(state, child, entity);
      }
    }
  }
  
  return entity;
}

export function processRecipeElement(
  state: State,
  recipeName: string,
  props: EntityProps,
  children?: JSXElement[],
  parent?: number
): number {
  const entity = createEntityFromRecipeJSX(state, recipeName, props, parent);
  
  if (children) {
    for (const child of children) {
      if (child && typeof child === 'object' && 'type' in child) {
        processJSXChild(state, child, entity);
      }
    }
  }
  
  return entity;
}

function processJSXChild(state: State, element: JSXElement, parent: number): void {
  if (typeof element.type === 'string') {
    const recipeNames = ['static-part', 'dynamic-part', 'kinematic-part', 'player', 'camera', 'ambient-light', 'directional-light'];
    if (recipeNames.includes(element.type)) {
      processRecipeElement(state, element.type, element.props, element.children, parent);
    } else if (element.type === 'entity') {
      processEntityElement(state, element.props, element.children, parent);
    }
  } else if (typeof element.type === 'function') {
    const result = element.type(element.props);
    if (result) {
      processJSXChild(state, result, parent);
    }
  }
}