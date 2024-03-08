import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export const args = await yargs(hideBin(process.argv))
  .option("file", {
    alias: "f",
    describe: "Load a csv file",
    type: "string",
    demandOption: true,
  })
  .parse();
