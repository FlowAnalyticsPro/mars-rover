import { describe, expect, it } from "vitest";
import { SimulationError } from "./errors.js";
import { loadSimulationInput, validateInput } from "./inputValidation.js";
import type { Command, SimulationInput } from "./types.js";

const baseInput: SimulationInput = {
  map: [
    ["🟩", "🟩"],
    ["🟩", "🌳"],
  ],
  start: { x: 0, y: 0 },
  orientation: "N",
  commands: ["F"],
};

describe("validateInput", () => {
  it("accepts a valid input", () => {
    expect(() => validateInput(baseInput)).not.toThrow();
  });

  it("rejects an unknown command anywhere in the list", () => {
    const input = { ...baseInput, commands: ["F", "X", "L"] as Command[] };
    expect(() => validateInput(input)).toThrow(SimulationError);
  });

  it("rejects a start position outside the map", () => {
    const input = { ...baseInput, start: { x: 5, y: 5 } };
    expect(() => validateInput(input)).toThrow(SimulationError);
  });

  it("rejects a start position on an obstacle", () => {
    const input = { ...baseInput, start: { x: 1, y: 1 } };
    expect(() => validateInput(input)).toThrow(SimulationError);
  });
});

describe("loadSimulationInput", () => {
  it("rejects a missing file", () => {
    expect(() => loadSimulationInput("test/fixtures/does-not-exist.json")).toThrow(SimulationError);
  });

  it("rejects a file that is not valid JSON", () => {
    expect(() => loadSimulationInput("test/fixtures/malformed.json")).toThrow(SimulationError);
  });

  it("rejects a file missing expected fields", () => {
    expect(() => loadSimulationInput("test/fixtures/missing-field.json")).toThrow(SimulationError);
  });

  it("loads a valid file", () => {
    const input = loadSimulationInput("test/fixtures/nominal.json");
    expect(input.orientation).toBe("E");
    expect(input.commands).toEqual(["F", "F"]);
  });
});
