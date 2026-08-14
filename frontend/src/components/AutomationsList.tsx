import { Account, Automation } from "../types";
import { formatMoney } from "../utils/money";

type AutomationsListProps = {
  accounts: Account[];
  automations: Automation[];
};

export function AutomationsList({ accounts, automations }: AutomationsListProps) {
  function getAccountName(accountId: string | null) {
    return accounts.find((account) => account.id === accountId)?.name || "Caixa";
  }

  if (automations.length === 0) {
    return (
      <div className="surface-soft p-5 text-sm text-muted">
        Nenhuma automacao conectada a este caixa.
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {automations.map((automation) => (
        <article className="surface-soft p-3" key={automation.id}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">{automation.name}</h3>
              <p className="mt-1 text-sm text-muted">
                Dia {automation.dayOfMonth} - {automation.kind === "saving" ? getAccountName(automation.toAccountId) : getAccountName(automation.fromAccountId)}
              </p>
            </div>
            <strong>{formatMoney(automation.amount)}</strong>
          </div>
        </article>
      ))}
    </div>
  );
}
