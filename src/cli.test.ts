import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

function runCli(args: string[]) {
  return spawnSync(process.execPath, ["--import", "tsx/esm", "src/cli.ts", ...args], {
    encoding: "utf-8",
  });
}

describe("cli", () => {
  it("prints the JSON result and exits 0 on a valid scenario", () => {
    const result = runCli(["test/fixtures/nominal.json"]);
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({
      position: { x: 2, y: 0 },
      orientation: "E",
      blockages: [],
    });
  });

  it("reports an obstacle blockage", () => {
    const result = runCli(["test/fixtures/obstacle-blockage.json"]);
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({
      position: { x: 0, y: 0 },
      orientation: "E",
      blockages: [{ command: 0, position: { x: 1, y: 0 }, cause: "obstacle" }],
    });
  });

  it("reports an edge blockage", () => {
    const result = runCli(["test/fixtures/edge-blockage.json"]);
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({
      position: { x: 0, y: 0 },
      orientation: "N",
      blockages: [{ command: 0, position: { x: 0, y: -1 }, cause: "edge" }],
    });
  });

  it("reproduces the full example from the spec end to end (EX-10)", () => {
    const result = runCli(["test/fixtures/spec-example.json"]);
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({
      position: { x: 2, y: 1 },
      orientation: "E",
      blockages: [
        { command: 2, position: { x: 3, y: 1 }, cause: "obstacle" },
        { command: 5, position: { x: 2, y: -1 }, cause: "edge" },
      ],
    });
  });

  it.each([
    "test/fixtures/unknown-command.json",
    "test/fixtures/start-out-of-bounds.json",
    "test/fixtures/start-on-obstacle.json",
    "test/fixtures/malformed.json",
    "test/fixtures/missing-field.json",
    "test/fixtures/does-not-exist.json",
  ])("prints {\"error\": ...} and exits non-zero for %s, without a partial result", (fixture) => {
    const result = runCli([fixture]);
    expect(result.status).not.toBe(0);
    const parsed = JSON.parse(result.stdout);
    expect(parsed).toHaveProperty("error");
    expect(parsed).not.toHaveProperty("position");
    expect(parsed).not.toHaveProperty("blockages");
  });
});
