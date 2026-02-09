const express = require("express");
const cors = require("cors");

const contestRoutes = require("./routes/contestRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Contest Tracker API is running" });
});

app.use("/api/contests", contestRoutes);

module.exports = app;
