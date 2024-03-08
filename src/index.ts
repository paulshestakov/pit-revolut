import { args } from "./args";
import { makeExchange } from "./exchange";
import { makeCalendar } from "./calendar";
import { makeRevolut } from "./revolut";
import { makeProfits } from "./profits";

const calendar = makeCalendar();
const exchange = makeExchange(calendar);
const revolut = makeRevolut();
const profits = makeProfits(exchange);

const transactions = revolut.getTransactions(args.file);
const result = profits.getProfits(transactions);

console.table(result);
