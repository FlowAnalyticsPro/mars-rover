import { validateInput } from "./inputValidation.js";
import { cellAt, isObstacle, isWithinMap } from "./map.js";
import { targetPosition, turnLeft, turnRight } from "./rover.js";
import type { Blockage, Position, SimulationInput, SimulationResult } from "./types.js";

export function simulate(input: SimulationInput): SimulationResult {
  validateInput(input);

  let position: Position = { ...input.start };
  let orientation = input.orientation;
  const blockages: Blockage[] = [];

  input.commands.forEach((command, index) => {
    switch (command) {
      case "L":
        orientation = turnLeft(orientation);
        break;
      case "R":
        orientation = turnRight(orientation);
        break;
      case "F": {
        const target = targetPosition(position, orientation);
        if (!isWithinMap(input.map, target)) {
          blockages.push({ command: index, position: target, cause: "edge" });
        } else if (isObstacle(cellAt(input.map, target))) {
          blockages.push({ command: index, position: target, cause: "obstacle" });
        } else {
          position = target;
        }
        break;
      }
    }
  });

  return { position, orientation, blockages };
}
