const axios = require("axios");

const CODEFORCES_API = "https://codeforces.com/api/contest.list";

async function fetchCodeforcesContests() {
  const response = await axios.get(CODEFORCES_API);

  if (response.data.status !== "OK") {
    throw new Error("Failed to fetch Codeforces contests");
  }

  return response.data.result;
}

module.exports = { fetchCodeforcesContests };
