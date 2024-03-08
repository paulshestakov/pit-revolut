import Holidays from "date-holidays";
import { subBusinessDays } from "date-fns";

enum DayOfWeek {
  Sunday = 0,
  Saturday = 6,
}

export const makeCalendar = () => {
  const isWorkday = (date: Date) => {
    const holidays = new Holidays();
    holidays.init("PL");

    return date.getDay() !== DayOfWeek.Sunday && date.getDay() !== DayOfWeek.Saturday && !holidays.isHoliday(date);
  };

  const getPreviousBusinessDay = (date: Date) => {
    const prevBusinessDay = subBusinessDays(date, 1);
    let result = prevBusinessDay;
    while (!isWorkday(result)) {
      result = subBusinessDays(result, 1);
    }
    return result;
  };

  return {
    getPreviousBusinessDay,
  };
};

export type Calendar = ReturnType<typeof makeCalendar>;
