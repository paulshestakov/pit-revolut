import { TransactionType, type Transaction, type BuyTransaction, type SellTransaction } from "./revolut";
import currency from "currency.js";
import _ from "lodash";
import type { Exchange } from "./exchange";

type YearResult = {
  year: number;
  profit: currency;
  cost: currency;
  currency: string;
  sells: {
    ticker: string;
    date: Date;
    profit: number;
    cost: number;
  }[];
};

type Result = Record<string, YearResult>;

export const makeProfitsStocks = (exchange: Exchange) => {
  const getProfits = async (transactions: Transaction[]) => {
    const isStock = (transaction: Transaction): transaction is BuyTransaction | SellTransaction => {
      return transaction.Type === TransactionType.BUY_MARKET || transaction.Type === TransactionType.SELL_MARKET;
    };

    const stockTransactions = transactions.filter(isStock);

    const transactionsByTicker = _.groupBy(stockTransactions, (transaction) => transaction.Ticker);

    const result: Result = {};

    for (const [ticker, tickerStocks] of Object.entries(transactionsByTicker)) {
      let buys = tickerStocks.filter((t) => t.Type === TransactionType.BUY_MARKET);
      const sells = tickerStocks.filter((t) => t.Type === TransactionType.SELL_MARKET);

      for (const sell of sells) {
        const rate = await exchange.getRate("USD", new Date(sell.Date));
        const sellProfit = currency(sell["Total Amount"]).multiply(rate);

        let sellCost = currency(0);

        const amount = sell.Quantity;
        let took = 0;
        while (took !== amount) {
          const head = buys.shift()!;
          let tookFromHead = 0;

          if (took + head.Quantity <= amount) {
            tookFromHead = head.Quantity;
          } else {
            tookFromHead = amount - took;

            const quantity = head.Quantity - tookFromHead;
            const totalAmount = String(currency(head["Total Amount"]).multiply(quantity / head.Quantity).value);
            buys.unshift({
              ...head,
              Quantity: quantity,
              "Total Amount": totalAmount,
            });
          }

          took += tookFromHead;

          const rate = await exchange.getRate("USD", new Date(head.Date));
          sellCost = sellCost.add(
            currency(head["Total Amount"])
              .multiply(tookFromHead / head.Quantity)
              .multiply(rate),
          );
        }
        const year = new Date(sell.Date).getFullYear();
        if (!result[year]) {
          result[year] = {
            year,
            profit: currency(0),
            cost: currency(0),
            currency: "PLN",
            sells: [],
          };
        }

        result[year].profit = result[year].profit.add(sellProfit);
        result[year].cost = result[year].cost.add(sellCost);

        result[year].sells.push({
          date: new Date(sell.Date),
          ticker: sell.Ticker,
          profit: sellProfit.value,
          cost: sellCost.value,
        });
      }
    }

    return Object.values(result).map((result) => ({
      ...result,
      profit: result.profit.value,
      cost: result.cost.value,
      sells: result.sells,
    }));
  };

  return { getProfits };
};
