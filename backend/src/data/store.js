const fs = require("fs");
const path = require("path");
const defaultState = require("./defaultState");

const dataDir = path.join(__dirname, "..", "..", "data");
const dataFile = path.join(dataDir, "cashble.json");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim().replace(/\/$/, "") : "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const stateId = process.env.SUPABASE_STATE_ID || "main";
  const restUrl = url.endsWith("/rest/v1") ? url : `${url}/rest/v1`;

  return {
    isConfigured: Boolean(url && serviceRoleKey),
    restUrl,
    serviceRoleKey,
    stateId,
    url,
  };
}

function getSupabaseHeaders() {
  const { serviceRoleKey } = getSupabaseConfig();

  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
  };
}

function ensureLocalDataFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(defaultState, null, 2));
  }
}

function readLocalState() {
  ensureLocalDataFile();
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function writeLocalState(state) {
  ensureLocalDataFile();
  fs.writeFileSync(dataFile, JSON.stringify(state, null, 2));
  return clone(state);
}

async function readRemoteState() {
  const { restUrl, stateId } = getSupabaseConfig();
  const response = await fetch(`${restUrl}/cashble_state?id=eq.${encodeURIComponent(stateId)}&select=data`, {
    headers: getSupabaseHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Supabase read failed: ${response.status} ${await response.text()}`);
  }

  const rows = await response.json();

  if (!rows.length) {
    return writeRemoteState(defaultState);
  }

  return clone(rows[0].data);
}

async function writeRemoteState(state) {
  const { restUrl, stateId } = getSupabaseConfig();
  const response = await fetch(`${restUrl}/cashble_state?on_conflict=id`, {
    method: "POST",
    headers: {
      ...getSupabaseHeaders(),
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      id: stateId,
      data: state,
    }),
  });

  if (!response.ok) {
    throw new Error(`Supabase write failed: ${response.status} ${await response.text()}`);
  }

  const rows = await response.json();
  return clone(rows[0]?.data || state);
}

async function readState() {
  if (getSupabaseConfig().isConfigured) {
    return readRemoteState();
  }

  return readLocalState();
}

async function writeState(state) {
  if (getSupabaseConfig().isConfigured) {
    return writeRemoteState(state);
  }

  return writeLocalState(state);
}

module.exports = {
  readState,
  writeState,
};
