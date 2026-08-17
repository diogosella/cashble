import { FormEvent, useState } from "react";
import { Account, Transaction } from "../types";
import { TransactionPayload } from "../api/financeApi";
import { todayInputValue } from "../utils/money";

type TransactionFormProps = {
  selectedAccount: Account;
  initialTransaction?: Transaction;
  submitLabel?: string;
  onSubmitTransaction: (payload: TransactionPayload) => Promise<void>;
};

export function TransactionForm({
  selectedAccount,
  initialTransaction,
  submitLabel = "Salvar movimentacao",
  onSubmitTransaction,
}: TransactionFormProps) {
  const [type, setType] = useState<"income" | "expense">(initialTransaction?.type || "expense");
  const [title, setTitle] = useState(initialTransaction?.title || "");
  const [amount, setAmount] = useState(initialTransaction ? String(initialTransaction.amount) : "");
  const [date, setDate] = useState(initialTransaction?.date || todayInputValue());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const isEditing = Boolean(initialTransaction);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    try {
      setFormError("");
      setIsSubmitting(true);

      await onSubmitTransaction({
        accountId: selectedAccount.id,
        type,
        title,
        amount: Number(amount),
        date,
      });

      if (!isEditing) {
        setTitle("");
        setAmount("");
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Nao foi possivel salvar a movimentacao");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="modal-input-grid" onSubmit={handleSubmit}>
      <fieldset className="grid gap-3 disabled:cursor-wait disabled:opacity-70" disabled={isSubmitting}>
        <div className="surface-soft flex items-center justify-between gap-3 p-3">
          <div>
            <p className="text-xs font-medium text-muted">Caixa selecionado</p>
            <strong>{selectedAccount.name}</strong>
          </div>
          <select className="control max-w-36" value={type} onChange={(event) => setType(event.target.value as "income" | "expense")}>
            <option value="expense">Gasto</option>
            <option value="income">Receita</option>
          </select>
        </div>

        <input className="control" placeholder="Descricao" value={title} onChange={(event) => setTitle(event.target.value)} required />

        <div className="grid gap-3 sm:grid-cols-2">
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

          <input className="control" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
        </div>

        {isSubmitting ? (
          <div className="surface-soft flex items-center gap-3 p-3 text-sm" aria-live="polite">
            <span className="loading-spinner border-[#9ac9d6] border-t-transparent" />
            <span>Salvando movimentacao...</span>
          </div>
        ) : null}

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
            submitLabel
          )}
        </button>
      </fieldset>
    </form>
  );
}
