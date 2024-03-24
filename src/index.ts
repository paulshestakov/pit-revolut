import { args } from "./args";
import { makeLogger } from "./logger";
import { makeExchange } from "./exchange";
import { makeCalendar } from "./calendar";
import { makeRevolut } from "./revolut";
import { makeProfitsDividends } from "./profits-dividends";
import { makeProfitsStocks } from "./profits-stocks";
import { stringify } from "./utils/stringify";

const logger = makeLogger({ level: args["log-level"] });
const calendar = makeCalendar();
const exchange = makeExchange(calendar, logger);
const revolut = makeRevolut();
const profitsDividends = makeProfitsDividends(exchange);
const profitsStocks = makeProfitsStocks(exchange);

const transactions = revolut.getTransactions(args.file);

logger.info("Dividends");
logger.info(stringify(await profitsDividends.getProfits(transactions)));

logger.info("Stocks");
logger.info(stringify(await profitsStocks.getProfits(transactions)));
