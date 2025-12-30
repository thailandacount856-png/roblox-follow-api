const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const COOKIE = process.env.ROBLOX_COOKIE;
if (!COOKIE) {
  console.error("Error: ROBLOX_COOKIE environment variable missing!");
  process.exit(1);
}

// Helper untuk request Roblox API
async function robloxRequest(url) {
  try {
    const res = await axios.get(url, {
      headers: {
        Cookie: `.ROBLOSECURITY=${COOKIE}`,
        "User-Agent": "Mozilla/5.0"
      }
    });
    return res.data;
  } catch (e) {
    throw e.response?.data || new Error(e.message);
  }
}

// Endpoint API: /stats?userid=123
app.get("/stats", async (req, res) => {
  const userId = req.query.userid;

  // Validasi input
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: "Invalid or missing userid" });
  }

  try {
    // Parallel requests ke Roblox API
    const [followers, following, friends] = await Promise.all([
      robloxRequest(`https://friends.roblox.com/v1/users/${userId}/followers/count`),
      robloxRequest(`https://friends.roblox.com/v1/users/${userId}/followings/count`),
      robloxRequest(`https://friends.roblox.com/v1/users/${userId}/friends/count`),
    ]);

    res.json({
      followers: followers.count,
      following: following.count,
      connections: friends.count
    });

  } catch (e) {
    console.error("Error fetching Roblox data:", e);
    res.status(500).json({
      error: "Failed to fetch Roblox data",
      details: e
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


