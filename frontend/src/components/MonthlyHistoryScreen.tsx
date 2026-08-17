import { useMemo, useState } from "react";
import { Account, MonthlyHistory } from "../types";
import { formatMoney } from "../utils/money";
import { TransactionsTable } from "./TransactionsTable";

type MonthlyHistoryScreenProps = {
  accounts: Account[];
  history: MonthlyHistory;
  onRefresh: () => Promise<void>;
};

function formatMonth(month: string) {
  const date = new Date(`${month}-01T00:00:00`);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function MonthlyHistoryScreen({ accounts, history, onRefresh }: MonthlyHistoryScreenProps) {
  const [activeMonth, setActiveMonth] = useState(history.months[0]?.month || "");
  const selectedMonth = useMemo(() => {
    return history.months.find((month) => month.month === activeMonth) || history.months[0] || null;
  }, [activeMonth, history.months]);

  function getAccountName(accountId: string) {
    return accounts.find((account) => account.id === accountId)?.name || "Caixa";
  }

  if (history.months.length === 0) {
    return (
      <section className="surface p-8 text-center">
        <h2 className="mt-2 text-2xl font-semibold">Nenhum mes passado registrado</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
          Quando houver movimentacoes com datas de meses anteriores, elas aparecem aqui agrupadas por mes.
        </p>
        <button className="btn-secondary mt-6" onClick={onRefresh} type="button">
          Atualizar historico
        </button>
      </section>
    );
  }

  if (!selectedMonth) {
    return null;
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <aside className="surface p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="mt-1 text-lg font-semibold">Historico mensal</h2>
          </div>
          <button className="btn-quiet px-3 py-1" onClick={onRefresh} type="button">
            Atualizar
          </button>
        </div>

        <div className="grid gap-2">
          {history.months.map((month) => {
            const isActive = month.month === selectedMonth.month;

            return (
              <button
                className={
                  isActive
                    ? "bg-[#8493b3] p-4 text-left font-semibold text-[#202136]"
                    : "surface-soft p-4 text-left hover:bg-[#33334b]"
                }
                key={month.month}
                onClick={() => setActiveMonth(month.month)}
                type="button"
              >
                <span className="block text-sm font-semibold capitalize">{formatMonth(month.month)}</span>
                <span className={isActive ? "mt-1 block text-xs text-[#33334b]" : "mt-1 block text-xs text-muted"}>
                  {month.transactionCount} registros
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="grid gap-5">
        <section className="surface p-6">
          <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-semibold capitalize">{formatMonth(selectedMonth.month)}</h2>
              <p className="mt-1 text-sm text-muted">{selectedMonth.transactionCount} movimentacoes registradas</p>
            </div>
            <strong className={selectedMonth.netChange >= 0 ? "text-2xl text-positive" : "text-2xl text-negative"}>
              {formatMoney(selectedMonth.netChange)}
            </strong>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="surface-soft p-4">
              <p className="text-xs text-muted">Entradas</p>
              <strong className="mt-1 block text-lg text-positive">{formatMoney(selectedMonth.income)}</strong>
            </div>
            <div className="surface-soft p-4">
              <p className="text-xs text-muted">Gastos</p>
              <strong className="mt-1 block text-lg text-negative">{formatMoney(selectedMonth.expenses)}</strong>
            </div>
            <div className="surface-soft p-4">
              <p className="text-xs text-muted">Resultado</p>
              <strong className="mt-1 block text-lg">{formatMoney(selectedMonth.netChange)}</strong>
            </div>
          </div>
        </section>

        <section className="surface p-4">
          <div className="mb-4">
            <h2 className="mt-1 text-lg font-semibold">Resumo por caixa</h2>
          </div>

          <div className="grid gap-2">
            {selectedMonth.accounts.map((account) => (
              <article className="surface-soft grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto_auto]" key={account.accountId}>
                <strong>{getAccountName(account.accountId)}</strong>
                <span className="text-sm text-positive">Entradas {formatMoney(account.income)}</span>
                <span className="text-sm text-negative">Gastos {formatMoney(account.expenses)}</span>
                <span className="text-sm font-semibold">Saldo {formatMoney(account.netChange)}</span>
              </article>
            ))}
          </div>
        </section>

        <TransactionsTable
          accounts={accounts}
          title={`Movimentacoes de ${formatMonth(selectedMonth.month)}`}
          transactions={selectedMonth.transactions}
        />
      </div>
    </section>
  );
}
