function getAuthConfig() {
  const url = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim().replace(/\/$/, "") : "";
  const anonKey = process.env.SUPABASE_ANON_KEY || "";

  if (!url || !anonKey) {
    const error = new Error("Supabase authentication is not configured");
    error.status = 500;
    throw error;
  }

  return { url, anonKey };
}

async function requireAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization || "";
    const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";

    if (!accessToken) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const { url, anonKey } = getAuthConfig();
    let response;

    try {
      response = await fetch(`${url}/auth/v1/user`, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      res.status(503).json({ message: "Authentication service unavailable" });
      return;
    }

    if (!response.ok) {
      res.status(401).json({ message: "Invalid or expired session" });
      return;
    }

    const user = await response.json();

    if (!user.id) {
      res.status(401).json({ message: "Invalid user" });
      return;
    }

    req.auth = {
      accessToken,
      userId: user.id,
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = requireAuth;
