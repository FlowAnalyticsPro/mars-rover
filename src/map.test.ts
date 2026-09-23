import { describe, expect, it } from "vitest";
import { cellAt, isFree, isObstacle, isWithinMap } from "./map.js";

describe("map", () => {
  it("treats 🟩 and 🟫 as free cells", () => {
    expect(isFree("🟩")).toBe(true);
    expect(isFree("🟫")).toBe(true);
    expect(isObstacle("🟩")).toBe(false);
    expect(isObstacle("🟫")).toBe(false);
  });

  it("treats 🌳 and 🪨 as obstacles, even mixed on the same map", () => {
    expect(isObstacle("🌳")).toBe(true);
    expect(isObstacle("🪨")).toBe(true);
    expect(isFree("🌳")).toBe(false);
    expect(isFree("🪨")).toBe(false);
  });

  it("derives map bounds from map.length and each row's length", () => {
    const map = [
      ["🟩", "🟩", "🌳"],
      ["🟫", "🪨", "🟩"],
    ];
    expect(isWithinMap(map, { x: 0, y: 0 })).toBe(true);
    expect(isWithinMap(map, { x: 2, y: 1 })).toBe(true);
    expect(isWithinMap(map, { x: 3, y: 0 })).toBe(false);
    expect(isWithinMap(map, { x: 0, y: 2 })).toBe(false);
    expect(isWithinMap(map, { x: -1, y: 0 })).toBe(false);
    expect(isWithinMap(map, { x: 0, y: -1 })).toBe(false);
  });

  it("reads the cell at a given position", () => {
    const map = [["🟩", "🌳"]];
    expect(cellAt(map, { x: 1, y: 0 })).toBe("🌳");
  });
});
