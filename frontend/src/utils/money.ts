export function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}
