import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import { financeApi } from "./api/financeApi";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { AccountForm } from "./components/AccountForm";
import { AccountTabs } from "./components/AccountTabs";
import { AccountsPanel } from "./components/AccountsPanel";
import { AutomationForm } from "./components/AutomationForm";
import { AutomationsList } from "./components/AutomationsList";
import { AuthScreen } from "./components/AuthScreen";
import { Modal } from "./components/Modal";
import { MonthlyHistoryScreen } from "./components/MonthlyHistoryScreen";
import { SummaryPanel } from "./components/SummaryPanel";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionsTable } from "./components/TransactionsTable";
import { TransferForm } from "./components/TransferForm";
import { FinanceSummary, MonthlyHistory, Transaction } from "./types";

type ActiveModal = "transaction" | "edit-transaction" | "delete-transaction" | "transfer" | "account" | "automation" | null;
type ActiveView = "dashboard" | "history";

function FinanceApp() {
  const { signOut, user } = useAuth();
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [monthlyHistory, setMonthlyHistory] = useState<MonthlyHistory | null>(null);
  const [activeAccountId, setActiveAccountId] = useState("general");
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [areValuesVisible, setAreValuesVisible] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadSummary = useCallback(async () => {
    try {
      setError("");
      const data = await financeApi.getSummary();
      setSummary(data);

      setActiveAccountId((currentAccountId) =>
        data.accounts.some((account) => account.id === currentAccountId) ? currentAccountId : data.accounts[0]?.id || "general"
      );
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Nao foi possivel carregar os dados");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMonthlyHistory = useCallback(async () => {
    try {
      setError("");
      setMonthlyHistory(await financeApi.getMonthlyHistory());
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Nao foi possivel carregar o historico");
    }
  }, []);

  async function applyAction(action: () => Promise<FinanceSummary>) {
    try {
      setError("");
      setSummary(await action());
      setMonthlyHistory(null);
      setActiveModal(null);
      setSelectedTransaction(null);
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Nao foi possivel salvar");
    }
  }

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    if (activeView === "history" && !monthlyHistory) {
      loadMonthlyHistory();
    }
  }, [activeView, loadMonthlyHistory, monthlyHistory]);

  const selectedAccount = useMemo(() => {
    return summary?.accounts.find((account) => account.id === activeAccountId) || summary?.accounts[0] || null;
  }, [activeAccountId, summary]);

  const selectedTransactions = useMemo(() => {
    if (!summary || !selectedAccount) {
      return [];
    }

    return summary.transactions.filter((transaction) => transaction.accountId === selectedAccount.id);
  }, [selectedAccount, summary]);

  const selectedSpentThisMonth = useMemo(() => {
    const monthKey = new Date().toISOString().slice(0, 7);

    return selectedTransactions
      .filter((transaction) => transaction.type === "expense" && transaction.date.slice(0, 7) === monthKey)
      .reduce((total, transaction) => total + transaction.amount, 0);
  }, [selectedTransactions]);

  const selectedAutomations = useMemo(() => {
    if (!summary || !selectedAccount) {
      return [];
    }

    return summary.automations.filter(
      (automation) => automation.fromAccountId === selectedAccount.id || automation.toAccountId === selectedAccount.id
    );
  }, [selectedAccount, summary]);

  if (isLoading) {
    return (
      <main className="mx-auto grid min-h-dvh max-w-6xl place-items-center p-6">
        <div className="surface w-full max-w-md p-6">
          <div className="skeleton h-3 w-28" />
          <div className="skeleton mt-5 h-12" />
          <div className="skeleton mt-3 h-24" />
        </div>
      </main>
    );
  }

  if (!summary || !selectedAccount) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <p className="border border-[#d8a2a2]/40 bg-[#3a2d3d] p-4 text-negative">
          {error || "Nao foi possivel conectar ao backend"}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-[1360px] gap-5 p-4 md:p-6">
      <header className="flex flex-col gap-4 py-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mt-1 text-3xl font-semibold text-strong">Cash Management</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="hidden items-center px-2 text-sm text-muted md:flex">{user?.email}</span>
          <button
            className={activeView === "dashboard" ? "btn-primary" : "btn-secondary"}
            onClick={() => setActiveView("dashboard")}
            type="button"
          >
            Dashboard
          </button>
          <button
            className={activeView === "history" ? "btn-primary" : "btn-secondary"}
            onClick={() => setActiveView("history")}
            type="button"
          >
            Historico mensal
          </button>
          <button className="btn-secondary" onClick={loadSummary} type="button">
            Atualizar
          </button>
          <button className="btn-secondary" onClick={() => void signOut()} type="button">
            Sair
          </button>
        </div>
      </header>

      {error ? <p className="border border-[#d8a2a2]/40 bg-[#3a2d3d] p-3 text-sm text-negative">{error}</p> : null}

      {activeView === "history" ? (
        monthlyHistory ? (
          <MonthlyHistoryScreen
            accounts={summary.accounts}
            history={monthlyHistory}
            onRefresh={loadMonthlyHistory}
          />
        ) : (
          <section className="surface p-8">
            <div className="skeleton h-3 w-28" />
            <div className="skeleton mt-5 h-12" />
            <div className="skeleton mt-3 h-56" />
          </section>
        )
      ) : (
        <>
          <AccountTabs
            accounts={summary.accounts}
            activeAccountId={selectedAccount.id}
            areValuesVisible={areValuesVisible}
            onSelectAccount={setActiveAccountId}
          />

          <SummaryPanel
            selectedAccount={selectedAccount}
            selectedSpentThisMonth={selectedSpentThisMonth}
            areValuesVisible={areValuesVisible}
            onAddTransaction={() => setActiveModal("transaction")}
            onCreateTransfer={() => setActiveModal("transfer")}
            onCreateAccount={() => setActiveModal("account")}
            onCreateAutomation={() => setActiveModal("automation")}
            onTogglePrivacy={() => setAreValuesVisible((isVisible) => !isVisible)}
          />

          <section className="grid w-full gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
            <TransactionsTable
              accounts={summary.accounts}
              title={`Historico de ${selectedAccount.name}`}
              transactions={selectedTransactions}
              onEditTransaction={(transaction) => {
                setSelectedTransaction(transaction);
                setActiveModal("edit-transaction");
              }}
              onDeleteTransaction={(transaction) => {
                setSelectedTransaction(transaction);
                setActiveModal("delete-transaction");
              }}
            />

            <div className="grid min-w-0 gap-5">
              <AccountsPanel accounts={summary.accounts} areValuesVisible={areValuesVisible} />

              <section className="surface p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="mt-1 text-lg font-semibold">Automacoes deste caixa</h2>
                  </div>
                  <span className="badge px-3 py-1 text-sm">{selectedAutomations.length}</span>
                </div>
                <AutomationsList accounts={summary.accounts} automations={selectedAutomations} />
              </section>
            </div>
          </section>
        </>
      )}

      <Modal isOpen={activeModal === "transaction"} onClose={() => setActiveModal(null)} title="Adicionar movimentacao">
        <TransactionForm
          selectedAccount={selectedAccount}
          onSubmitTransaction={(payload) => applyAction(() => financeApi.createTransaction(payload))}
        />
      </Modal>

      <Modal isOpen={activeModal === "edit-transaction" && Boolean(selectedTransaction)} onClose={() => setActiveModal(null)} title="Editar movimentacao">
        {selectedTransaction ? (
          <TransactionForm
            initialTransaction={selectedTransaction}
            selectedAccount={selectedAccount}
            submitLabel="Salvar alteracoes"
            onSubmitTransaction={(payload) => applyAction(() => financeApi.updateTransaction(selectedTransaction.id, payload))}
          />
        ) : null}
      </Modal>

      <Modal isOpen={activeModal === "delete-transaction" && Boolean(selectedTransaction)} onClose={() => setActiveModal(null)} title="Excluir movimentacao">
        {selectedTransaction ? (
          <div className="grid gap-4">
            <div className="surface-soft p-4">
              <p className="text-sm text-muted">Esta acao remove a movimentacao e recalcula o saldo da caixa.</p>
              <strong className="mt-3 block">{selectedTransaction.title}</strong>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <button className="btn-secondary h-11" onClick={() => setActiveModal(null)} type="button">
                Cancelar
              </button>
              <button
                className="h-11 border border-[#d8a2a2]/35 px-4 py-2 text-sm font-semibold text-negative hover:bg-[#3a2d3d]"
                onClick={() => applyAction(() => financeApi.deleteTransaction(selectedTransaction.id))}
                type="button"
              >
                Excluir movimentacao
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal isOpen={activeModal === "transfer"} onClose={() => setActiveModal(null)} title="Separar ou mover dinheiro">
        <TransferForm
          accounts={summary.accounts}
          selectedAccount={selectedAccount}
          onCreateTransfer={(payload) => applyAction(() => financeApi.createTransfer(payload))}
        />
      </Modal>

      <Modal isOpen={activeModal === "account"} onClose={() => setActiveModal(null)} title="Criar caixa">
        <AccountForm onCreateAccount={(payload) => applyAction(() => financeApi.createAccount(payload))} />
      </Modal>

      <Modal isOpen={activeModal === "automation"} onClose={() => setActiveModal(null)} title="Criar automacao">
        <AutomationForm
          accounts={summary.accounts}
          selectedAccount={selectedAccount}
          onCreateAutomation={(payload) => applyAction(() => financeApi.createAutomation(payload))}
        />
      </Modal>
    </main>
  );
}

function AppContent() {
  const { isLoading, session } = useAuth();

  if (isLoading) {
    return (
      <main className="mx-auto grid min-h-dvh max-w-6xl place-items-center p-6">
        <div className="surface w-full max-w-md p-6">
          <div className="skeleton h-3 w-28" />
          <div className="skeleton mt-5 h-12" />
          <div className="skeleton mt-3 h-24" />
        </div>
      </main>
    );
  }

  return session ? <FinanceApp /> : <AuthScreen />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
