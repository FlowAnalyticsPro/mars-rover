import { SimulationError } from "./errors.js";
import { loadSimulationInput } from "./inputValidation.js";
import { simulate } from "./simulator.js";

function main(): void {
  try {
    const filePath = process.argv[2];
    if (!filePath) {
      throw new SimulationError("Usage : mars-rover <fichier.json>");
    }
    const input = loadSimulationInput(filePath);
    const result = simulate(input);
    console.log(JSON.stringify(result));
  } catch (error) {
    const message = error instanceof SimulationError ? error.message : String(error);
    console.log(JSON.stringify({ error: message }));
    process.exit(1);
  }
}

main();
