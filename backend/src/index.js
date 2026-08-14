require("./config/loadEnv")();

const cors = require("cors");
const express = require("express");
const financeRoutes = require("./routes/financeRoutes");
const { startMonthlyAutomationScheduler } = require("./services/monthlyAutomationScheduler");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Cashble API is running" });
});

app.use("/api", financeRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  startMonthlyAutomationScheduler();
});
