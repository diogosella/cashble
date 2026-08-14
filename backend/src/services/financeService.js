const crypto = require("crypto");
const { readState, writeState } = require("../data/store");

function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function getLocalDateInput(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getMonthKey(date) {
  if (typeof date === "string") {
    return date.slice(0, 7);
  }

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function getDayOfMonth(date) {
  if (typeof date === "string") {
    return Number(date.slice(8, 10));
  }

  return date.getDate();
}

function getAccount(state, accountId) {
  const account = state.accounts.find((item) => item.id === accountId);

  if (!account) {
    const error = new Error("Account not found");
    error.status = 404;
    throw error;
  }

  return account;
}

function toAmount(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    const error = new Error("Amount must be greater than zero");
    error.status = 400;
    throw error;
  }

  return Math.round(amount * 100) / 100;
}

function getSignedAmount(transaction) {
  return transaction.type === "income" ? transaction.amount : -transaction.amount;
}

function getBaseBalances(state) {
  const transactionTotals = state.transactions.reduce((totals, transaction) => {
    totals[transaction.accountId] = (totals[transaction.accountId] || 0) + getSignedAmount(transaction);
    return totals;
  }, {});

  return state.accounts.reduce((balances, account) => {
    balances[account.id] = Math.round((account.balance - (transactionTotals[account.id] || 0)) * 100) / 100;
    return balances;
  }, {});
}

function recalculateBalances(state, baseBalances) {
  const transactionIndex = new Map(state.transactions.map((transaction, index) => [transaction.id, index]));

  state.accounts.forEach((account) => {
    let balance = baseBalances[account.id] ?? account.balance;
    const accountTransactions = state.transactions
      .filter((transaction) => transaction.accountId === account.id)
      .sort((first, second) => {
        const dateComparison = first.date.localeCompare(second.date);

        if (dateComparison !== 0) {
          return dateComparison;
        }

        return transactionIndex.get(first.id) - transactionIndex.get(second.id);
      });

    accountTransactions.forEach((transaction) => {
      balance = Math.round((balance + getSignedAmount(transaction)) * 100) / 100;

      if (balance < 0) {
        const error = new Error("Insufficient balance");
        error.status = 400;
        throw error;
      }

      transaction.remainingBalance = balance;
    });

    account.balance = balance;
  });
}

function getTransactionIndex(state, transactionId) {
  const transactionIndex = state.transactions.findIndex((transaction) => transaction.id === transactionId);

  if (transactionIndex === -1) {
    const error = new Error("Transaction not found");
    error.status = 404;
    throw error;
  }

  return transactionIndex;
}

function summarize(state) {
  const mainAccount = state.accounts.find((account) => account.kind === "main");
  const allocatedBalance = state.accounts
    .filter((account) => account.kind !== "main")
    .reduce((total, account) => total + account.balance, 0);
  const netWorth = state.accounts.reduce((total, account) => total + account.balance, 0);
  const monthKey = getMonthKey(new Date());
  const spentThisMonth = state.transactions
    .filter((transaction) => transaction.type === "expense" && getMonthKey(transaction.date) === monthKey)
    .reduce((total, transaction) => total + transaction.amount, 0);

  return {
    currency: state.currency,
    totals: {
      available: mainAccount ? mainAccount.balance : 0,
      allocated: Math.round(allocatedBalance * 100) / 100,
      netWorth: Math.round(netWorth * 100) / 100,
      spentThisMonth: Math.round(spentThisMonth * 100) / 100,
    },
    accounts: state.accounts,
    transactions: [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)),
    automations: state.automations,
  };
}

async function getSummary() {
  return summarize(await readState());
}

