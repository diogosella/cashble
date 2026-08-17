import { currentMonthKey, formatDateInput, todayInputValue } from "./money";

test("formats date input strings without timezone shifts", () => {
  expect(formatDateInput("2026-08-17")).toBe("17/08/2026");
  expect(formatDateInput("2026-01-05")).toBe("05/01/2026");
});

test("creates local date input values", () => {
  const date = new Date(2026, 7, 17, 0, 30);

  expect(todayInputValue(date)).toBe("2026-08-17");
  expect(currentMonthKey(date)).toBe("2026-08");
});
