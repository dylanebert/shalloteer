import type { BuilderOptions } from './builder';
import { GameBuilder } from './builder';
import type { Component, Plugin, System } from './core';
import type { JSXElement } from './jsx';
export { DefaultPlugins } from './plugins/defaults';
export { GameBuilder } from './builder';

export * from './core';
export * from './plugins/animation';
export * from './plugins/input';
export * from './plugins/orbit-camera';
export * from './plugins/physics';
export * from './plugins/player';
export * from './plugins/recipes';
export * from './plugins/rendering';
export * from './plugins/respawn';
export * from './plugins/startup';
export * from './plugins/transforms';
export * from './plugins/tweening';
export type { BuilderOptions };

let globalBuilder: GameBuilder | null = null;

function getBuilder(): GameBuilder {
  if (!globalBuilder) {
    globalBuilder = new GameBuilder();
  }
  return globalBuilder;
}

export function withPlugin(plugin: Plugin) {
  return getBuilder().withPlugin(plugin);
}

export function withoutDefaultPlugins() {
  return getBuilder().withoutDefaultPlugins();
}

export function withSystem(system: System) {
  return getBuilder().withSystem(system);
}

export function withComponent(name: string, component: Component) {
  return getBuilder().withComponent(name, component);
}

export function configure(options: BuilderOptions) {
  return getBuilder().configure(options);
}

export function withJSX(element: JSXElement) {
  return getBuilder().withJSX(element);
}

export function run() {
  const builder = getBuilder();
  globalBuilder = null;
  return builder.run();
}
