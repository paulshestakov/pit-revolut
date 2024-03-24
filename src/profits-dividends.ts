import { TransactionType, type Transaction, type BuyTransaction, type SellTransaction } from "./revolut";
import currency from "currency.js";
import _ from "lodash";
import type { Exchange } from "./exchange";

const getFullYear = (transaction: Transaction) => {
  return new Date(transaction.Date).getFullYear();
};

export const makeProfitsDividends = (exchange: Exchange) => {
  const getProfits = async (transactions: Transaction[]) => {
    const groups = _.groupBy(transactions, getFullYear);
    const results = [];
    for (const [year, transactions] of Object.entries(groups)) {
      let dividendsPlnTotal = currency(0);
      const dividends = transactions.filter((row) => row.Type === TransactionType.DIVIDEND);
      for (const record of dividends) {
        const plnRate = await exchange.getRate(record.Currency, new Date(record.Date));
        const plnCost = currency(record["Total Amount"]).multiply(plnRate);
        dividendsPlnTotal = dividendsPlnTotal.add(plnCost);
      }
      results.push({
        year,
        total: dividendsPlnTotal.value,
        currency: "PLN",
      });
    }
    return results;
  };

  return { getProfits };
};

export type ProfitsDividends = ReturnType<typeof makeProfitsDividends>;
