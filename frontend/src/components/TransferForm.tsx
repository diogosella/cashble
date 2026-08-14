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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onCreateTransfer({
      fromAccountId: selectedAccount.id,
      toAccountId,
      amount: Number(amount),
      title,
      date: todayInputValue(),
    });

    setAmount("");
  }

  return (
    <form className="modal-input-grid" onSubmit={handleSubmit}>
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

      <button className="btn-primary h-11" type="submit">
        Confirmar transferencia
      </button>
    </form>
  );
}
