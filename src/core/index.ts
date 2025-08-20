export {
  addComponent,
  addEntity,
  createWorld,
  defineComponent,
  hasComponent,
  removeComponent,
  removeEntity,
  Types,
  type Component,
  type IWorld,
} from 'bitecs';

export { NULL_ENTITY, State, TIME_CONSTANTS } from './ecs';
export type {
  ComponentDefaults,
  ComponentEnums,
  Config,
  EnumMapping,
  GameTime,
  Parser,
  Plugin,
  Recipe,
  ShorthandMapping,
  System,
  ValidationRule,
} from './ecs';
export { lerp, slerp } from './math';
export { toCamelCase, toKebabCase } from './utils';
export {
  findElements,
  traverseElements,
  XMLParser,
  XMLValueParser,
} from './xml';
export type { ParsedElement, XMLValue } from './xml';
