const dayjs = require("dayjs");

function normalizeCodeforcesContest(contest) {
  return {
    name: contest.name,
    platform: "Codeforces",
    startTime: dayjs.unix(contest.startTimeSeconds).toDate(),
    duration: Math.floor(contest.durationSeconds / 60),
    url: `https://codeforces.com/contests/${contest.id}`
  };
}

module.exports = { normalizeCodeforcesContest };
