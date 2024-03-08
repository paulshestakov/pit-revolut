import { expect, test, describe } from "bun:test";
import type { Exchange, ExchangeCurrency } from "./exchange";
import { makeProfits } from "./profits";
import { range } from "./array";
import { TransactionType, type DividendTransaction } from "./revolut";

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
});
