import { readFileSync } from "node:fs";
import { SimulationError } from "./errors.js";
import { cellAt, isObstacle, isWithinMap } from "./map.js";
import type { SimulationInput } from "./types.js";

const VALID_ORIENTATIONS = new Set(["N", "S", "E", "W"]);
const VALID_COMMANDS = new Set(["F", "L", "R"]);

export function loadSimulationInput(filePath: string): SimulationInput {
  let raw: string;
  try {
    raw = readFileSync(filePath, "utf-8");
  } catch {
    throw new SimulationError(`Impossible de lire le fichier d'entrée : ${filePath}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new SimulationError(`Le fichier d'entrée n'est pas un JSON valide : ${filePath}`);
  }

  return parseStructure(parsed);
}

function parseStructure(value: unknown): SimulationInput {
  if (typeof value !== "object" || value === null) {
    throw new SimulationError('Le fichier d\'entrée doit contenir un objet JSON.');
  }
  const candidate = value as Record<string, unknown>;
  const { map, start, orientation, commands } = candidate;

  if (!Array.isArray(map)) {
    throw new SimulationError('Le champ "map" est manquant ou invalide.');
  }

  const startCandidate = start as Record<string, unknown> | null;
  if (
    typeof startCandidate !== "object" ||
    startCandidate === null ||
    typeof startCandidate.x !== "number" ||
    typeof startCandidate.y !== "number"
  ) {
    throw new SimulationError('Le champ "start" est manquant ou invalide.');
  }

  if (typeof orientation !== "string" || !VALID_ORIENTATIONS.has(orientation)) {
    throw new SimulationError('Le champ "orientation" est manquant ou invalide.');
  }

  if (!Array.isArray(commands)) {
    throw new SimulationError('Le champ "commands" est manquant ou invalide.');
  }

  return {
    map: map as SimulationInput["map"],
    start: { x: startCandidate.x, y: startCandidate.y },
    orientation: orientation as SimulationInput["orientation"],
    commands: commands as SimulationInput["commands"],
  };
}

export function validateInput(input: SimulationInput): void {
  for (const command of input.commands) {
    if (!VALID_COMMANDS.has(command)) {
      throw new SimulationError(`Commande inconnue : ${String(command)}`);
    }
  }

  if (!isWithinMap(input.map, input.start)) {
    throw new SimulationError("La position de départ est hors de la carte.");
  }

  if (isObstacle(cellAt(input.map, input.start))) {
    throw new SimulationError("La position de départ est sur un obstacle.");
  }
}
