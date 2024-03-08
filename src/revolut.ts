import fs from "node:fs";
import { parse } from "csv-parse/sync";
import { args } from "./args";

type RawTransaction = {
  Type: TransactionType;
  Date: string;
  "Total Amount": string;
  Currency: Currency;
  "FX Rate": string;

  Ticker?: string;
  Quantity?: string;
  "Price per share"?: string;
};

export enum TransactionType {
  CASH_TOP_UP = "CASH TOP-UP",
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
};

export type Transaction = TopUpTransaction | FeeTransaction | BuyTransaction | SellTransaction | DividendTransaction;

export const makeRevolut = () => {
  const getTransactions = () => {
    const file = fs.readFileSync(args.file, "utf-8");

    const records = parse(file, {
      columns: true,
      skip_empty_lines: true,
    }) as RawTransaction[];

    return records.map((record) => {
      return {
        ...record,
        Quantity: record.Quantity ? Number(record.Quantity) : record.Quantity,
      };
    }) as Transaction[];
  };

  return {
    getTransactions,
  };
};
