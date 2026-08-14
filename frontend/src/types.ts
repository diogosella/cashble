export type AccountKind = "main" | "saving" | "isolated";

export type TransactionType = "income" | "expense";

export type AutomationKind = "saving" | "expense";

export type Account = {
  id: string;
  name: string;
  kind: AccountKind;
  balance: number;
  target: number | null;
  monthlyContribution: number;
};

export type Transaction = {
  id: string;
  accountId: string;
  type: TransactionType;
  title: string;
  amount: number;
  date: string;
  remainingBalance: number;
  automationId?: string;
};

export type Automation = {
  id: string;
  name: string;
  kind: AutomationKind;
  amount: number;
  dayOfMonth: number;
  fromAccountId: string;
  toAccountId: string | null;
  active: boolean;
  lastRunMonth: string | null;
};

export type FinanceSummary = {
  currency: string;
  totals: {
    available: number;
    allocated: number;
    netWorth: number;
    spentThisMonth: number;
  };
  accounts: Account[];
  transactions: Transaction[];
  automations: Automation[];
  automationRun?: {
    applied: string[];
    skipped: string[];
  };
};

export type MonthlyAccountHistory = {
  accountId: string;
  income: number;
  expenses: number;
  netChange: number;
  transactionCount: number;
};

export type MonthlyHistoryItem = {
  month: string;
  income: number;
  expenses: number;
  netChange: number;
  transactionCount: number;
  transactions: Transaction[];
  accounts: MonthlyAccountHistory[];
};

export type MonthlyHistory = {
  currency: string;
  months: MonthlyHistoryItem[];
};
