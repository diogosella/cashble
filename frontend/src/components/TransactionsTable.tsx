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

  return (
    <section className="surface min-w-0 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="mt-1 text-lg font-semibold">{title}</h2>
        </div>
        <span className="badge px-3 py-1 text-sm">{transactions.length} registros</span>
      </div>

      {transactions.length === 0 ? (
        <div className="surface-soft p-8 text-center">
          <p className="font-semibold">Nenhuma movimentacao neste caixa</p>
          <p className="mt-1 text-sm text-muted">Use o botao de adicionar movimentacao para registrar o primeiro item.</p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <table className="w-full table-fixed border-collapse text-left text-sm">
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
              <tr className="border-b border-[#9ac9d6]/25 text-xs uppercase text-muted">
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
                <tr className="border-b border-[#8493b3]/20 last:border-0" key={transaction.id}>
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
                      <div className="flex justify-end gap-2">
                        {onEditTransaction ? (
                          <button
                            className="btn-quiet border border-[#9ac9d6]/20 px-3 py-1"
                            onClick={() => onEditTransaction(transaction)}
                            type="button"
                          >
                            Editar
                          </button>
                        ) : null}
                        {onDeleteTransaction ? (
                          <button
                            className="border border-[#d8a2a2]/35 px-3 py-1 text-sm font-semibold text-negative hover:bg-[#3a2d3d]"
                            onClick={() => onDeleteTransaction(transaction)}
                            type="button"
                          >
                            Excluir
                          </button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
