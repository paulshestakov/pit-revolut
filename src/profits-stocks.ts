import { TransactionType, type Transaction, type BuyTransaction, type SellTransaction } from "./revolut";
import currency from "currency.js";
import _ from "lodash";
import type { Exchange } from "./exchange";

export const makeProfitsStocks = (exchange: Exchange) => {
  const getProfits = async (transactions: Transaction[]) => {
    type YearResult = {
      year: number;
      total: currency;
      currency: string;
      sells: { ticker: string; date: Date; profit: number }[];
    };

    const resultsByYear: Record<string, YearResult> = {};

    const stocks = transactions.filter(
      (row) => row.Type === TransactionType.BUY_MARKET || row.Type === TransactionType.SELL_MARKET,
    ) as (BuyTransaction | SellTransaction)[];

    const stocksByTicker = _.groupBy(stocks, (transaction) => transaction.Ticker);

    for (const [ticker, tickerStocks] of Object.entries(stocksByTicker)) {
      let buys = tickerStocks.filter((t) => t.Type === TransactionType.BUY_MARKET);
      const sells = tickerStocks.filter((t) => t.Type === TransactionType.SELL_MARKET);

      for (const sell of sells) {
        let sellProfit = currency(0);

        const rate = await exchange.getRate("USD", new Date(sell.Date));
        sellProfit = sellProfit.add(currency(sell["Total Amount"]).multiply(rate));
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
          sellProfit = sellProfit.subtract(
            currency(head["Total Amount"])
              .multiply(tookFromHead / head.Quantity)
              .multiply(rate),
          );
        }
        const year = new Date(sell.Date).getFullYear();
        if (!resultsByYear[year]) {
          resultsByYear[year] = {
            year,
            total: currency(0),
            currency: "PLN",
            sells: [],
          };
        }

        resultsByYear[year].total = resultsByYear[year].total.add(sellProfit);
        resultsByYear[year].sells.push({
          date: new Date(sell.Date),
          ticker: sell.Ticker,
          profit: sellProfit.value,
        });
      }
    }

    return Object.values(resultsByYear).map((result) => ({
      ...result,
      total: result.total.value,
      sells: result.sells.map((sell) => `${sell.ticker} ${sell.profit}`).join(", "),
    }));
  };

  return { getProfits };
};
