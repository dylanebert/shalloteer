import { type System } from '../../core';
import { Transform, WorldTransform } from '../transforms';
import * as THREE from 'three';
import { OrbitCamera } from './components';
import {
  calculateCameraPosition,
  smoothCameraRotation,
  updateCameraTransform,
} from './operations';

export const OrbitCameraSystem: System = {
  group: 'draw',
  update: (state) => {
    const cameraEntities = state.query(OrbitCamera, Transform);

    for (const cameraEntity of cameraEntities) {
      const targetEntity = OrbitCamera.target[cameraEntity];
      if (!targetEntity || !state.hasComponent(targetEntity, WorldTransform)) {
        continue;
      }

      smoothCameraRotation(cameraEntity, state.time.deltaTime);

      const targetPosition = new THREE.Vector3(
        WorldTransform.posX[targetEntity] + OrbitCamera.offsetX[cameraEntity],
        WorldTransform.posY[targetEntity] + OrbitCamera.offsetY[cameraEntity],
        WorldTransform.posZ[targetEntity] + OrbitCamera.offsetZ[cameraEntity]
      );

      const cameraPosition = calculateCameraPosition(
        cameraEntity,
        targetPosition
      );
      updateCameraTransform(cameraEntity, cameraPosition, targetPosition);
    }
  },
};
