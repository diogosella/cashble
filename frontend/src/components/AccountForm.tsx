import { FormEvent, useState } from "react";

type AccountFormProps = {
  onCreateAccount: (payload: {
    name: string;
    kind: "saving" | "isolated";
    balance: number;
    target: number | null;
    monthlyContribution: number;
  }) => Promise<void>;
};

export function AccountForm({ onCreateAccount }: AccountFormProps) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"saving" | "isolated">("saving");
  const [balance, setBalance] = useState("");
  const [target, setTarget] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onCreateAccount({
      name,
      kind,
      balance: Number(balance || 0),
      target: target ? Number(target) : null,
      monthlyContribution: Number(monthlyContribution || 0),
    });

    setName("");
    setBalance("");
    setTarget("");
    setMonthlyContribution("");
  }

  return (
    <form className="modal-input-grid" onSubmit={handleSubmit}>
      <input className="control" placeholder="Nome do caixa" value={name} onChange={(event) => setName(event.target.value)} required />

      <div className="grid grid-cols-2 gap-3">
        <select className="control" value={kind} onChange={(event) => setKind(event.target.value as "saving" | "isolated")}>
          <option value="saving">Saving</option>
          <option value="isolated">Caixa isolado</option>
        </select>

        <input className="control" min="0" placeholder="Saldo inicial" step="0.01" type="number" value={balance} onChange={(event) => setBalance(event.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input className="control" min="0" placeholder="Meta" step="0.01" type="number" value={target} onChange={(event) => setTarget(event.target.value)} />

        <input
          className="control"
          min="0"
          placeholder="Mensal"
          step="0.01"
          type="number"
          value={monthlyContribution}
          onChange={(event) => setMonthlyContribution(event.target.value)}
        />
      </div>

      <button className="btn-primary h-11" type="submit">
        Criar caixa
      </button>
    </form>
  );
}
