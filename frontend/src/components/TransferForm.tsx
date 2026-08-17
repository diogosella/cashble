import { FormEvent, useState } from "react";
import { Account } from "../types";
import { todayInputValue } from "../utils/money";

type TransferFormProps = {
  accounts: Account[];
  selectedAccount: Account;
  onCreateTransfer: (payload: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    title: string;
    date: string;
  }) => Promise<void>;
};

export function TransferForm({ accounts, selectedAccount, onCreateTransfer }: TransferFormProps) {
  const targetAccounts = accounts.filter((account) => account.id !== selectedAccount.id);
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("Separar dinheiro");
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

      await onCreateTransfer({
        fromAccountId: selectedAccount.id,
        toAccountId,
        amount: Number(amount),
        title,
        date: todayInputValue(),
      });

      setAmount("");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Nao foi possivel confirmar a transferencia");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="modal-input-grid" onSubmit={handleSubmit}>
      <fieldset className="grid gap-3 disabled:cursor-wait disabled:opacity-70" disabled={isSubmitting}>
        <div className="surface-soft p-3">
          <p className="text-xs font-medium text-muted">Origem</p>
          <strong>{selectedAccount.name}</strong>
        </div>

        <select className="control" value={toAccountId} onChange={(event) => setToAccountId(event.target.value)} required>
          <option value="">Mover para qual caixa?</option>
          {targetAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>

        <input className="control" placeholder="Descricao" value={title} onChange={(event) => setTitle(event.target.value)} required />

        <input
          className="control"
          min="0.01"
          placeholder="Valor"
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
            "Confirmar transferencia"
          )}
        </button>
      </fieldset>
    </form>
  );
}
