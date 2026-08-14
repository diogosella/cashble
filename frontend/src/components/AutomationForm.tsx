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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
  }

  return (
    <form className="modal-input-grid" onSubmit={handleSubmit}>
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

      <button className="btn-primary h-11" type="submit">
        Criar automacao
      </button>
    </form>
  );
}
