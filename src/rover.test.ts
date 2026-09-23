import { describe, expect, it } from "vitest";
import { targetPosition, turnLeft, turnRight } from "./rover.js";

describe("rover", () => {
  it("turns left following N -> W -> S -> E -> N", () => {
    expect(turnLeft("N")).toBe("W");
    expect(turnLeft("W")).toBe("S");
    expect(turnLeft("S")).toBe("E");
    expect(turnLeft("E")).toBe("N");
  });

  it("turns right following N -> E -> S -> W -> N", () => {
    expect(turnRight("N")).toBe("E");
    expect(turnRight("E")).toBe("S");
    expect(turnRight("S")).toBe("W");
    expect(turnRight("W")).toBe("N");
  });

  it("computes the targeted cell for F depending on orientation", () => {
    expect(targetPosition({ x: 2, y: 2 }, "N")).toEqual({ x: 2, y: 1 });
    expect(targetPosition({ x: 2, y: 2 }, "S")).toEqual({ x: 2, y: 3 });
    expect(targetPosition({ x: 2, y: 2 }, "E")).toEqual({ x: 3, y: 2 });
    expect(targetPosition({ x: 2, y: 2 }, "W")).toEqual({ x: 1, y: 2 });
  });
});
