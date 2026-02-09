const { fetchCodeforcesContests } = require("../services/codeforcesService");
const { normalizeCodeforcesContest } = require("../utils/normalizeContest");
const {
  filterToday,
  filterThisWeek,
  sortByStartTime
} = require("../utils/contestFilters");

async function getCodeforcesContests(req, res) {
  try {
    const filter = req.query.filter;

    const rawContests = await fetchCodeforcesContests();

    let contests = rawContests
      .filter(contest => contest.phase === "BEFORE")
      .map(normalizeCodeforcesContest);

    if (filter === "today") {
      contests = filterToday(contests);
    } else if (filter === "week") {
      contests = filterThisWeek(contests);
    }

    contests = sortByStartTime(contests);

    res.json({
      platform: "Codeforces",
      filter: filter || "all",
      count: contests.length,
      contests
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getCodeforcesContests };
