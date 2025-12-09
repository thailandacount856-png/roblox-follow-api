const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// ===================
// FOLLOWERS
// ===================
app.get("/followers", async (req, res) => {
  const userId = req.query.userid;
  if (!userId) return res.json({ error: "userid missing" });

  try {
    const url = `https://friends.roblox.com/v1/users/${userId}/followers/count`;
    const response = await axios.get(url);
    res.json({ followers: response.data.count });
  } catch {
    res.json({ error: "failed to fetch followers" });
  }
});

// ===================
// FOLLOWING
// ===================
app.get("/following", async (req, res) => {
  const userId = req.query.userid;
  if (!userId) return res.json({ error: "userid missing" });

  try {
    const url = `https://friends.roblox.com/v1/users/${userId}/followings/count`;
    const response = await axios.get(url);
    res.json({ following: response.data.count });
  } catch {
    res.json({ error: "failed to fetch following" });
  }
});

// ===================
// ROOT
// ===================
app.get("/", (req, res) => res.send("Roblox Followers API is running 🚀"));

const port = process.env.PORT || 10000;
app.listen(port, () => console.log("Server running on port " + port));