async function getMonthlyHistory() {
  const state = await readState();
  const currentMonthKey = getMonthKey(new Date());
  const monthsByKey = {};

  state.transactions.forEach((transaction) => {
    const monthKey = getMonthKey(transaction.date);

    if (monthKey === currentMonthKey) {
      return;
    }

    if (!monthsByKey[monthKey]) {
      monthsByKey[monthKey] = {
        month: monthKey,
        income: 0,
        expenses: 0,
        netChange: 0,
        transactionCount: 0,
        transactions: [],
        accounts: {},
      };
    }

    const month = monthsByKey[monthKey];
    const accountSummary = month.accounts[transaction.accountId] || {
      accountId: transaction.accountId,
      income: 0,
      expenses: 0,
      netChange: 0,
      transactionCount: 0,
    };

    if (transaction.type === "income") {
      month.income += transaction.amount;
      accountSummary.income += transaction.amount;
    } else {
      month.expenses += transaction.amount;
      accountSummary.expenses += transaction.amount;
    }

    month.netChange = Math.round((month.income - month.expenses) * 100) / 100;
    month.transactionCount += 1;
    month.transactions.push(transaction);

    accountSummary.netChange = Math.round((accountSummary.income - accountSummary.expenses) * 100) / 100;
    accountSummary.transactionCount += 1;
    month.accounts[transaction.accountId] = accountSummary;
  });

  const months = Object.values(monthsByKey)
    .map((month) => ({
      ...month,
      income: Math.round(month.income * 100) / 100,
      expenses: Math.round(month.expenses * 100) / 100,
      accounts: Object.values(month.accounts).sort((a, b) => b.transactionCount - a.transactionCount),
      transactions: month.transactions.sort((a, b) => new Date(b.date) - new Date(a.date)),
    }))
    .sort((a, b) => b.month.localeCompare(a.month));

  return {
    currency: state.currency,
    months,
  };
}

async function createAccount(input) {
  const state = await readState();
  const balance = input.balance ? toAmount(input.balance) : 0;
  const target = input.target ? toAmount(input.target) : null;
  const monthlyContribution = input.monthlyContribution ? toAmount(input.monthlyContribution) : 0;

  const account = {
    id: createId("account"),
    name: String(input.name || "").trim(),
    kind: input.kind === "saving" ? "saving" : "isolated",
    balance,
    target,
    monthlyContribution,
  };

  if (!account.name) {
    const error = new Error("Account name is required");
    error.status = 400;
    throw error;
  }

  state.accounts.push(account);
  return summarize(await writeState(state));
}

async function createTransaction(input) {
  const state = await readState();
  const baseBalances = getBaseBalances(state);
  const account = getAccount(state, input.accountId);
  const amount = toAmount(input.amount);
  const type = input.type === "income" ? "income" : "expense";

  state.transactions.push({
    id: createId("tx"),
    accountId: account.id,
    type,
    title: String(input.title || "").trim() || (type === "income" ? "Money received" : "Spent money"),
    amount,
    date: input.date || getLocalDateInput(),
    remainingBalance: account.balance,
  });

  recalculateBalances(state, baseBalances);
  return summarize(await writeState(state));
}

async function updateTransaction(transactionId, input) {
  const state = await readState();
  const baseBalances = getBaseBalances(state);
  const transactionIndex = getTransactionIndex(state, transactionId);
  const currentTransaction = state.transactions[transactionIndex];
  const account = getAccount(state, input.accountId || currentTransaction.accountId);
  const type = input.type === "income" ? "income" : "expense";
  const amount = toAmount(input.amount ?? currentTransaction.amount);

  state.transactions[transactionIndex] = {
    ...currentTransaction,
    accountId: account.id,
    type,
    title: String(input.title ?? currentTransaction.title).trim() || (type === "income" ? "Money received" : "Spent money"),
    amount,
    date: input.date || currentTransaction.date || getLocalDateInput(),
  };

  recalculateBalances(state, baseBalances);
  return summarize(await writeState(state));
}

async function deleteTransaction(transactionId) {
  const state = await readState();
  const baseBalances = getBaseBalances(state);
  const transactionIndex = getTransactionIndex(state, transactionId);

  state.transactions.splice(transactionIndex, 1);
  recalculateBalances(state, baseBalances);
  return summarize(await writeState(state));
}

