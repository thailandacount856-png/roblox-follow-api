const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const api = axios.create({
  timeout: 8000 // fix infinite hang
});

// KEEP RENDER AWAKE
setInterval(() => {
  api.get("https://roblox-follow-api-q3jx.onrender.com").catch(() => {});
}, 240000); // 4 menit

// FOLLOWERS
app.get("/followers", async (req, res) => {
  const userId = req.query.userid;
  if (!userId) return res.status(400).json({ error: "userid missing" });

  try {
    const response = await api.get(`https://friends.roblox.com/v1/users/${userId}/followers/count`);
    res.json({ followers: response.data.count });
  } catch {
    return res.status(500).json({ error: true });
  }
});

// FOLLOWING
app.get("/following", async (req, res) => {
  const userId = req.query.userid;
  if (!userId) return res.status(400).json({ error: "userid missing" });

  try {
    const response = await api.get(`https://friends.roblox.com/v1/users/${userId}/followings/count`);
    res.json({ following: response.data.count });
  } catch {
    return res.status(500).json({ error: true });
  }
});

// CONNECTIONS
app.get("/connections", async (req, res) => {
  const userId = req.query.userid;
  if (!userId) return res.status(400).json({ error: "userid missing" });

  try {
    const followersRes = await api.get(`https://friends.roblox.com/v1/users/${userId}/followers/count`);
    const followingRes = await api.get(`https://friends.roblox.com/v1/users/${userId}/followings/count`);

    res.json({
      followers: followersRes.data.count,
      following: followingRes.data.count,
      connections: followersRes.data.count + followingRes.data.count
    });
  } catch {
    return res.status(500).json({ error: true });
  }
});

// ROOT
app.get("/", (req, res) => {
  res.send("Roblox Followers API is running 🚀");
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log("Server running on port " + port));

