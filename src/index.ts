import { args } from "./args";
import { makeLogger } from "./logger";
import { makeExchange } from "./exchange";
import { makeCalendar } from "./calendar";
import { makeRevolut } from "./revolut";
import { makeProfitsDividends } from "./profits-dividends";
import { makeProfitsStocks } from "./profits-stocks";

const logger = makeLogger();
const calendar = makeCalendar();
const exchange = makeExchange(calendar, logger);
const revolut = makeRevolut();
const profitsDividends = makeProfitsDividends(exchange);
const profitsStocks = makeProfitsStocks(exchange);

const transactions = revolut.getTransactions(args.file);

console.log("Dividends");
console.table(await profitsDividends.getProfits(transactions));

console.log("Stocks");
console.table(await profitsStocks.getProfits(transactions));
