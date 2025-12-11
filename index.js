const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const COOKIE = process.env.ROBLOX_COOKIE;

// Helper untuk request Roblox API
async function robloxRequest(url) {
  const res = await axios.get(url, {
    headers: {
      Cookie: `.ROBLOSECURITY=${COOKIE}`,
      "User-Agent": "Mozilla/5.0"
    }
  });
  return res.data;
}

// Endpoint API: /stats?userid=123
app.get("/stats", async (req, res) => {
  const userId = req.query.userid;
  if (!userId) return res.json({ error: "userid missing" });

  try {
    const followers = await robloxRequest(`https://friends.roblox.com/v1/users/${userId}/followers/count`);
    const following = await robloxRequest(`https://friends.roblox.com/v1/users/${userId}/followings/count`);
    const friends = await robloxRequest(`https://friends.roblox.com/v1/users/${userId}/friends/count`);

    res.json({
      followers: followers.count,
      following: following.count,
      connections: friends.count
    });

  } catch (e) {
    console.log("Error:", e.response?.data || e.message);
    res.json({
      followers: "?",
      following: "?",
      connections: "?"
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port " + PORT));

