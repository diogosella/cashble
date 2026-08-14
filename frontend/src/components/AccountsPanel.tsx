import { Account } from "../types";
import { formatMoney } from "../utils/money";

type AccountsPanelProps = {
  accounts: Account[];
  areValuesVisible: boolean;
};

export function AccountsPanel({ accounts, areValuesVisible }: AccountsPanelProps) {
  const secondaryAccounts = accounts.filter((account) => account.kind !== "main");

  return (
    <section className="surface p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="mt-1 text-lg font-semibold">Savings e caixas</h2>
        </div>
        <span className="badge px-3 py-1 text-sm">{secondaryAccounts.length} ativos</span>
      </div>

      <div className="grid gap-3">
        {secondaryAccounts.map((account) => {
          const progress = account.target ? Math.min((account.balance / account.target) * 100, 100) : 0;

          return (
            <article className="surface-soft p-4" key={account.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{account.name}</h3>
                  <p className="mt-1 text-xs uppercase text-muted">
                    {account.kind === "saving" ? "Saving" : "Caixa isolado"}
                  </p>
                </div>
                <strong>{areValuesVisible ? formatMoney(account.balance) : "******"}</strong>
              </div>

              {account.target ? (
                <div className="mt-4">
                  <div className="mb-2 flex justify-between text-xs text-muted">
                    <span>Meta {formatMoney(account.target)}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden bg-[#202136]">
                    <div className="h-full bg-[#9ac9d6]" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              ) : null}

              {account.monthlyContribution > 0 ? (
                <p className="mt-3 text-sm text-muted">Mensal planejado: {formatMoney(account.monthlyContribution)}</p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
