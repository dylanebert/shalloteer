import { type System } from '../../core';
import { InputState } from './components';
import {
  cleanupEventListeners,
  clearAllInput,
  resetFrameDeltas,
  setupEventListeners,
  updateInputState,
} from './utils';

export const InputSystem: System = {
  group: 'simulation',

  setup: () => {
    setupEventListeners();
    clearAllInput();
  },

  update: (state) => {
    const entities = state.query(InputState);

    for (const eid of entities) {
      updateInputState(eid);
    }

    resetFrameDeltas();
  },

  dispose: () => {
    cleanupEventListeners();
    clearAllInput();
  },
};
