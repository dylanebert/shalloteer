
export type Vector2 = { x: number; y: number } | number | string;
export type Vector3 = { x: number; y: number; z: number } | number | string;
export type Color = string | number;

export interface TransformProps {
  pos?: Vector3;
  scale?: Vector3;
  euler?: Vector3;
  rot?: never;
}

export interface BodyProps {
  type?: 'static' | 'dynamic' | 'kinematic';
  pos?: Vector3;
  euler?: Vector3;
  mass?: number;
  linearDamping?: number;
  angularDamping?: number;
  gravityScale?: number;
}

export interface ColliderProps {
  shape?: 'box' | 'sphere' | 'cylinder' | 'capsule' | 'cone' | 'torus' | 'plane';
  size?: Vector3;
  restitution?: number;
  friction?: number;
  density?: number;
  sensor?: boolean;
}

export interface RendererProps {
  shape?: 'box' | 'sphere' | 'cylinder' | 'capsule' | 'cone' | 'torus' | 'plane';
  size?: Vector3;
  color?: Color;
  castShadow?: boolean;
  receiveShadow?: boolean;
  visible?: boolean;
}

export interface OrbitCameraProps {
  distance?: number;
  minDistance?: number;
  maxDistance?: number;
  minPitch?: number;
  maxPitch?: number;
  targetPitch?: number;
  targetYaw?: number;
  sensitivity?: number;
  smoothing?: number;
  enabled?: boolean;
}

export interface PlayerProps extends EntityProps {
  pos?: Vector3;
  speed?: number;
  jumpHeight?: number;
  acceleration?: number;
  airControl?: number;
  enabled?: boolean;
}

export interface EntityProps {
  transform?: TransformProps | string;
  body?: BodyProps | string;
  collider?: ColliderProps | string;
  renderer?: RendererProps | string;
  children?: React.ReactNode;
  [key: string]: any;
}

export interface StaticPartProps extends EntityProps {
  pos?: Vector3;
  shape?: 'box' | 'sphere' | 'cylinder' | 'capsule' | 'cone' | 'torus' | 'plane';
  size?: Vector3;
  color?: Color;
}

export interface DynamicPartProps extends EntityProps {
  pos?: Vector3;
  shape?: 'box' | 'sphere' | 'cylinder' | 'capsule' | 'cone' | 'torus' | 'plane';
  size?: Vector3;
  color?: Color;
  mass?: number;
}

export interface KinematicPartProps extends EntityProps {
  pos?: Vector3;
  shape?: 'box' | 'sphere' | 'cylinder' | 'capsule' | 'cone' | 'torus' | 'plane';
  size?: Vector3;
  color?: Color;
}

export interface CameraProps extends EntityProps {
  orbitCamera?: OrbitCameraProps | string;
}

export interface AmbientLightProps extends EntityProps {
  skyColor?: Color;
  groundColor?: Color;
  intensity?: number;
}

export interface DirectionalLightProps extends EntityProps {
  color?: Color;
  intensity?: number;
  direction?: Vector3;
  castShadow?: boolean;
}

export interface WorldProps {
  canvas: string;
  sky?: Color;
  children?: React.ReactNode;
}