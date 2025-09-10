import { JSX, type JSXElement } from '../runtime';
import type { 
  StaticPartProps, 
  DynamicPartProps, 
  KinematicPartProps,
  PlayerProps,
  CameraProps,
  AmbientLightProps,
  DirectionalLightProps,
  WorldProps
} from '../types/components';

export function StaticPart(props: StaticPartProps): JSXElement {
  const recipeProps = { ...props };
  
  return JSX.createElement('static-part', recipeProps, ...(props.children as JSXElement[] || []));
}

export function DynamicPart(props: DynamicPartProps): JSXElement {
  return JSX.createElement('dynamic-part', props, ...(props.children as JSXElement[] || []));
}

export function KinematicPart(props: KinematicPartProps): JSXElement {
  return JSX.createElement('kinematic-part', props, ...(props.children as JSXElement[] || []));
}

export function Player(props: PlayerProps): JSXElement {
  return JSX.createElement('player', props, ...(props.children as JSXElement[] || []));
}

export function Camera(props: CameraProps): JSXElement {
  return JSX.createElement('camera', props, ...(props.children as JSXElement[] || []));
}

export function AmbientLight(props: AmbientLightProps): JSXElement {
  return JSX.createElement('ambient-light', props, ...(props.children as JSXElement[] || []));
}

export function DirectionalLight(props: DirectionalLightProps): JSXElement {
  return JSX.createElement('directional-light', props, ...(props.children as JSXElement[] || []));
}

export function World(props: WorldProps): JSXElement {
  return JSX.createElement('world', props, ...(props.children as JSXElement[] || []));
}

export const Recipes = {
  StaticPart,
  DynamicPart,
  KinematicPart,
  Player,
  Camera,
  AmbientLight,
  DirectionalLight,
  World,
};