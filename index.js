const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const COOKIE = process.env.ROBLOX_COOKIE;

async function robloxRequest(url) {
  const res = await axios.get(url, {
    headers: {
      Cookie: `.ROBLOSECURITY=${COOKIE}`,
      "User-Agent": "Mozilla/5.0"
    }
  });
  return res.data;
}

app.get("/stats", async (req, res) => {
  const userId = req.query.userid;
  if (!userId || isNaN(userId)) return res.status(400).json({ error: "Invalid userid" });

  try {
    const [followers, following, friends] = await Promise.all([
      robloxRequest(`https://friends.roblox.com/v1/users/${userId}/followers/count`),
      robloxRequest(`https://friends.roblox.com/v1/users/${userId}/followings/count`),
      robloxRequest(`https://friends.roblox.com/v1/users/${userId}/friends/count`)
    ]);

    res.json({
      followers: followers.count,
      following: following.count,
      connections: friends.count
    });
  } catch (e) {
    console.error("Error:", e.response?.data || e.message);
    res.status(500).json({ error: "Failed to fetch Roblox data" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port " + PORT));



