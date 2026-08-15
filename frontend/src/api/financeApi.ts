import { FinanceSummary, MonthlyHistory } from "../types";

const API_URL =
  process.env.NODE_ENV === "production"
    ? "/api"
    : process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export type TransactionPayload = {
  accountId: string;
  type: "income" | "expense";
  title: string;
  amount: number;
  date: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const financeApi = {
  getSummary() {
    return request<FinanceSummary>("/summary");
  },
  getMonthlyHistory() {
    return request<MonthlyHistory>("/history/months");
  },
  createTransaction(payload: TransactionPayload) {
    return request<FinanceSummary>("/transactions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateTransaction(transactionId: string, payload: TransactionPayload) {
    return request<FinanceSummary>(`/transactions/${transactionId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  deleteTransaction(transactionId: string) {
    return request<FinanceSummary>(`/transactions/${transactionId}`, {
      method: "DELETE",
    });
  },
  createAccount(payload: {
    name: string;
    kind: "saving" | "isolated";
    balance: number;
    target: number | null;
    monthlyContribution: number;
  }) {
    return request<FinanceSummary>("/accounts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  createTransfer(payload: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    title: string;
    date: string;
  }) {
    return request<FinanceSummary>("/transfers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  createAutomation(payload: {
    name: string;
    kind: "saving" | "expense";
    amount: number;
    dayOfMonth: number;
    fromAccountId: string;
    toAccountId: string | null;
  }) {
    return request<FinanceSummary>("/automations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  runAutomations() {
    return request<FinanceSummary>("/automations/run", {
      method: "POST",
      body: JSON.stringify({ date: todayInputValue() }),
    });
  },
};

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}
