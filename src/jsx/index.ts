export { JSX, type JSXElement, type JSXFactory, processJSXElement } from './runtime';

export {
  StaticPart,
  DynamicPart,
  KinematicPart,
  Player,
  Camera,
  AmbientLight,
  DirectionalLight,
  World,
  Tween,
} from './components/recipes';

export { Entity } from './components/Entity';

export { createEntityFromJSXProps } from './entity-creator';

export type {
  EntityProps,
  StaticPartProps,
  DynamicPartProps,
  KinematicPartProps,
  PlayerProps,
  CameraProps,
  AmbientLightProps,
  DirectionalLightProps,
  WorldProps,
} from './types/components';