import { args } from "./args";
import { makeLogger } from "./logger";
import { makeExchange } from "./exchange";
import { makeCalendar } from "./calendar";
import { makeRevolut } from "./revolut";
import { makeProfitsDividends } from "./profits-dividends";
import { makeProfitsStocks } from "./profits-stocks";

export const initDependencies = () => {
  const logger = makeLogger({ level: args["log-level"] });
  const calendar = makeCalendar();
  const exchange = makeExchange(calendar, logger);
  const revolut = makeRevolut({ logger });
  const profitsDividends = makeProfitsDividends(exchange);
  const profitsStocks = makeProfitsStocks(exchange);

  return {
    logger,
    revolut,
    profitsDividends,
    profitsStocks,
  };
};
