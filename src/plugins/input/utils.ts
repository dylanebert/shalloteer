import { InputState } from './components';
import { INPUT_CONFIG } from './config';

interface InputData {
  keys: Set<string>;
  mouseButtons: Set<number>;
  mouseDeltaX: number;
  mouseDeltaY: number;
  scrollDelta: number;
}

interface BufferedAction {
  lastPressTime: number;
  lastReleaseTime: number;
  lastConsumeTime: number;
  isPressed: boolean;
}

const inputData: InputData = {
  keys: new Set(),
  mouseButtons: new Set(),
  mouseDeltaX: 0,
  mouseDeltaY: 0,
  scrollDelta: 0,
};

const bufferedActions = {
  jump: {
    lastPressTime: 0,
    lastReleaseTime: 0,
    lastConsumeTime: 0,
    isPressed: false,
  },
  primary: {
    lastPressTime: 0,
    lastReleaseTime: 0,
    lastConsumeTime: 0,
    isPressed: false,
  },
  secondary: {
    lastPressTime: 0,
    lastReleaseTime: 0,
    lastConsumeTime: 0,
    isPressed: false,
  },
};

export function handleKeyDown(event: KeyboardEvent): void {
  inputData.keys.add(event.code);

  if (event.code === 'Space') {
    event.preventDefault();
    if (!bufferedActions.jump.isPressed) {
      bufferedActions.jump.lastPressTime = performance.now();
      bufferedActions.jump.isPressed = true;
    }
  }
}

export function handleKeyUp(event: KeyboardEvent): void {
  inputData.keys.delete(event.code);

  if (event.code === 'Space') {
    bufferedActions.jump.lastReleaseTime = performance.now();
    bufferedActions.jump.isPressed = false;
  }
}

export function handleMouseDown(event: MouseEvent): void {
  inputData.mouseButtons.add(event.button);

  if (event.button === 0 && !bufferedActions.primary.isPressed) {
    bufferedActions.primary.lastPressTime = performance.now();
    bufferedActions.primary.isPressed = true;
  } else if (event.button === 2) {
    event.preventDefault();
    if (!bufferedActions.secondary.isPressed) {
      bufferedActions.secondary.lastPressTime = performance.now();
      bufferedActions.secondary.isPressed = true;
    }
  }
}

export function handleMouseUp(event: MouseEvent): void {
  inputData.mouseButtons.delete(event.button);

  if (event.button === 0) {
    bufferedActions.primary.lastReleaseTime = performance.now();
    bufferedActions.primary.isPressed = false;
  } else if (event.button === 2) {
    bufferedActions.secondary.lastReleaseTime = performance.now();
    bufferedActions.secondary.isPressed = false;
  }
}

export function handleMouseMove(event: MouseEvent): void {
  inputData.mouseDeltaX += event.movementX;
  inputData.mouseDeltaY += event.movementY;
}

export function handleWheel(event: WheelEvent): void {
  inputData.scrollDelta += event.deltaY * INPUT_CONFIG.mouseSensitivity.scroll;
  event.preventDefault();
}

export function handleContextMenu(event: Event): void {
  event.preventDefault();
}

export function setupEventListeners(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  window.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mouseup', handleMouseUp);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('contextmenu', handleContextMenu);
}

export function cleanupEventListeners(): void {
  if (typeof window === 'undefined') return;

  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  window.removeEventListener('mousedown', handleMouseDown);
  window.removeEventListener('mouseup', handleMouseUp);
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('wheel', handleWheel);
  window.removeEventListener('contextmenu', handleContextMenu);
}

export function getMovementAxis(
  positiveKeys: readonly string[],
  negativeKeys: readonly string[]
): number {
  let value = 0;

  for (const key of positiveKeys) {
    if (inputData.keys.has(key)) value += 1;
  }
  for (const key of negativeKeys) {
    if (inputData.keys.has(key)) value -= 1;
  }

  return value;
}

export function canConsumeAction(
  action: BufferedAction,
  bufferWindow: number
): boolean {
  const currentTime = performance.now();

  if (action.lastPressTime <= action.lastConsumeTime) {
    return false;
  }
  const timeSincePress = currentTime - action.lastPressTime;
  return timeSincePress <= bufferWindow;
}

export function consumeAction(action: BufferedAction): boolean {
  if (canConsumeAction(action, INPUT_CONFIG.bufferWindow)) {
    action.lastConsumeTime = performance.now();
    return true;
  }
  return false;
}

export function updateInputState(eid: number): void {
  const sensitivity = INPUT_CONFIG.mouseSensitivity;

  InputState.moveX[eid] = getMovementAxis(
    INPUT_CONFIG.mappings.moveRight,
    INPUT_CONFIG.mappings.moveLeft
  );
  InputState.moveY[eid] = getMovementAxis(
    INPUT_CONFIG.mappings.moveForward,
    INPUT_CONFIG.mappings.moveBackward
  );
  InputState.moveZ[eid] = getMovementAxis(
    INPUT_CONFIG.mappings.moveUp,
    INPUT_CONFIG.mappings.moveDown
  );

  InputState.lookX[eid] = inputData.mouseDeltaX * sensitivity.look;
  InputState.lookY[eid] = inputData.mouseDeltaY * sensitivity.look;
  InputState.scrollDelta[eid] = inputData.scrollDelta;

  InputState.jump[eid] = canConsumeAction(
    bufferedActions.jump,
    INPUT_CONFIG.bufferWindow
  )
    ? 1
    : 0;
  InputState.primaryAction[eid] = canConsumeAction(
    bufferedActions.primary,
    INPUT_CONFIG.bufferWindow
  )
    ? 1
    : 0;
  InputState.secondaryAction[eid] = canConsumeAction(
    bufferedActions.secondary,
    INPUT_CONFIG.bufferWindow
  )
    ? 1
    : 0;

  InputState.leftMouse[eid] = inputData.mouseButtons.has(0) ? 1 : 0;
  InputState.rightMouse[eid] = inputData.mouseButtons.has(2) ? 1 : 0;
  InputState.middleMouse[eid] = inputData.mouseButtons.has(1) ? 1 : 0;

  InputState.jumpBufferTime[eid] = bufferedActions.jump.lastPressTime;
  InputState.primaryBufferTime[eid] = bufferedActions.primary.lastPressTime;
  InputState.secondaryBufferTime[eid] = bufferedActions.secondary.lastPressTime;
}

export function resetFrameDeltas(): void {
  inputData.mouseDeltaX = 0;
  inputData.mouseDeltaY = 0;
  inputData.scrollDelta = 0;
}

export function clearAllInput(): void {
  inputData.keys.clear();
  inputData.mouseButtons.clear();
  resetFrameDeltas();

  const now = performance.now();
  bufferedActions.jump = {
    lastPressTime: 0,
    lastReleaseTime: now,
    lastConsumeTime: now,
    isPressed: false,
  };
  bufferedActions.primary = {
    lastPressTime: 0,
    lastReleaseTime: now,
    lastConsumeTime: now,
    isPressed: false,
  };
  bufferedActions.secondary = {
    lastPressTime: 0,
    lastReleaseTime: now,
    lastConsumeTime: now,
    isPressed: false,
  };
}

export function consumeJump(): boolean {
  return consumeAction(bufferedActions.jump);
}

export function consumePrimary(): boolean {
  return consumeAction(bufferedActions.primary);
}

export function consumeSecondary(): boolean {
  return consumeAction(bufferedActions.secondary);
}
