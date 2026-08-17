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
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Nao foi possivel criar o caixa");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="modal-input-grid" onSubmit={handleSubmit}>
      <fieldset className="grid gap-3 disabled:cursor-wait disabled:opacity-70" disabled={isSubmitting}>
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
            "Criar caixa"
          )}
        </button>
      </fieldset>
    </form>
  );
}
