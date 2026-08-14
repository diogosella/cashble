const express = require("express");
const financeService = require("../services/financeService");

const router = express.Router();

function handle(handler) {
  return async (req, res) => {
    try {
      res.json(await handler(req));
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message || "Internal server error" });
    }
  };
}

router.get("/summary", handle(() => financeService.getSummary()));
router.get("/history/months", handle(() => financeService.getMonthlyHistory()));
router.post("/accounts", handle((req) => financeService.createAccount(req.body)));
router.post("/transactions", handle((req) => financeService.createTransaction(req.body)));
router.put("/transactions/:transactionId", handle((req) => financeService.updateTransaction(req.params.transactionId, req.body)));
router.delete("/transactions/:transactionId", handle((req) => financeService.deleteTransaction(req.params.transactionId)));
router.post("/transfers", handle((req) => financeService.createTransfer(req.body)));
router.post("/automations", handle((req) => financeService.createAutomation(req.body)));
router.post("/automations/run", handle((req) => financeService.runMonthlyAutomations(req.body)));
router.get(
  "/cron/automations",
  handle((req) => {
    if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      const error = new Error("Unauthorized");
      error.status = 401;
      throw error;
    }

    return financeService.runMonthlyAutomations();
  }),
);

module.exports = router;
