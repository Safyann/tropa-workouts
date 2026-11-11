export function localDay(timestamp: number) {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function monthStart(timestamp: number, offset = 0) {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth() + offset, 1).getTime();
}

export function addDays(timestamp: number, offset: number) {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset).getTime();
}

export function calendarWeeks(month: number) {
  const first = new Date(month);
  const leadingDays = (first.getDay() + 6) % 7;
  const year = first.getFullYear();
  const monthIndex = first.getMonth();
  const days = new Date(year, monthIndex + 1, 0).getDate();

  return Array.from({ length: Math.ceil((leadingDays + days) / 7) }, (_, week) =>
    Array.from({ length: 7 }, (_, weekday) => {
      const day = week * 7 + weekday - leadingDays + 1;
      return day >= 1 && day <= days ? new Date(year, monthIndex, day).getTime() : null;
    }),
  );
}
