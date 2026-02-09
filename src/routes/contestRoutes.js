const express = require("express");
const { getCodeforcesContests } = require("../controllers/contestController");

const router = express.Router();

router.get("/codeforces", getCodeforcesContests);

module.exports = router;
