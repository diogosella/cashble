import { FormEvent, useMemo, useState } from "react";
import { Account } from "../types";

type AutomationFormProps = {
  accounts: Account[];
  selectedAccount: Account;
  onCreateAutomation: (payload: {
    name: string;
    kind: "saving" | "expense";
    amount: number;
    dayOfMonth: number;
    fromAccountId: string;
    toAccountId: string | null;
  }) => Promise<void>;
};

export function AutomationForm({ accounts, selectedAccount, onCreateAutomation }: AutomationFormProps) {
  const targetAccounts = useMemo(
    () => accounts.filter((account) => account.id !== selectedAccount.id),
    [accounts, selectedAccount.id]
  );
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"saving" | "expense">("saving");
  const [amount, setAmount] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState("5");
  const [toAccountId, setToAccountId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    try {
      setFormError("");
      setIsSubmitting(true);

      await onCreateAutomation({
        name,
        kind,
        amount: Number(amount),
        dayOfMonth: Number(dayOfMonth),
        fromAccountId: selectedAccount.id,
        toAccountId: kind === "saving" ? toAccountId || targetAccounts[0]?.id || null : null,
      });

      setName("");
      setAmount("");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Nao foi possivel criar a automacao");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="modal-input-grid" onSubmit={handleSubmit}>
      <fieldset className="grid gap-3 disabled:cursor-wait disabled:opacity-70" disabled={isSubmitting}>
        <div className="surface-soft p-3">
          <p className="text-xs font-medium text-muted">Caixa de origem</p>
          <strong>{selectedAccount.name}</strong>
        </div>

        <input className="control" placeholder="Nome da cobranca ou saving" value={name} onChange={(event) => setName(event.target.value)} required />

        <div className="grid grid-cols-2 gap-3">
          <select className="control" value={kind} onChange={(event) => setKind(event.target.value as "saving" | "expense")}>
            <option value="saving">Saving mensal</option>
            <option value="expense">Debito mensal</option>
          </select>

          <input
            className="control"
            max="28"
            min="1"
            placeholder="Dia do mes (1 a 28)"
            type="number"
            value={dayOfMonth}
            onChange={(event) => setDayOfMonth(event.target.value)}
            required
          />
        </div>

        {kind === "saving" ? (
          <select className="control" value={toAccountId} onChange={(event) => setToAccountId(event.target.value)} required>
            <option value="">Escolha o caixa destino</option>
            {targetAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        ) : null}

        <input
          className="control"
          min="0.01"
          placeholder="Valor mensal"
          step="0.01"
          type="number"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
        />

        {formError ? (
          <p className="border border-[#d8a2a2] bg-[#3a2d3d] p-3 text-sm text-negative" role="alert">
            {formError}
          </p>
        ) : null}

        <button className="btn-primary flex h-11 items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-70" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="loading-spinner border-[#202136] border-t-transparent" />
              Salvando...
            </>
          ) : (
            "Criar automacao"
          )}
        </button>
      </fieldset>
    </form>
  );
}
