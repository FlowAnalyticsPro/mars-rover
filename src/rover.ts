import type { Orientation, Position } from "./types.js";

const LEFT_TURN_ORDER: Orientation[] = ["N", "W", "S", "E"];

const MOVE_DELTA: Record<Orientation, Position> = {
  N: { x: 0, y: -1 },
  S: { x: 0, y: 1 },
  E: { x: 1, y: 0 },
  W: { x: -1, y: 0 },
};

export function turnLeft(orientation: Orientation): Orientation {
  const index = LEFT_TURN_ORDER.indexOf(orientation);
  return LEFT_TURN_ORDER[(index + 1) % LEFT_TURN_ORDER.length];
}

export function turnRight(orientation: Orientation): Orientation {
  const index = LEFT_TURN_ORDER.indexOf(orientation);
  return LEFT_TURN_ORDER[(index - 1 + LEFT_TURN_ORDER.length) % LEFT_TURN_ORDER.length];
}

export function targetPosition(position: Position, orientation: Orientation): Position {
  const delta = MOVE_DELTA[orientation];
  return { x: position.x + delta.x, y: position.y + delta.y };
}
