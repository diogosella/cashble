require("./config/loadEnv")();

const cors = require("cors");
const express = require("express");
const financeRoutes = require("./routes/financeRoutes");

const app = express();
const port = process.env.PORT || 5000;

function parseOrigins(value) {
  return (value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function normalizeOrigin(origin) {
  return origin ? origin.replace(/\/$/, "") : origin;
}

const allowedOrigins = new Set(
  [
    "http://localhost:3000",
    "https://cashble.vercel.app",
    process.env.FRONTEND_URL,
    ...parseOrigins(process.env.FRONTEND_URLS),
    ...parseOrigins(process.env.ALLOWED_ORIGINS),
  ]
    .map(normalizeOrigin)
    .filter(Boolean),
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
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

  res.status(error.status || 500).json({ message: error.message || "Internal server error" });
});

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;
