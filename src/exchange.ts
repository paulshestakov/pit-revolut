import { format } from "date-fns";
import type { Calendar } from "./calendar";

type NbpCurrency = "USD" | "EUR";

type NbpResponse = {
  code: NbpCurrency;
  rates: {
    effectiveDate: string;
    mid: number;
  }[];
};

const makeUrl = (currency: NbpCurrency, date: string) => {
  return `https://api.nbp.pl/api/exchangerates/rates/a/${currency}/${date}?format=json`;
};

export const makeExchange = (calendar: Calendar) => {
  const getRate = async (currency: NbpCurrency, date: Date) => {
    const exchangeDate = calendar.getPreviousBusinessDay(date);
    const exchangeDateFormatted = format(exchangeDate, "yyyy-MM-dd");

    const url = makeUrl(currency, exchangeDateFormatted);

    const response = await fetch(url);
    const result = (await response.json()) as NbpResponse;

    return result.rates[0].mid;
  };

  return { getRate };
};

export type Exchange = ReturnType<typeof makeExchange>;
