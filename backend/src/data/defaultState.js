const defaultState = {
  currency: "BRL",
  accounts: [
    {
      id: "general",
      name: "Caixa principal",
      kind: "main",
      balance: 0,
      target: null,
      monthlyContribution: 0,
    },
  ],
  transactions: [],
  automations: [],
};

module.exports = defaultState;
