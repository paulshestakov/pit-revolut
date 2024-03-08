import { expect, test, describe } from "bun:test";
import { makeCalendar } from "./calendar";

const calendar = makeCalendar();

describe("getPreviousBusinessDay", () => {
  test("sunday -> friday", () => {
    expect(calendar.getPreviousBusinessDay(new Date("2023-11-19T04:05:32.790Z"))).toEqual(
      new Date("2023-11-17T04:05:32.790Z"),
    );
  });

  test("saturday -> friday", () => {
    expect(calendar.getPreviousBusinessDay(new Date("2023-11-18T04:05:32.790Z"))).toEqual(
      new Date("2023-11-17T04:05:32.790Z"),
    );
  });

  test("friday -> previous thursday", () => {
    expect(calendar.getPreviousBusinessDay(new Date("2023-11-17T04:05:32.790Z"))).toEqual(
      new Date("2023-11-16T04:05:32.790Z"),
    );
  });

  test("christmas monday -> previous friday", () => {
    expect(calendar.getPreviousBusinessDay(new Date("2023-12-25T04:05:32.790Z"))).toEqual(
      new Date("2023-12-22T04:05:32.790Z"),
    );
  });
});
