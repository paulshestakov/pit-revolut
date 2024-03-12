import { expect, test, describe } from "bun:test";
import type { Exchange, ExchangeCurrency } from "./exchange";
import { range } from "./array";
import { TransactionType, type DividendTransaction, type SellTransaction, type BuyTransaction } from "./revolut";
import { makeProfitsDividends } from "./profits-dividends";

const mockExchange: Exchange = {
  getRate: async (currency: ExchangeCurrency, date: Date) => {
    return 1;
  },
};

describe("profits-dividents", () => {
  test("several years", async () => {
    const profits = makeProfitsDividends(mockExchange);
    const transactions = range(10)
      .map(() => ({
        Type: TransactionType.DIVIDEND,
        Date: "2023-08-18T18:59:07.984691Z",
        Ticker: "AAPL",
        "Total Amount": "$2.04",
        Currency: "USD",
        "FX Rate": "0.2445",
      }))
      .concat([
        {
          Type: TransactionType.DIVIDEND,
          Date: "2024-08-18T18:59:07.984691Z",
          Ticker: "AAPL",
          "Total Amount": "$2.04",
          Currency: "USD",
          "FX Rate": "0.2445",
        },
      ]) as DividendTransaction[];
    expect(await profits.getProfits(transactions)).toEqual([
      {
        currency: "PLN",
        total: 20.4,
        year: "2023",
      },
      {
        currency: "PLN",
        total: 2.04,
        year: "2024",
      },
    ]);
  });
});
