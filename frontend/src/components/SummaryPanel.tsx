import { Account } from "../types";
import { formatMoney } from "../utils/money";

type SummaryPanelProps = {
  selectedAccount: Account;
  selectedSpentThisMonth: number;
  areValuesVisible: boolean;
  onAddTransaction: () => void;
  onCreateTransfer: () => void;
  onCreateAccount: () => void;
  onCreateAutomation: () => void;
  onTogglePrivacy: () => void;
};

function EyeIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m3 3 18 18" />
      <path d="M10.6 10.6A2 2 0 0 0 13.4 13.4" />
      <path d="M9.9 4.3A10.7 10.7 0 0 1 12 4c6.5 0 10 8 10 8a18.5 18.5 0 0 1-2.3 3.4" />
      <path d="M6.6 6.6C3.6 8.6 2 12 2 12s3.5 8 10 8a10.8 10.8 0 0 0 4.2-.8" />
    </svg>
  );
}

export function SummaryPanel({
  selectedAccount,
  selectedSpentThisMonth,
  areValuesVisible,
  onAddTransaction,
  onCreateTransfer,
  onCreateAccount,
  onCreateAutomation,
  onTogglePrivacy,
}: SummaryPanelProps) {
  const progress = selectedAccount.target ? Math.min((selectedAccount.balance / selectedAccount.target) * 100, 100) : 0;
  const displayedBalance = areValuesVisible ? formatMoney(selectedAccount.balance) : "******";
  const displayedSpentThisMonth = areValuesVisible ? formatMoney(selectedSpentThisMonth) : "******";

  return (
    <section className="summary-hero min-w-0 p-6">
      <div className="mt-4 grid gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
            <div>
              <h1 className="text-5xl font-semibold text-strong md:text-6xl">{displayedBalance}</h1>
              <p className="mt-2 text-sm text-muted">{selectedAccount.name}</p>
            </div>
            <button
              aria-label={areValuesVisible ? "Ocultar valores" : "Mostrar valores"}
              className="grid h-10 w-10 place-items-center bg-transparent p-0 text-muted hover:text-strong lg:mt-2"
              onClick={onTogglePrivacy}
              title={areValuesVisible ? "Ocultar valores" : "Mostrar valores"}
              type="button"
            >
              {areValuesVisible ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <div className="w-full md:text-right">
          <p className="text-sm font-semibold text-muted">{new Date().toLocaleDateString("pt-BR")}</p>
          <p className="mt-3 text-2xl font-semibold">{displayedSpentThisMonth}</p>
          <p className="mt-1 text-sm text-muted">Gasto neste mes</p>
        </div>

        <div className="grid gap-2 md:col-span-2 md:grid-cols-[1.4fr_1.35fr_0.85fr_0.95fr]">
          <button className="btn-primary h-11 whitespace-nowrap px-5" onClick={onAddTransaction} type="button">
            Adicionar movimentacao
          </button>
          <button className="btn-secondary h-11 whitespace-nowrap px-4" onClick={onCreateTransfer} type="button">
            Separar ou mover dinheiro
          </button>
          <button className="btn-secondary h-11 whitespace-nowrap px-4" onClick={onCreateAccount} type="button">
            Criar caixa
          </button>
          <button className="btn-secondary h-11 whitespace-nowrap px-4" onClick={onCreateAutomation} type="button">
            Criar automacao
          </button>
        </div>
      </div>

      {selectedAccount.target ? (
        <div className="mt-6 w-full">
          <div className="max-w-md">
            <div className="mb-2 flex justify-between text-xs text-muted">
              <span>Meta {formatMoney(selectedAccount.target)}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 overflow-hidden bg-[#202136]">
              <div className="h-full bg-[#9ac9d6]" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
