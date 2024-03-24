import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export const args = await yargs(hideBin(process.argv))
  .option("log-level", { type: "string", choices: ["debug", "info", "warn", "error"], default: "info" })
  .option("port", { type: "number", default: 3000 })
  .parse();
