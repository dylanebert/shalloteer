import type { System } from '../../core';
import { WorldTransform } from '../transforms';
import { Respawn } from './components';
import { respawnEntity } from './utils';

export const RespawnSystem: System = {
  group: 'simulation',
  update: (state) => {
    const respawns = state.query(Respawn, WorldTransform);

    for (const entity of respawns) {
      if (WorldTransform.posY[entity] < -100) {
        respawnEntity(state, entity);
      }
    }
  },
};
