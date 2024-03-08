import { TransactionType, type Transaction, type BuyTransaction, type SellTransaction } from "./revolut";
import currency from "currency.js";
import _ from "lodash";
import type { Exchange } from "./exchange";

export const makeProfits = (exchange: Exchange) => {
  const getProfits = async (transactions: Transaction[]) => {
    console.table(transactions);

    let dividendsPlnTotal = currency(0);
    const dividends = transactions.filter((row) => row.Type === TransactionType.DIVIDEND);
    for (const record of dividends) {
      const plnRate = await exchange.getRate(record.Currency, new Date(record.Date));
      const plnCost = currency(record["Total Amount"]).multiply(plnRate);
      dividendsPlnTotal = dividendsPlnTotal.add(plnCost);
    }

    let stocksPlnTotal = currency(0);
    const stocks = transactions.filter(
      (row) => row.Type === TransactionType.BUY_MARKET || row.Type === TransactionType.SELL_MARKET,
    ) as (BuyTransaction | SellTransaction)[];

    const stocksByTicker = _.groupBy(stocks, (transaction) => transaction.Ticker);

    for (const [ticker, tickerStocks] of Object.entries(stocksByTicker)) {
      let buys = tickerStocks.filter((t) => t.Type === TransactionType.BUY_MARKET);
      const sells = tickerStocks.filter((t) => t.Type === TransactionType.SELL_MARKET);

      for (const sell of sells) {
        let tickerPlnTotal = currency(0);

        const rate = await exchange.getRate("USD", new Date(sell.Date));
        tickerPlnTotal = tickerPlnTotal.add(currency(sell["Total Amount"]).multiply(rate));
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
          tickerPlnTotal = tickerPlnTotal.subtract(
            currency(head["Total Amount"])
              .multiply(tookFromHead / head.Quantity)
              .multiply(rate),
          );
        }

        stocksPlnTotal = stocksPlnTotal.add(tickerPlnTotal);
        console.log(`# pln stock ${sell.Ticker} profit: ${tickerPlnTotal.value}`);
      }
    }

    console.log("\n");
    console.log("# pln dividents total: \t" + dividendsPlnTotal.value);
    console.log("# pln stocks total: \t" + stocksPlnTotal.value);
  };

  return { getProfits };
};
