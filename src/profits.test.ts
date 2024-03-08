import { expect, test, describe } from "bun:test";
import type { Exchange, ExchangeCurrency } from "./exchange";
import { makeProfits } from "./profits";
import { range } from "./array";
import { TransactionType, type DividendTransaction, type SellTransaction, type BuyTransaction } from "./revolut";

const mockExchange: Exchange = {
  getRate: async (currency: ExchangeCurrency, date: Date) => {
    return 1;
  },
};

describe("profits", () => {
  test("dividents", async () => {
    const profits = makeProfits(mockExchange);
    const transactions: DividendTransaction[] = range(10).map(() => ({
      Type: TransactionType.DIVIDEND,
      Date: "2023-08-18T18:59:07.984691Z",
      Ticker: "AAPL",
      "Total Amount": "$2.04",
      Currency: "USD",
      "FX Rate": "0.2445",
    }));
    expect(await profits.getProfits(transactions)).toEqual({ dividends: 20.4, stock: 0 });
  });

  test("stocks positive", async () => {
    const profits = makeProfits(mockExchange);
    const transactions: (SellTransaction | BuyTransaction)[] = [
      {
        Type: TransactionType.BUY_MARKET,
        Ticker: "AMZN",
        Quantity: 31,
        "Price per share": "$139.54",
        Date: "2023-09-18T17:40:15.268Z",
        "Total Amount": "$4347.44",
        Currency: "USD",
        "FX Rate": "0.2309",
      },
      {
        Type: TransactionType.SELL_MARKET,
        Ticker: "AMZN",
        Quantity: 31,
        "Price per share": "$141.28",
        Date: "2023-11-08T17:57:50.047Z",
        "Total Amount": "$4,368.69",
        Currency: "USD",
        "FX Rate": "0.2419",
      },
    ];
    expect(await profits.getProfits(transactions)).toEqual({ dividends: 0, stock: 21.25 });
  });

  test("stocks negative", async () => {
    const profits = makeProfits(mockExchange);
    const transactions: (SellTransaction | BuyTransaction)[] = [
      {
        Type: TransactionType.SELL_MARKET,
        Ticker: "AMZN",
        Quantity: 31,
        "Price per share": "$139.54",
        Date: "2023-09-18T17:40:15.268Z",
        "Total Amount": "$4347.44",
        Currency: "USD",
        "FX Rate": "0.2309",
      },
      {
        Type: TransactionType.BUY_MARKET,
        Ticker: "AMZN",
        Quantity: 31,
        "Price per share": "$141.28",
        Date: "2023-11-08T17:57:50.047Z",
        "Total Amount": "$4,368.69",
        Currency: "USD",
        "FX Rate": "0.2419",
      },
    ];
    expect(await profits.getProfits(transactions)).toEqual({ dividends: 0, stock: -21.25 });
  });
});
