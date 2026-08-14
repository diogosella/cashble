const fs = require("fs");
const path = require("path");

function parseEnvLine(line) {
  const separatorIndex = line.indexOf("=");

  if (separatorIndex === -1) {
    return null;
  }

  const key = line.slice(0, separatorIndex).trim();
  let value = line.slice(separatorIndex + 1).trim();

  if (!key || key.startsWith("#")) {
    return null;
  }

  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }

  return { key, value };
}

function loadEnv() {
  const envFile = path.join(__dirname, "..", "..", ".env");

  if (!fs.existsSync(envFile)) {
    return;
  }

  const lines = fs.readFileSync(envFile, "utf8").split(/\r?\n/);

  lines.forEach((line) => {
    const entry = parseEnvLine(line);

    if (entry && process.env[entry.key] === undefined) {
      process.env[entry.key] = entry.value;
    }
  });
}

module.exports = loadEnv;
