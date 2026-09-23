import { describe, expect, it } from "vitest";
import { SimulationError } from "./errors.js";
import { simulate } from "./simulator.js";
import type { Command, SimulationInput } from "./types.js";

describe("simulate", () => {
  it("returns an empty blockages list when nothing blocks the rover (scenario A)", () => {
    const input: SimulationInput = {
      map: [["🟩", "🟩", "🟩"]],
      start: { x: 0, y: 0 },
      orientation: "E",
      commands: ["F", "F"],
    };
    expect(simulate(input)).toEqual({
      position: { x: 2, y: 0 },
      orientation: "E",
      blockages: [],
    });
  });

  it("records blockages with the attempted command index, target position and cause (scenario B)", () => {
    const input: SimulationInput = {
      map: [
        ["🟩", "🟩"],
        ["🟩", "🌳"],
      ],
      start: { x: 0, y: 0 },
      orientation: "E",
      commands: ["F", "F"],
    };
    expect(simulate(input)).toEqual({
      position: { x: 1, y: 0 },
      orientation: "E",
      blockages: [{ command: 1, position: { x: 2, y: 0 }, cause: "edge" }],
    });
  });

  it("continues executing commands after a blockage", () => {
    const input: SimulationInput = {
      map: [
        ["🌳", "🟩"],
        ["🟩", "🟩"],
      ],
      start: { x: 1, y: 0 },
      orientation: "W",
      commands: ["F", "L", "F"],
    };
    expect(simulate(input)).toEqual({
      position: { x: 1, y: 1 },
      orientation: "S",
      blockages: [{ command: 0, position: { x: 0, y: 0 }, cause: "obstacle" }],
    });
  });

  it("reproduces the full example from the spec as a non-regression test (EX-10)", () => {
    const input: SimulationInput = {
      map: [
        ["🟩", "🟩", "🟩", "🟩"],
        ["🟩", "🟩", "🟩", "🌳"],
      ],
      start: { x: 0, y: 1 },
      orientation: "E",
      commands: ["F", "F", "F", "L", "F", "F", "R", "R", "F", "L"],
    };
    expect(simulate(input)).toEqual({
      position: { x: 2, y: 1 },
      orientation: "E",
      blockages: [
        { command: 2, position: { x: 3, y: 1 }, cause: "obstacle" },
        { command: 5, position: { x: 2, y: -1 }, cause: "edge" },
      ],
    });
  });

  it("throws before executing anything when a command is unknown", () => {
    const input: SimulationInput = {
      map: [["🟩", "🟩"]],
      start: { x: 0, y: 0 },
      orientation: "N",
      commands: ["F", "X"] as Command[],
    };
    expect(() => simulate(input)).toThrow(SimulationError);
  });

  it("throws before executing anything when start is outside the map", () => {
    const input: SimulationInput = {
      map: [["🟩"]],
      start: { x: 5, y: 5 },
      orientation: "N",
      commands: [],
    };
    expect(() => simulate(input)).toThrow(SimulationError);
  });

  it("throws before executing anything when start is on an obstacle", () => {
    const input: SimulationInput = {
      map: [["🌳"]],
      start: { x: 0, y: 0 },
      orientation: "N",
      commands: [],
    };
    expect(() => simulate(input)).toThrow(SimulationError);
  });
});
