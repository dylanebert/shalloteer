import { TIME_CONSTANTS } from './constants';
import { sortSystemsByConstraints } from './ordering';
import type { State } from './state';
import { System } from './types';

export class Scheduler {
  private accumulator = 0;
  private readonly setup = new WeakSet<System>();

  getAccumulator(): number {
    return this.accumulator;
  }

  step(state: State, deltaTime = TIME_CONSTANTS.DEFAULT_DELTA) {
    const fixedDeltaTime = TIME_CONSTANTS.FIXED_TIMESTEP;
    const mutableTime = state.time as { deltaTime: number; elapsed: number };

    mutableTime.deltaTime = deltaTime;
    mutableTime.elapsed += deltaTime;
    this.accumulator += deltaTime;

    this.runSystemGroup(state, 'setup');

    while (this.accumulator >= fixedDeltaTime) {
      mutableTime.deltaTime = fixedDeltaTime;
      this.runSystemGroup(state, 'fixed');
      this.accumulator -= fixedDeltaTime;
    }

    mutableTime.deltaTime = deltaTime;
    this.runSystemGroup(state, 'simulation');
    this.runSystemGroup(state, 'draw');
  }

  private runSystemGroup(
    state: State,
    group: 'setup' | 'simulation' | 'fixed' | 'draw'
  ) {
    const systems = this.getSystemsByGroup(state, group);
    for (const system of systems) {
      if (!this.setup.has(system)) {
        system.setup?.(state);
        this.setup.add(system);
      }
      system.update?.(state);
    }
  }

  private getSystemsByGroup(
    state: State,
    group: 'setup' | 'simulation' | 'fixed' | 'draw'
  ): System[] {
    const allSystems = Array.from(state.systems);
    const systems = allSystems.filter(
      (system) => (system.group ?? 'simulation') === group
    );

    return sortSystemsByConstraints(systems, group, allSystems);
  }
}
