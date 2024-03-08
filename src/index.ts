import { makeExchange } from "./exchange";
import { makeCalendar } from "./calendar";
import { makeRevolut, TransactionType } from "./revolut";

import currency from "currency.js";
import _ from "lodash";
import { makeProfits } from "./profits";

const calendar = makeCalendar();
const exchange = makeExchange(calendar);
const revolut = makeRevolut();
const profits = makeProfits(exchange);

const transactions = revolut.getTransactions();
const x = profits.getProfits(transactions);

console.table(transactions);
