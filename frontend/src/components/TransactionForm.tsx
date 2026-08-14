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
  const isEditing = Boolean(initialTransaction);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
  }

  return (
    <form className="modal-input-grid" onSubmit={handleSubmit}>
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

      <button className="btn-primary h-11" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
