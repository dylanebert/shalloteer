import type { Plugin } from 'vite';

export function shalloteer(): Plugin[] {
  return [
    {
      name: 'shalloteer',
      config: (config) => {
        config.resolve = config.resolve || {};
        config.resolve.alias = {
          ...config.resolve.alias,
          '@dimforge/rapier3d': '@dimforge/rapier3d-compat',
        };
      },
    },
  ];
}