async function createTransfer(input) {
  const state = await readState();
  const fromAccount = getAccount(state, input.fromAccountId);
  const toAccount = getAccount(state, input.toAccountId);
  const amount = toAmount(input.amount);
  const date = input.date || getLocalDateInput();
  const title = String(input.title || "").trim() || `Transfer to ${toAccount.name}`;

  if (fromAccount.id === toAccount.id) {
    const error = new Error("Accounts must be different");
    error.status = 400;
    throw error;
  }

  if (fromAccount.balance < amount) {
    const error = new Error("Insufficient balance");
    error.status = 400;
    throw error;
  }

  fromAccount.balance = Math.round((fromAccount.balance - amount) * 100) / 100;
  toAccount.balance = Math.round((toAccount.balance + amount) * 100) / 100;

  state.transactions.push({
    id: createId("tx"),
    accountId: fromAccount.id,
    type: "expense",
    title,
    amount,
    date,
    remainingBalance: fromAccount.balance,
  });

  state.transactions.push({
    id: createId("tx"),
    accountId: toAccount.id,
    type: "income",
    title: `Received from ${fromAccount.name}`,
    amount,
    date,
    remainingBalance: toAccount.balance,
  });

  return summarize(await writeState(state));
}

async function createAutomation(input) {
  const state = await readState();
  const kind = input.kind === "saving" ? "saving" : "expense";
  const automation = {
    id: createId("auto"),
    name: String(input.name || "").trim(),
    kind,
    amount: toAmount(input.amount),
    dayOfMonth: Math.min(Math.max(Number(input.dayOfMonth) || 1, 1), 28),
    fromAccountId: input.fromAccountId || "general",
    toAccountId: kind === "saving" ? input.toAccountId : null,
    active: true,
    lastRunMonth: null,
  };

  getAccount(state, automation.fromAccountId);

  if (automation.toAccountId) {
    getAccount(state, automation.toAccountId);
  }

  if (!automation.name) {
    const error = new Error("Automation name is required");
    error.status = 400;
    throw error;
  }

  state.automations.push(automation);
  return summarize(await writeState(state));
}

async function runMonthlyAutomations(input = {}) {
  const state = await readState();
  const date = input.date || getLocalDateInput();
  const day = getDayOfMonth(date);
  const monthKey = getMonthKey(date);
  const applied = [];
  const skipped = [];

  state.automations.forEach((automation) => {
    if (!automation.active || automation.lastRunMonth === monthKey || automation.dayOfMonth > day) {
      skipped.push(automation.id);
      return;
    }

    if (automation.kind === "expense") {
      const account = getAccount(state, automation.fromAccountId);

      if (account.balance < automation.amount) {
        skipped.push(automation.id);
        return;
      }

      account.balance = Math.round((account.balance - automation.amount) * 100) / 100;
      state.transactions.push({
        id: createId("tx"),
        accountId: account.id,
        type: "expense",
        title: automation.name,
        amount: automation.amount,
        date,
        remainingBalance: account.balance,
        automationId: automation.id,
      });
    }

    if (automation.kind === "saving") {
      const fromAccount = getAccount(state, automation.fromAccountId);
      const toAccount = getAccount(state, automation.toAccountId);
      const remainingTarget = toAccount.target ? Math.max(toAccount.target - toAccount.balance, 0) : automation.amount;
      const transferAmount = Math.min(automation.amount, remainingTarget);

      if (transferAmount <= 0 || fromAccount.balance < transferAmount) {
        skipped.push(automation.id);
        return;
      }

      fromAccount.balance = Math.round((fromAccount.balance - transferAmount) * 100) / 100;
      toAccount.balance = Math.round((toAccount.balance + transferAmount) * 100) / 100;

      state.transactions.push({
        id: createId("tx"),
        accountId: fromAccount.id,
        type: "expense",
        title: automation.name,
        amount: transferAmount,
        date,
        remainingBalance: fromAccount.balance,
        automationId: automation.id,
      });

      state.transactions.push({
        id: createId("tx"),
        accountId: toAccount.id,
        type: "income",
        title: `Automatic saving from ${fromAccount.name}`,
        amount: transferAmount,
        date,
        remainingBalance: toAccount.balance,
        automationId: automation.id,
      });
    }

    automation.lastRunMonth = monthKey;
    applied.push(automation.id);
  });

  return {
    ...summarize(await writeState(state)),
    automationRun: { applied, skipped },
  };
}

module.exports = {
  getSummary,
  getMonthlyHistory,
  createAccount,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  createTransfer,
  createAutomation,
  runMonthlyAutomations,
};
