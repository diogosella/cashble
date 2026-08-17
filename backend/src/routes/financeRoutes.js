const express = require("express");
const requireAuth = require("../middleware/requireAuth");
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

router.use(requireAuth);

router.get("/summary", handle((req) => financeService.getSummary(req.auth)));
router.get("/history/months", handle((req) => financeService.getMonthlyHistory(req.auth)));
router.post("/accounts", handle((req) => financeService.createAccount(req.auth, req.body)));
router.post("/transactions", handle((req) => financeService.createTransaction(req.auth, req.body)));
router.put("/transactions/:transactionId", handle((req) => financeService.updateTransaction(req.auth, req.params.transactionId, req.body)));
router.delete("/transactions/:transactionId", handle((req) => financeService.deleteTransaction(req.auth, req.params.transactionId)));
router.post("/transfers", handle((req) => financeService.createTransfer(req.auth, req.body)));
router.post("/automations", handle((req) => financeService.createAutomation(req.auth, req.body)));
router.post("/automations/run", handle((req) => financeService.runMonthlyAutomations(req.auth, req.body)));

module.exports = router;
