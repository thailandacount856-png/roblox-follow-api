const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// ===============================
// CONFIG
// ===============================
const axiosConfig = {
  headers: {
    "User-Agent": "Mozilla/5.0 (RobloxDataFetcher/1.0)"
  },
  timeout: 6000
};

// Cache 10 menit
const cache = new Map();
const CACHE_TIME = 10 * 60 * 1000;

// ===============================
// RETRY
// ===============================
async function fetchRetry(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      return await axios.get(url, axiosConfig);
    } catch (err) {
      if (i === tries - 1) throw err;
      await new Promise(r => setTimeout(r, 900));
    }
  }
}

// ===============================
// FETCH FULL COMBO (followers + following)
// ===============================
async function getConnections(userId) {
  const now = Date.now();
  const exist = cache.get(userId);

  // Use cache if valid
  if (exist && now - exist.time < CACHE_TIME) {
    return exist.data;
  }

  // Fetch fresh
  const followersRes = await fetchRetry(`https://friends.roblox.com/v1/users/${userId}/followers/count`);
  const followingRes = await fetchRetry(`https://friends.roblox.com/v1/users/${userId}/followings/count`);

  const data = {
    followers: followersRes.data.count,
    following: followingRes.data.count,
    connections: followersRes.data.count + followingRes.data.count
  };

  cache.set(userId, { time: now, data });
  return data;
}

// ===============================
// API ROUTES
// ===============================
app.get("/connections", async (req, res) => {
  const userId = req.query.userid;
  if (!userId) return res.json({ error: "userid missing" });

  try {
    const data = await getConnections(userId);
    res.json(data);
  } catch {
    res.json({
      followers: "?",
      following: "?",
      connections: "?"
    });
  }
});

// Followers only
app.get("/followers", async (req, res) => {
  const userId = req.query.userid;
  if (!userId) return res.json({ error: "userid missing" });

  try {
    const data = await getConnections(userId);
    res.json({ followers: data.followers });
  } catch {
    res.json({ followers: "?" });
  }
});

// Following only
app.get("/following", async (req, res) => {
  const userId = req.query.userid;
  if (!userId) return res.json({ error: "userid missing" });

  try {
    const data = await getConnections(userId);
    res.json({ following: data.following });
  } catch {
    res.json({ following: "?" });
  }
});

// Root
app.get("/", (req, res) => {
  res.send("Roblox Followers API is Running 🚀");
});

// Keepalive (anti sleep)
setInterval(() => {
  axios.get(process.env.SELF_URL || "https://your-app.onrender.com").catch(() => {});
}, 60000);

// ===============================
// SERVER START
// ===============================
const port = process.env.PORT || 10000;
app.listen(port, () => console.log("Server running on port " + port));


