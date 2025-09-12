import { beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { State, TIME_CONSTANTS, defineQuery } from 'shalloteer';
import {
  Body,
  BodyType,
  CharacterController,
  CharacterMovement,
  Collider,
  ColliderShape,
  initializePhysics,
  PhysicsPlugin,
  PhysicsWorld,
} from 'shalloteer';
import { Transform } from 'shalloteer';

describe('Character Controller Integration', () => {
  let state: State;

  beforeAll(async () => {
    await initializePhysics();
  });

  beforeEach(() => {
    state = new State();
    state.registerPlugin(PhysicsPlugin);

    state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
  });

  it('should initialize character controller', () => {
    const character = state.createEntity();
    state.addComponent(character, Body);
    state.addComponent(character, Collider);
    state.addComponent(character, CharacterController);
    state.addComponent(character, CharacterMovement);
    state.addComponent(character, Transform);

    Body.type[character] = BodyType.KinematicPositionBased;
    Body.posX[character] = 0;
    Body.posY[character] = 5;
    Body.posZ[character] = 0;
    Body.rotW[character] = 1;

    Collider.shape[character] = ColliderShape.Capsule;
    Collider.radius[character] = 0.5;
    Collider.height[character] = 1;

    CharacterController.offset[character] = 0.01;
    CharacterController.maxSlope[character] = 45 * (Math.PI / 180);
    CharacterController.upX[character] = 0;
    CharacterController.upY[character] = 1;
    CharacterController.upZ[character] = 0;

    state.step(TIME_CONSTANTS.FIXED_TIMESTEP);

    expect(CharacterController.offset[character]).toBeCloseTo(0.01);
    expect(CharacterController.maxSlope[character]).toBeCloseTo(
      45 * (Math.PI / 180)
    );
  });

  it('should move character based on desired velocity', () => {
    const floor = state.createEntity();
    state.addComponent(floor, Body);
    state.addComponent(floor, Collider);
    state.addComponent(floor, Transform);

    Body.type[floor] = BodyType.Fixed;
    Body.posY[floor] = 0;
    Body.rotW[floor] = 1;

    Collider.shape[floor] = ColliderShape.Box;
    Collider.sizeX[floor] = 100;
    Collider.sizeY[floor] = 1;
    Collider.sizeZ[floor] = 100;

    const character = state.createEntity();
    state.addComponent(character, Body);
    state.addComponent(character, Collider);
    state.addComponent(character, CharacterController);
    state.addComponent(character, CharacterMovement);
    state.addComponent(character, Transform);

    Body.type[character] = BodyType.KinematicPositionBased;
    Body.posX[character] = 0;
    Body.posY[character] = 2;
    Body.posZ[character] = 0;
    Body.rotW[character] = 1;

    Collider.shape[character] = ColliderShape.Capsule;
    Collider.radius[character] = 0.5;
    Collider.height[character] = 1;

    CharacterController.offset[character] = 0.01;
    CharacterController.upY[character] = 1;

    CharacterMovement.desiredVelX[character] = 5;
    CharacterMovement.desiredVelY[character] = 0;
    CharacterMovement.desiredVelZ[character] = 0;
    CharacterMovement.velocityY[character] = 0;

    const initialX = Body.posX[character];

    for (let i = 0; i < 10; i++) {
      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
    }

    expect(Body.posX[character]).toBeGreaterThan(initialX);
  });

  it('should detect grounded state', () => {
    const floor = state.createEntity();
    state.addComponent(floor, Body);
    state.addComponent(floor, Collider);
    state.addComponent(floor, Transform);

    Body.type[floor] = BodyType.Fixed;
    Body.posY[floor] = 0;
    Body.rotW[floor] = 1;

    Collider.shape[floor] = ColliderShape.Box;
    Collider.sizeX[floor] = 100;
    Collider.sizeY[floor] = 1;
    Collider.sizeZ[floor] = 100;

    const character = state.createEntity();
    state.addComponent(character, Body);
    state.addComponent(character, Collider);
    state.addComponent(character, CharacterController);
    state.addComponent(character, CharacterMovement);
    state.addComponent(character, Transform);

    Body.type[character] = BodyType.KinematicPositionBased;
    Body.posX[character] = 0;
    Body.posY[character] = 2;
    Body.posZ[character] = 0;
    Body.rotW[character] = 1;

    Collider.shape[character] = ColliderShape.Capsule;
    Collider.radius[character] = 0.5;
    Collider.height[character] = 1;

    CharacterController.offset[character] = 0.01;
    CharacterController.snapDist[character] = 0.5;
    CharacterController.upY[character] = 1;

    const worldEntities = defineQuery([PhysicsWorld])(state.world);
    if (worldEntities.length > 0) {
      PhysicsWorld.gravityY[worldEntities[0]] = -9.81;
    }

    CharacterMovement.desiredVelY[character] = -5;

    for (let i = 0; i < 30; i++) {
      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
    }

    expect(CharacterController.grounded[character]).toBe(1);
  });

  it('should handle slopes within max angle', () => {
    const slope = state.createEntity();
    state.addComponent(slope, Body);
    state.addComponent(slope, Collider);
    state.addComponent(slope, Transform);

    Body.type[slope] = BodyType.Fixed;
    Body.posY[slope] = 0;
    Body.rotX[slope] = 0.2;
    Body.rotW[slope] = 0.98;

    Collider.shape[slope] = ColliderShape.Box;
    Collider.sizeX[slope] = 100;
    Collider.sizeY[slope] = 1;
    Collider.sizeZ[slope] = 100;

    const character = state.createEntity();
    state.addComponent(character, Body);
    state.addComponent(character, Collider);
    state.addComponent(character, CharacterController);
    state.addComponent(character, CharacterMovement);
    state.addComponent(character, Transform);

    Body.type[character] = BodyType.KinematicPositionBased;
    Body.posX[character] = 0;
    Body.posY[character] = 2;
    Body.posZ[character] = 0;
    Body.rotW[character] = 1;

    Collider.shape[character] = ColliderShape.Capsule;
    Collider.radius[character] = 0.5;
    Collider.height[character] = 1;

    CharacterController.offset[character] = 0.01;
    CharacterController.maxSlope[character] = 45 * (Math.PI / 180);
    CharacterController.upY[character] = 1;

    CharacterMovement.desiredVelX[character] = 3;
    CharacterMovement.desiredVelY[character] = -5;
    CharacterMovement.desiredVelZ[character] = 0;

    const initialX = Body.posX[character];

    for (let i = 0; i < 30; i++) {
      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
    }

    expect(Body.posX[character]).toBeGreaterThan(initialX);
  });

  it('should handle auto-stepping', () => {
    const floor = state.createEntity();
    state.addComponent(floor, Body);
    state.addComponent(floor, Collider);
    state.addComponent(floor, Transform);

    Body.type[floor] = BodyType.Fixed;
    Body.posY[floor] = 0;
    Body.rotW[floor] = 1;

    Collider.shape[floor] = ColliderShape.Box;
    Collider.sizeX[floor] = 100;
    Collider.sizeY[floor] = 1;
    Collider.sizeZ[floor] = 100;

    const step = state.createEntity();
    state.addComponent(step, Body);
    state.addComponent(step, Collider);
    state.addComponent(step, Transform);

    Body.type[step] = BodyType.Fixed;
    Body.posX[step] = 3;
    Body.posY[step] = 0.25;
    Body.posZ[step] = 0;
    Body.rotW[step] = 1;

    Collider.shape[step] = ColliderShape.Box;
    Collider.sizeX[step] = 2;
    Collider.sizeY[step] = 0.5;
    Collider.sizeZ[step] = 10;

    const character = state.createEntity();
    state.addComponent(character, Body);
    state.addComponent(character, Collider);
    state.addComponent(character, CharacterController);
    state.addComponent(character, CharacterMovement);
    state.addComponent(character, Transform);

    Body.type[character] = BodyType.KinematicPositionBased;
    Body.posX[character] = 0;
    Body.posY[character] = 1;
    Body.posZ[character] = 0;
    Body.rotW[character] = 1;

    Collider.shape[character] = ColliderShape.Capsule;
    Collider.radius[character] = 0.5;
    Collider.height[character] = 1;

    CharacterController.offset[character] = 0.01;
    CharacterController.autoStep[character] = 1;
    CharacterController.maxStepHeight[character] = 0.3;
    CharacterController.minStepWidth[character] = 0.1;
    CharacterController.upY[character] = 1;

    CharacterMovement.desiredVelX[character] = 5;
    CharacterMovement.desiredVelY[character] = 0;
    CharacterMovement.desiredVelZ[character] = 0;
    CharacterMovement.velocityY[character] = 0;

    const initialX = Body.posX[character];

    for (let i = 0; i < 30; i++) {
      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
    }

    expect(Body.posX[character]).toBeGreaterThan(initialX + 1);
  });

  it('should fall with gravity when not grounded', () => {
    const character = state.createEntity();
    state.addComponent(character, Body);
    state.addComponent(character, Collider);
    state.addComponent(character, CharacterController);
    state.addComponent(character, CharacterMovement);
    state.addComponent(character, Transform);

    Body.type[character] = BodyType.KinematicPositionBased;
    Body.posX[character] = 0;
    Body.posY[character] = 10;
    Body.posZ[character] = 0;
    Body.rotW[character] = 1;
    Body.gravityScale[character] = 1;

    Collider.shape[character] = ColliderShape.Capsule;
    Collider.radius[character] = 0.5;
    Collider.height[character] = 1;

    CharacterController.offset[character] = 0.01;
    CharacterController.upY[character] = 1;

    CharacterMovement.desiredVelX[character] = 0;
    CharacterMovement.desiredVelY[character] = 0;
    CharacterMovement.desiredVelZ[character] = 0;
    CharacterMovement.velocityY[character] = 0;

    const initialY = Body.posY[character];

    for (let i = 0; i < 30; i++) {
      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
    }

    expect(Body.posY[character]).toBeLessThan(initialY);
    expect(CharacterMovement.velocityY[character]).toBeLessThan(0);
    expect(CharacterController.grounded[character]).toBe(0);
  });

  it('should reset vertical velocity when becoming grounded', () => {
    const floor = state.createEntity();
    state.addComponent(floor, Body);
    state.addComponent(floor, Collider);
    state.addComponent(floor, Transform);

    Body.type[floor] = BodyType.Fixed;
    Body.posY[floor] = 0;
    Body.rotW[floor] = 1;

    Collider.shape[floor] = ColliderShape.Box;
    Collider.sizeX[floor] = 100;
    Collider.sizeY[floor] = 1;
    Collider.sizeZ[floor] = 100;

    const character = state.createEntity();
    state.addComponent(character, Body);
    state.addComponent(character, Collider);
    state.addComponent(character, CharacterController);
    state.addComponent(character, CharacterMovement);
    state.addComponent(character, Transform);

    Body.type[character] = BodyType.KinematicPositionBased;
    Body.posX[character] = 0;
    Body.posY[character] = 5;
    Body.posZ[character] = 0;
    Body.rotW[character] = 1;
    Body.gravityScale[character] = 1;

    Collider.shape[character] = ColliderShape.Capsule;
    Collider.radius[character] = 0.5;
    Collider.height[character] = 1;

    CharacterController.offset[character] = 0.01;
    CharacterController.upY[character] = 1;

    CharacterMovement.desiredVelX[character] = 0;
    CharacterMovement.desiredVelY[character] = 0;
    CharacterMovement.desiredVelZ[character] = 0;
    CharacterMovement.velocityY[character] = 0;

    // Let character fall
    for (let i = 0; i < 10; i++) {
      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
    }

    // Should be falling
    expect(CharacterMovement.velocityY[character]).toBeLessThan(0);
    expect(CharacterController.grounded[character]).toBe(0);

    // Continue until grounded
    for (let i = 0; i < 50; i++) {
      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
    }

    // Should be grounded with velocity reset
    expect(CharacterController.grounded[character]).toBe(1);
    expect(CharacterMovement.velocityY[character]).toBe(0);
  });

  it('should push dynamic objects', () => {
    const floor = state.createEntity();
    state.addComponent(floor, Body);
    state.addComponent(floor, Collider);
    state.addComponent(floor, Transform);

    Body.type[floor] = BodyType.Fixed;
    Body.posY[floor] = 0;
    Body.rotW[floor] = 1;

    Collider.shape[floor] = ColliderShape.Box;
    Collider.sizeX[floor] = 100;
    Collider.sizeY[floor] = 1;
    Collider.sizeZ[floor] = 100;

    const box = state.createEntity();
    state.addComponent(box, Body);
    state.addComponent(box, Collider);
    state.addComponent(box, Transform);

    Body.type[box] = BodyType.Dynamic;
    Body.posX[box] = 3;
    Body.posY[box] = 1;
    Body.posZ[box] = 0;
    Body.rotW[box] = 1;
    Body.mass[box] = 1;
    Body.gravityScale[box] = 1;

    Collider.shape[box] = ColliderShape.Box;
    Collider.sizeX[box] = 0.5;
    Collider.sizeY[box] = 0.5;
    Collider.sizeZ[box] = 0.5;
    Collider.density[box] = 1;

    const character = state.createEntity();
    state.addComponent(character, Body);
    state.addComponent(character, Collider);
    state.addComponent(character, CharacterController);
    state.addComponent(character, CharacterMovement);
    state.addComponent(character, Transform);

    Body.type[character] = BodyType.KinematicPositionBased;
    Body.posX[character] = 0;
    Body.posY[character] = 2;
    Body.posZ[character] = 0;
    Body.rotW[character] = 1;

    Collider.shape[character] = ColliderShape.Capsule;
    Collider.radius[character] = 0.5;
    Collider.height[character] = 1;

    CharacterController.offset[character] = 0.01;
    CharacterController.upY[character] = 1;

    CharacterMovement.desiredVelX[character] = 10;
    CharacterMovement.desiredVelY[character] = 0;
    CharacterMovement.desiredVelZ[character] = 0;
    CharacterMovement.velocityY[character] = 0;

    const initialCharX = Body.posX[character];

    for (let i = 0; i < 60; i++) {
      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
    }

    expect(Body.posX[character]).toBeGreaterThan(initialCharX);
  });
});
