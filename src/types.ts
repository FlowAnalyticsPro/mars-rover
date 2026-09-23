export type Orientation = "N" | "S" | "E" | "W";

export type Command = "F" | "L" | "R";

export type MarsMap = string[][];

export interface Position {
  x: number;
  y: number;
}

export type BlockageCause = "obstacle" | "edge";

export interface Blockage {
  command: number;
  position: Position;
  cause: BlockageCause;
}

export interface SimulationInput {
  map: MarsMap;
  start: Position;
  orientation: Orientation;
  commands: Command[];
}

export interface SimulationResult {
  position: Position;
  orientation: Orientation;
  blockages: Blockage[];
}
