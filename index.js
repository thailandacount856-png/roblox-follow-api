const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// FOLLOWERS
app.get("/followers", async (req, res) => {
  const userId = req.query.userid;
  if (!userId) return res.json({ error: "userid missing" });

  try {
    const response = await axios.get(`https://friends.roblox.com/v1/users/${userId}/followers/count`);
    res.json({ followers: response.data.count });
  } catch (err) {
    console.error(err);
    res.json({ error: "failed to fetch followers" });
  }
});

// FOLLOWING
app.get("/following", async (req, res) => {
  const userId = req.query.userid;
  if (!userId) return res.json({ error: "userid missing" });

  try {
    const response = await axios.get(`https://friends.roblox.com/v1/users/${userId}/followings/count`);
    res.json({ following: response.data.count });
  } catch (err) {
    console.error(err);
    res.json({ error: "failed to fetch following" });
  }
});

// CONNECTIONS (Followers + Following)
app.get("/connections", async (req, res) => {
  const userId = req.query.userid;
  if (!userId) return res.json({ error: "userid missing" });

  try {
    const followersRes = await axios.get(`https://friends.roblox.com/v1/users/${userId}/followers/count`);
    const followingRes = await axios.get(`https://friends.roblox.com/v1/users/${userId}/followings/count`);

    res.json({
      followers: followersRes.data.count,
      following: followingRes.data.count,
      connections: followersRes.data.count + followingRes.data.count
    });
  } catch (err) {
    console.error(err);
    res.json({ error: "failed to fetch connections" });
  }
});

// ROOT
app.get("/", (req, res) => {
  res.send("Roblox Followers API is running 🚀");
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log("Server running on port " + port));
