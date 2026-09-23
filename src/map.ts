import type { MarsMap, Position } from "./types.js";

const OBSTACLE_CELLS = new Set(["🌳", "🪨"]);

export function isObstacle(cell: string): boolean {
  return OBSTACLE_CELLS.has(cell);
}

export function isFree(cell: string): boolean {
  return !isObstacle(cell);
}

export function isWithinMap(map: MarsMap, position: Position): boolean {
  if (position.y < 0 || position.y >= map.length) {
    return false;
  }
  const row = map[position.y];
  return position.x >= 0 && position.x < row.length;
}

export function cellAt(map: MarsMap, position: Position): string {
  return map[position.y][position.x];
}
