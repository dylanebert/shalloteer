import { beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { State, TIME_CONSTANTS } from 'shalloteer';
import { InputState } from 'shalloteer';
import { OrbitCameraPlugin } from 'shalloteer';
import {
  Body,
  BodyType,
  CharacterController,
  CharacterMovement,
  Collider,
  ColliderShape,
  initializePhysics,
  PhysicsPlugin,
} from 'shalloteer';
import { Player, PlayerPlugin } from 'shalloteer';
import { Transform, TransformsPlugin, WorldTransform } from 'shalloteer';

describe('Player Jumping', () => {
  let state: State;

  beforeAll(async () => {
    await initializePhysics();
  });

  beforeEach(() => {
    state = new State();
    state.registerPlugin(TransformsPlugin);
    state.registerPlugin(PhysicsPlugin);
    state.registerPlugin(OrbitCameraPlugin);
    state.registerPlugin(PlayerPlugin);

    state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
  });

  function createPlayer(x = 0, y = 5, z = 0): number {
    const player = state.createEntity();
    state.addComponent(player, Player);
    state.addComponent(player, InputState);
    state.addComponent(player, Body);
    state.addComponent(player, Collider);
    state.addComponent(player, CharacterController);
    state.addComponent(player, CharacterMovement);
    state.addComponent(player, Transform);
    state.addComponent(player, WorldTransform);

    Player.speed[player] = 10;
    Player.jumpHeight[player] = 3;
    Player.rotationSpeed[player] = 10;
    Player.canJump[player] = 1;
    Player.isJumping[player] = 0;
    Player.jumpCooldown[player] = 0;
    Player.lastGroundedTime[player] = -10000;
    Player.jumpBufferTime[player] = -10000;

    Body.type[player] = BodyType.KinematicPositionBased;
    Body.posX[player] = x;
    Body.posY[player] = y;
    Body.posZ[player] = z;
    Body.rotW[player] = 1;
    Body.gravityScale[player] = 1;

    Collider.shape[player] = ColliderShape.Capsule;
    Collider.radius[player] = 0.5;
    Collider.height[player] = 1;

    CharacterController.offset[player] = 0.01;
    CharacterController.upY[player] = 1;
    CharacterController.snapDist[player] = 0.1;

    CharacterMovement.velocityY[player] = 0;

    Transform.posX[player] = x;
    Transform.posY[player] = y;
    Transform.posZ[player] = z;
    Transform.rotW[player] = 1;

    return player;
  }

  function createFloor(y = 0): number {
    const floor = state.createEntity();
    state.addComponent(floor, Body);
    state.addComponent(floor, Collider);
    state.addComponent(floor, Transform);

    Body.type[floor] = BodyType.Fixed;
    Body.posY[floor] = y;
    Body.rotW[floor] = 1;

    Collider.shape[floor] = ColliderShape.Box;
    Collider.sizeX[floor] = 100;
    Collider.sizeY[floor] = 1;
    Collider.sizeZ[floor] = 100;

    return floor;
  }

  function waitForGrounded(player: number, maxSteps = 100): void {
    for (let i = 0; i < maxSteps; i++) {
      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
      if (CharacterController.grounded[player] === 1) break;
    }
  }

  describe('Basic Jump Mechanics', () => {
    it('should jump to expected height', () => {
      createFloor();
      const player = createPlayer(0, 2, 0);

      waitForGrounded(player);

      const startY = Body.posY[player];
      InputState.jump[player] = 1;

      let maxHeight = startY;
      for (let i = 0; i < 60; i++) {
        state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
        maxHeight = Math.max(maxHeight, Body.posY[player]);
        InputState.jump[player] = 0;
      }

      const heightReached = maxHeight - startY;
      const expectedHeight = Player.jumpHeight[player];

      expect(heightReached).toBeGreaterThan(expectedHeight * 0.8);
      expect(heightReached).toBeLessThan(expectedHeight * 1.2);
    });

    it('should only jump when grounded', () => {
      createFloor();
      const player = createPlayer(0, 10, 0);

      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
      expect(CharacterController.grounded[player]).toBe(0);

      const startY = Body.posY[player];
      InputState.jump[player] = 1;

      for (let i = 0; i < 5; i++) {
        state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
      }

      expect(Body.posY[player]).toBeLessThan(startY);
    });

    it('should respect jump cooldown', () => {
      createFloor();
      const player = createPlayer(0, 2, 0);

      waitForGrounded(player);

      InputState.jump[player] = 1;
      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
      const firstJumpVel = CharacterMovement.velocityY[player];
      expect(firstJumpVel).toBeGreaterThan(0);

      InputState.jump[player] = 1;
      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);

      expect(Player.canJump[player]).toBe(0);
      expect(Player.jumpCooldown[player]).toBeGreaterThan(0);
    });

    it('should apply gravity during jump', () => {
      createFloor();
      const player = createPlayer(0, 2, 0);

      waitForGrounded(player);

      InputState.jump[player] = 1;
      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);

      const initialVelocity = CharacterMovement.velocityY[player];
      InputState.jump[player] = 0;

      const velocities: number[] = [initialVelocity];
      const groundedStates: number[] = [0];

      for (let i = 0; i < 10; i++) {
        state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
        velocities.push(CharacterMovement.velocityY[player]);
        groundedStates.push(CharacterController.grounded[player]);
      }

      for (let i = 2; i < velocities.length; i++) {
        if (groundedStates[i] === 0 && velocities[i - 1] > 0) {
          expect(velocities[i]).toBeLessThan(velocities[i - 1]);
        }
      }
    });
  });

  describe('Jump Buffer', () => {
    it('should buffer jump input before landing', () => {
      createFloor();
      const player = createPlayer(0, 2, 0);

      for (let i = 0; i < 5; i++) {
        state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
      }

      InputState.jump[player] = 1;
      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
      InputState.jump[player] = 0;

      expect(Player.jumpBufferTime[player]).toBeGreaterThan(0);

      let jumped = false;
      for (let i = 0; i < 20; i++) {
        state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
        if (CharacterMovement.velocityY[player] > 1) {
          jumped = true;
          break;
        }
      }

      expect(jumped).toBe(true);
    });

    it('should clear buffer after successful jump', () => {
      createFloor();
      const player = createPlayer(0, 2, 0);

      waitForGrounded(player);

      InputState.jump[player] = 1;
      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);

      expect(Player.jumpBufferTime[player]).toBe(-10000);
    });
  });

  describe('Coyote Time', () => {
    it('should allow jumping shortly after leaving platform', () => {
      createFloor();
      const platform = state.createEntity();
      state.addComponent(platform, Body);
      state.addComponent(platform, Collider);
      state.addComponent(platform, Transform);

      Body.type[platform] = BodyType.Fixed;
      Body.posX[platform] = 0;
      Body.posY[platform] = 5;
      Body.posZ[platform] = 0;
      Body.rotW[platform] = 1;

      Collider.shape[platform] = ColliderShape.Box;
      Collider.sizeX[platform] = 1;
      Collider.sizeY[platform] = 1;
      Collider.sizeZ[platform] = 4;

      const player = createPlayer(0, 6.5, 0);

      waitForGrounded(player);

      InputState.moveX[player] = 1;

      for (let i = 0; i < 5; i++) {
        state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
      }

      expect(CharacterController.grounded[player]).toBe(0);

      InputState.jump[player] = 1;
      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);

      expect(CharacterMovement.velocityY[player]).toBeGreaterThan(0);
    });

    it('should not allow jumping after coyote time expires', () => {
      createFloor();
      const player = createPlayer(0, 10, 0);

      Player.lastGroundedTime[player] = -1000;

      InputState.jump[player] = 1;
      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);

      expect(CharacterMovement.velocityY[player]).toBeLessThanOrEqual(0);
    });

    it('should allow jumping within coyote time window of 100ms', () => {
      createFloor();
      const player = createPlayer(0, 5, 0);

      waitForGrounded(player);
      expect(CharacterController.grounded[player]).toBe(1);

      const recentTime = state.time.elapsed * 1000 - 50;
      Player.lastGroundedTime[player] = recentTime;

      CharacterController.grounded[player] = 0;

      InputState.jump[player] = 1;
      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);

      expect(CharacterMovement.velocityY[player]).toBeGreaterThan(5);
      expect(Player.isJumping[player]).toBe(1);
      expect(Player.canJump[player]).toBe(0);
    });

    it('should not allow jumping beyond coyote time window of 100ms', () => {
      createFloor();
      const player = createPlayer(0, 10, 0);

      const currentTime = state.time.elapsed * 1000;
      Player.lastGroundedTime[player] = currentTime - 150;

      expect(CharacterController.grounded[player]).toBe(0);

      InputState.jump[player] = 1;
      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);

      expect(CharacterMovement.velocityY[player]).toBeLessThanOrEqual(0);
      expect(Player.isJumping[player]).toBe(0);
    });
  });

  describe('Variable Jump Height', () => {
    it('should scale jump with gravity scale', () => {
      createFloor();
      const normalPlayer = createPlayer(0, 2, 0);
      const lowGravPlayer = createPlayer(5, 2, 0);

      Body.gravityScale[normalPlayer] = 1;
      Body.gravityScale[lowGravPlayer] = 0.5;
      Player.jumpHeight[normalPlayer] = 3;
      Player.jumpHeight[lowGravPlayer] = 3;

      waitForGrounded(normalPlayer);
      waitForGrounded(lowGravPlayer);

      InputState.jump[normalPlayer] = 1;
      InputState.jump[lowGravPlayer] = 1;
      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);

      const normalVel = CharacterMovement.velocityY[normalPlayer];
      const lowGravVel = CharacterMovement.velocityY[lowGravPlayer];

      expect(normalVel).toBeGreaterThan(lowGravVel);

      let normalMaxHeight = Body.posY[normalPlayer];
      let lowGravMaxHeight = Body.posY[lowGravPlayer];

      for (let i = 0; i < 60; i++) {
        state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
        normalMaxHeight = Math.max(normalMaxHeight, Body.posY[normalPlayer]);
        lowGravMaxHeight = Math.max(lowGravMaxHeight, Body.posY[lowGravPlayer]);
      }

      const normalHeightReached = normalMaxHeight - 2;
      const lowGravHeightReached = lowGravMaxHeight - 2;

      expect(normalHeightReached).toBeCloseTo(3, 0);
      expect(lowGravHeightReached).toBeCloseTo(3, 0);
    });

    it('should handle different jump heights', () => {
      createFloor();
      const shortJumper = createPlayer(0, 2, 0);
      const tallJumper = createPlayer(5, 2, 0);

      Player.jumpHeight[shortJumper] = 1.5;
      Player.jumpHeight[tallJumper] = 5;

      waitForGrounded(shortJumper);
      waitForGrounded(tallJumper);

      const shortStartY = Body.posY[shortJumper];
      const tallStartY = Body.posY[tallJumper];

      InputState.jump[shortJumper] = 1;
      InputState.jump[tallJumper] = 1;
      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);

      let shortMaxHeight = shortStartY;
      let tallMaxHeight = tallStartY;

      for (let i = 0; i < 60; i++) {
        state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
        shortMaxHeight = Math.max(shortMaxHeight, Body.posY[shortJumper]);
        tallMaxHeight = Math.max(tallMaxHeight, Body.posY[tallJumper]);
      }

      const shortHeight = shortMaxHeight - shortStartY;
      const tallHeight = tallMaxHeight - tallStartY;

      expect(shortHeight).toBeCloseTo(1.5, 0);
      expect(tallHeight).toBeCloseTo(5, 0);
    });
  });

  describe('Jump State Management', () => {
    it('should track jump state correctly', () => {
      createFloor();
      const player = createPlayer(0, 2, 0);

      waitForGrounded(player);

      expect(Player.isJumping[player]).toBe(0);
      expect(Player.canJump[player]).toBe(1);

      InputState.jump[player] = 1;
      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);

      expect(Player.isJumping[player]).toBe(1);
      expect(Player.canJump[player]).toBe(0);
    });

    it('should reset jump ability after cooldown', () => {
      createFloor();
      const player = createPlayer(0, 2, 0);

      waitForGrounded(player);

      InputState.jump[player] = 1;
      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);

      expect(Player.canJump[player]).toBe(0);
      expect(Player.jumpCooldown[player]).toBeGreaterThan(0);

      for (let i = 0; i < 30; i++) {
        state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
      }

      expect(Player.jumpCooldown[player]).toBeLessThanOrEqual(0);
      expect(Player.canJump[player]).toBe(1);
    });

    it('should allow multiple jumps after landing', () => {
      createFloor();
      const player = createPlayer(0, 2, 0);

      waitForGrounded(player);

      const initialY = Body.posY[player];

      InputState.jump[player] = 1;
      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
      InputState.jump[player] = 0;

      expect(Player.isJumping[player]).toBe(1);
      expect(Player.canJump[player]).toBe(0);

      let maxHeight = initialY;
      for (let i = 0; i < 60; i++) {
        state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
        maxHeight = Math.max(maxHeight, Body.posY[player]);
      }

      waitForGrounded(player);

      expect(Player.isJumping[player]).toBe(0);
      expect(Player.canJump[player]).toBe(1);

      const secondJumpY = Body.posY[player];

      InputState.jump[player] = 1;
      state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
      InputState.jump[player] = 0;

      expect(Player.isJumping[player]).toBe(1);
      expect(CharacterMovement.velocityY[player]).toBeGreaterThan(0);

      for (let i = 0; i < 10; i++) {
        state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
      }

      expect(Body.posY[player]).toBeGreaterThan(secondJumpY);
    });

    it('should handle rapid jump attempts after landing (real world scenario)', () => {
      createFloor();
      const player = createPlayer(0, 2, 0);

      waitForGrounded(player);
      expect(Player.canJump[player]).toBe(1);

      for (let jumpAttempt = 0; jumpAttempt < 5; jumpAttempt++) {
        const beforeJumpY = Body.posY[player];

        InputState.jump[player] = 1;
        state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
        InputState.jump[player] = 0;

        expect(Player.isJumping[player]).toBe(1);
        expect(Player.canJump[player]).toBe(0);

        for (let i = 0; i < 80; i++) {
          state.step(TIME_CONSTANTS.FIXED_TIMESTEP);
          if (
            CharacterController.grounded[player] === 1 &&
            Player.isJumping[player] === 0
          ) {
            break;
          }
        }

        expect(CharacterController.grounded[player]).toBe(1);
        expect(Player.isJumping[player]).toBe(0);
        expect(Player.canJump[player]).toBe(1);

        expect(Body.posY[player]).toBeGreaterThan(beforeJumpY - 0.1);
      }
    });
  });
});
