import { parse } from "csv-parse/sync";
import * as t from "runtypes";
import type { Logger } from "./logger";

const rawTransaction = t.Record({
  Type: t.Union(
    t.Literal("CASH TOP-UP"),
    t.Literal("CASH WITHDRAWAL"),
    t.Literal("CUSTODY FEE"),
    t.Literal("BUY - MARKET"),
    t.Literal("SELL - MARKET"),
    t.Literal("DIVIDEND"),
  ),
  Date: t.String,
  "Total Amount": t.String,
  Currency: t.Union(t.Literal("USD"), t.Literal("EUR")),
  "FX Rate": t.String,
  Ticker: t.String,
  Quantity: t.String,
  "Price per share": t.String,
});

export enum TransactionType {
  CASH_TOP_UP = "CASH TOP-UP",
  CASH_WITHDRAWAL = "CASH WITHDRAWAL",
  CUSTODY_FEE = "CUSTODY FEE",
  BUY_MARKET = "BUY - MARKET",
  SELL_MARKET = "SELL - MARKET",
  DIVIDEND = "DIVIDEND",
}

type Currency = "USD";

type TransactionCommon = {
  Date: string;
  "Total Amount": string;
  Currency: Currency;
  "FX Rate": string;
};

export type TopUpTransaction = TransactionCommon & {
  Type: TransactionType.CASH_TOP_UP;
};

export type FeeTransaction = TransactionCommon & {
  Type: TransactionType.CUSTODY_FEE;
};

export type BuyTransaction = TransactionCommon & {
  Type: TransactionType.BUY_MARKET;
  Ticker: string;
  Quantity: number;
  "Price per share": string;
};

export type SellTransaction = TransactionCommon & {
  Type: TransactionType.SELL_MARKET;
  Ticker: string;
  Quantity: number;
  "Price per share": string;
};

export type DividendTransaction = TransactionCommon & {
  Type: TransactionType.DIVIDEND;
  Ticker: string;
};

export type Transaction = TopUpTransaction | FeeTransaction | BuyTransaction | SellTransaction | DividendTransaction;

export const makeRevolut = ({ logger }: { logger: Logger }) => {
  const getTransactions = (file: Buffer) => {
    const rawRows = parse(file, {
      columns: true,
      skip_empty_lines: true,
    }) as any[];

    return rawRows
      .map((row) => {
        try {
          return rawTransaction.check(row);
        } catch (error) {
          logger.error(`Failed to validate row ${JSON.stringify(row)}`);
          throw error;
        }
      })
      .map((row) => {
        return {
          ...row,
          Quantity: row.Quantity ? Number(row.Quantity) : row.Quantity,
        };
      }) as Transaction[];
  };

  return {
    getTransactions,
  };
};

export type Revolut = ReturnType<typeof makeRevolut>;
