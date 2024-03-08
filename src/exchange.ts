import { format } from "date-fns";
import type { Calendar } from "./calendar";

export type ExchangeCurrency = "USD" | "EUR";

type NbpResponse = {
  code: ExchangeCurrency;
  rates: {
    effectiveDate: string;
    mid: number;
  }[];
};

const makeUrl = (currency: ExchangeCurrency, date: string) => {
  return `https://api.nbp.pl/api/exchangerates/rates/a/${currency}/${date}?format=json`;
};

export const makeExchange = (calendar: Calendar) => {
  const getRate = async (currency: ExchangeCurrency, date: Date) => {
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
