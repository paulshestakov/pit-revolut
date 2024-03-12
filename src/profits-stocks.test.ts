import { expect, test, describe } from "bun:test";
import type { Exchange, ExchangeCurrency } from "./exchange";
import { makeProfitsStocks } from "./profits-stocks";
import { range } from "./array";
import { TransactionType, type DividendTransaction, type SellTransaction, type BuyTransaction } from "./revolut";

const mockExchange: Exchange = {
  getRate: async (currency: ExchangeCurrency, date: Date) => {
    return 1;
  },
};

describe("profits-stocks", () => {
  test("stocks positive", async () => {
    const profits = makeProfitsStocks(mockExchange);
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
    expect(await profits.getProfits(transactions)).toEqual([
      {
        currency: "PLN",
        sells: "AMZN 21.25",
        total: 21.25,
        year: 2023,
      },
    ]);
  });

  test("stocks negative", async () => {
    const profits = makeProfitsStocks(mockExchange);
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
    expect(await profits.getProfits(transactions)).toEqual([
      {
        currency: "PLN",
        sells: "AMZN -21.25",
        total: -21.25,
        year: 2023,
      },
    ]);
  });
});
