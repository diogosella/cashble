const financeService = require("./financeService");

const CHECK_INTERVAL_MS = 60 * 60 * 1000;

function pad(value) {
  return String(value).padStart(2, "0");
}

function getLocalDateInput() {
  const date = new Date();
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

async function checkDueAutomations() {
  const result = await financeService.runMonthlyAutomations({ date: getLocalDateInput() });
  const appliedCount = result.automationRun?.applied.length || 0;

  if (appliedCount > 0) {
    console.log(`Monthly automations applied: ${appliedCount}`);
  }
}

function startMonthlyAutomationScheduler() {
  checkDueAutomations().catch((error) => {
    console.error("Monthly automation check failed:", error.message);
  });

  const timer = setInterval(() => {
    checkDueAutomations().catch((error) => {
      console.error("Monthly automation check failed:", error.message);
    });
  }, CHECK_INTERVAL_MS);

  if (typeof timer.unref === "function") {
    timer.unref();
  }
}

module.exports = {
  startMonthlyAutomationScheduler,
};
