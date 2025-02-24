import { parseArgs } from "util";
import { initDependencies } from "./init-dependencies";
import { stringify } from "./utils/stringify";
import path from "node:path";

const options = {
  path: { type: "string" as const, short: "p" },
};
const { values } = parseArgs({ args: Bun.argv, options, strict: true, allowPositionals: true });

const filePath = values.path;
if (!filePath) {
  throw new Error("--path argument not provided");
}

const file = Bun.file(filePath);
const fileName = path.parse(path.basename(filePath)).name;

const arrbuf = await file.arrayBuffer();
const buffer = Buffer.from(arrbuf);

const { revolut, profitsDividends, profitsStocks } = initDependencies();

const transactions = revolut.getTransactions(buffer);

const dividends = await profitsDividends.getProfits(transactions);
const stocks = await profitsStocks.getProfits(transactions);

const response = { dividends, stocks };

const outPath = `./output/${fileName}.json`;

await Bun.write(outPath, stringify(response));
