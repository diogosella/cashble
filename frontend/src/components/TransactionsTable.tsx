import { Account, Transaction } from "../types";
import { formatMoney } from "../utils/money";

type TransactionsTableProps = {
  accounts: Account[];
  transactions: Transaction[];
  title?: string;
  onEditTransaction?: (transaction: Transaction) => void;
  onDeleteTransaction?: (transaction: Transaction) => void;
};

export function TransactionsTable({
  accounts,
  transactions,
  title = "Historico do mes",
  onEditTransaction,
  onDeleteTransaction,
}: TransactionsTableProps) {
  const hasActions = Boolean(onEditTransaction || onDeleteTransaction);

  function getAccountName(accountId: string) {
    return accounts.find((account) => account.id === accountId)?.name || "Caixa";
  }

  function renderActions(transaction: Transaction) {
    if (!hasActions) {
      return null;
    }

    return (
      <div className="flex flex-wrap justify-end gap-2">
        {onEditTransaction ? (
          <button
            className="btn-quiet min-h-9 border border-[#4c536d] px-3 py-1"
            onClick={() => onEditTransaction(transaction)}
            type="button"
          >
            Editar
          </button>
        ) : null}
        {onDeleteTransaction ? (
          <button
            className="min-h-9 border border-[#d8a2a2] px-3 py-1 text-sm font-semibold text-negative hover:bg-[#3a2d3d]"
            onClick={() => onDeleteTransaction(transaction)}
            type="button"
          >
            Excluir
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <section className="surface min-w-0 p-4">
      <div className="mb-4 grid gap-3 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="mt-1 text-lg font-semibold">{title}</h2>
        </div>
        <span className="badge w-fit px-3 py-1 text-sm">{transactions.length} registros</span>
      </div>

      {transactions.length === 0 ? (
        <div className="surface-soft p-8 text-center">
          <p className="font-semibold">Nenhuma movimentacao neste caixa</p>
          <p className="mt-1 text-sm text-muted">Use o botao de adicionar movimentacao para registrar o primeiro item.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {transactions.slice(0, 12).map((transaction) => (
              <article className="surface-soft grid gap-3 p-3" key={transaction.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <strong className="block truncate">{transaction.title}</strong>
                    <span className="mt-1 block truncate text-xs text-muted">{getAccountName(transaction.accountId)}</span>
                  </div>
                  <strong className={transaction.type === "expense" ? "shrink-0 text-sm text-negative" : "shrink-0 text-sm text-positive"}>
                    {transaction.type === "expense" ? "-" : "+"}
                    {formatMoney(transaction.amount)}
                  </strong>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-[#4c536d] pt-3 text-xs">
                  <div>
                    <span className="block uppercase text-muted">Data</span>
                    <span className="mt-1 block">{new Date(transaction.date).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div>
                    <span className="block uppercase text-muted">Saldo</span>
                    <span className="mt-1 block">{formatMoney(transaction.remainingBalance)}</span>
                  </div>
                </div>

                {hasActions ? <div className="border-t border-[#4c536d] pt-3">{renderActions(transaction)}</div> : null}
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-[720px] w-full table-fixed border-collapse text-left text-sm">
            <colgroup>
              {hasActions ? (
                <>
                  <col className="w-[12%]" />
                  <col className="w-[17%]" />
                  <col className="w-[24%]" />
                  <col className="w-[14%]" />
                  <col className="w-[15%]" />
                  <col className="w-[18%]" />
                </>
              ) : (
                <>
                  <col className="w-[14%]" />
                  <col className="w-[18%]" />
                  <col className="w-[32%]" />
                  <col className="w-[17%]" />
                  <col className="w-[19%]" />
                </>
              )}
            </colgroup>
            <thead>
              <tr className="border-b border-[#4c536d] text-xs uppercase text-muted">
                <th className="py-3 pr-3">Data</th>
                <th className="py-3 pr-3">Caixa</th>
                <th className="py-3 pr-3">Descricao</th>
                <th className="py-3 pr-3">Preco</th>
                <th className="py-3 pr-3">Remaining</th>
                {hasActions ? <th className="py-3 pr-3 text-right">Acoes</th> : null}
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 12).map((transaction) => (
                <tr className="border-b border-[#4c536d] last:border-0" key={transaction.id}>
                  <td className="truncate py-3 pr-3 text-muted">{new Date(transaction.date).toLocaleDateString("pt-BR")}</td>
                  <td className="truncate py-3 pr-3">{getAccountName(transaction.accountId)}</td>
                  <td className="truncate py-3 pr-3 font-medium">{transaction.title}</td>
                  <td className={transaction.type === "expense" ? "truncate py-3 pr-3 font-semibold text-negative" : "truncate py-3 pr-3 font-semibold text-positive"}>
                    {transaction.type === "expense" ? "-" : "+"}
                    {formatMoney(transaction.amount)}
                  </td>
                  <td className="truncate py-3 pr-3">{formatMoney(transaction.remainingBalance)}</td>
                  {hasActions ? (
                    <td className="py-3 pr-3">
                      {renderActions(transaction)}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
