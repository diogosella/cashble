export function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function todayInputValue(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function currentMonthKey(date = new Date()) {
  return todayInputValue(date).slice(0, 7);
}

export function formatDateInput(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

  if (!match) {
    return new Date(value).toLocaleDateString("pt-BR");
  }

  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}
