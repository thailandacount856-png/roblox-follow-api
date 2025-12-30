const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// Ambil ROBLOX_COOKIE dari environment variable
const COOKIE = process.env.ROBLOX_COOKIE;
if (!COOKIE) {
  console.error("Error: ROBLOX_COOKIE belum diset di environment variables.");
  process.exit(1);
}

// Cache sederhana server-side
const apiCache = {}; // { userId: { time, data } }
const CACHE_TTL = 60; // detik

async function robloxRequest(url) {
  const res = await axios.get(url, {
    headers: {
      Cookie: `.ROBLOSECURITY=${COOKIE}`,
      "User-Agent": "Mozilla/5.0"
    },
    timeout: 5000
  });
  return res.data;
}

app.get("/stats", async (req, res) => {
  const userId = req.query.userid;
  if (!userId || isNaN(userId)) return res.status(400).json({ error: "Invalid userid" });

  const now = Date.now();
  if (apiCache[userId] && (now - apiCache[userId].time) < CACHE_TTL * 1000) {
    return res.json(apiCache[userId].data);
  }

  try {
    const [followers, following, friends] = await Promise.all([
      robloxRequest(`https://friends.roblox.com/v1/users/${userId}/followers/count`),
      robloxRequest(`https://friends.roblox.com/v1/users/${userId}/followings/count`),
      robloxRequest(`https://friends.roblox.com/v1/users/${userId}/friends/count`)
    ]);

    const data = {
      followers: followers.count,
      following: following.count,
      connections: friends.count
    };

    apiCache[userId] = { time: now, data };
    res.json(data);
  } catch (e) {
    console.error("Error fetching Roblox API:", e.response?.data || e.message);
    res.status(500).json({ error: "Failed to fetch Roblox data" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));





