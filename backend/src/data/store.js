const fs = require("fs");
const path = require("path");
const defaultState = require("./defaultState");

const dataDir = path.join(__dirname, "..", "..", "data");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim().replace(/\/$/, "") : "";
  const anonKey = process.env.SUPABASE_ANON_KEY || "";
  const restUrl = url.endsWith("/rest/v1") ? url : `${url}/rest/v1`;

  return {
    isConfigured: Boolean(url && anonKey),
    anonKey,
    restUrl,
  };
}

function validateAuth(auth) {
  if (!auth?.userId || !auth?.accessToken) {
    const error = new Error("Authenticated user context is required");
    error.status = 401;
    throw error;
  }
}

function getSupabaseHeaders(auth) {
  validateAuth(auth);

  return {
    apikey: getSupabaseConfig().anonKey,
    Authorization: `Bearer ${auth.accessToken}`,
    "Content-Type": "application/json",
  };
}

function getLocalDataFile(auth) {
  validateAuth(auth);

  if (!/^[0-9a-f-]{36}$/i.test(auth.userId)) {
    throw new Error("Invalid authenticated user id");
  }

  return path.join(dataDir, `cashble-${auth.userId}.json`);
}

function ensureLocalDataFile(auth) {
  const dataFile = getLocalDataFile(auth);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(defaultState, null, 2));
  }

  return dataFile;
}

function readLocalState(auth) {
  return JSON.parse(fs.readFileSync(ensureLocalDataFile(auth), "utf8"));
}

function writeLocalState(auth, state) {
  fs.writeFileSync(ensureLocalDataFile(auth), JSON.stringify(state, null, 2));
  return clone(state);
}

async function readRemoteState(auth) {
  validateAuth(auth);
  const { restUrl } = getSupabaseConfig();
  const response = await fetch(`${restUrl}/cashble_state?id=eq.${encodeURIComponent(auth.userId)}&select=data`, {
    headers: getSupabaseHeaders(auth),
  });

  if (!response.ok) {
    throw new Error(`Supabase read failed: ${response.status} ${await response.text()}`);
  }

  const rows = await response.json();

  if (!rows.length) {
    return writeRemoteState(auth, defaultState);
  }

  return clone(rows[0].data);
}

async function writeRemoteState(auth, state) {
  validateAuth(auth);
  const { restUrl } = getSupabaseConfig();
  const response = await fetch(`${restUrl}/cashble_state?on_conflict=id`, {
    method: "POST",
    headers: {
      ...getSupabaseHeaders(auth),
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      id: auth.userId,
      data: state,
    }),
  });

  if (!response.ok) {
    throw new Error(`Supabase write failed: ${response.status} ${await response.text()}`);
  }

  const rows = await response.json();
  return clone(rows[0]?.data || state);
}

async function readState(auth) {
  if (getSupabaseConfig().isConfigured) {
    return readRemoteState(auth);
  }

  return readLocalState(auth);
}

async function writeState(auth, state) {
  if (getSupabaseConfig().isConfigured) {
    return writeRemoteState(auth, state);
  }

  return writeLocalState(auth, state);
}

module.exports = {
  readState,
  writeState,
};
