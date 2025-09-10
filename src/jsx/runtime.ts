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

export function processJSXElement(
  state: State,
  element: JSXElement,
  parent?: number
): number | null {
  if (element.type === 'Fragment') {
    element.children.forEach((child) => processJSXElement(state, child, parent));
    return null;
  }

  console.warn('JSX element processing not yet implemented:', element);
  return null;
}

declare global {
  namespace JSX {
    interface Element extends JSXElement {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}