require("./config/loadEnv")();

const cors = require("cors");
const express = require("express");
const financeRoutes = require("./routes/financeRoutes");

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:3000"].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed"));
    },
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Cashble API is running" });
});

app.use("/api", financeRoutes);

app.use((error, req, res, next) => {
  if (error.message === "Origin not allowed") {
    res.status(403).json({ message: error.message });
    return;
  }

  next(error);
});

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;
