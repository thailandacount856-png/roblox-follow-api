const express = require("express")
const axios = require("axios")
const cors = require("cors")

const app = express()
app.use(cors())

// ----------------------
// GET Followers
// ----------------------
app.get("/followers", async (req, res) => {
  const userId = req.query.userid
  if (!userId) return res.json({ error: "userid missing" })

  try {
    const response = await axios.get(`https://friends.roblox.com/v1/users/${userId}/followers`)
    res.json({
      count: response.data.totalCount,
      data: response.data.data
    })
  } catch (err) {
    res.json({ error: "failed fetch followers" })
  }
})

// ----------------------
// GET Following
// ----------------------
app.get("/following", async (req, res) => {
  const userId = req.query.userid
  if (!userId) return res.json({ error: "userid missing" })

  try {
    const response = await axios.get(`https://friends.roblox.com/v1/users/${userId}/followings`)
    res.json({
      count: response.data.totalCount,
      data: response.data.data
    })
  } catch (err) {
    res.json({ error: "failed fetch following" })
  }
})

// ----------------------
// MAIN
// ----------------------
app.get("/", (req, res) => {
  res.send("Roblox Followers API is running 🚀")
})

const port = process.env.PORT || 10000
app.listen(port, () => {
  console.log("Server running on port " + port)
})

