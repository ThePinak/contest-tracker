import axios from 'axios';

export const fetchUserProfile = async ({ cf, lc, cc }) => {
  const result = {
    codeforces: null,
    leetcode: null,
    codechef: null,
    totalContestsAttended: 0,
  };

  // 1. Codeforces
  if (cf && cf.trim()) {
    try {
      const handle = cf.trim();
      const [infoRes, ratingRes] = await Promise.all([
        axios.get(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`),
        axios.get(`https://codeforces.com/api/user.rating?handle=${encodeURIComponent(handle)}`).catch(() => ({ data: { result: [] } })),
      ]);

      if (infoRes.data?.status === 'OK' && infoRes.data.result?.length > 0) {
        const u = infoRes.data.result[0];
        const contestHistory = ratingRes.data?.result || [];
        result.codeforces = {
          handle: u.handle,
          rating: u.rating || 0,
          maxRating: u.maxRating || 0,
          rank: u.rank || 'Unrated',
          maxRank: u.maxRank || 'Unrated',
          avatar: u.titlePhoto || u.avatar,
          contestsAttended: contestHistory.length,
          recentContests: contestHistory.slice(-5).reverse().map((c) => ({
            id: c.contestId,
            name: c.contestName,
            rank: c.rank,
            oldRating: c.oldRating,
            newRating: c.newRating,
            diff: c.newRating - c.oldRating,
            date: new Date(c.ratingUpdateTimeSeconds * 1000).toISOString(),
          })),
        };
        result.totalContestsAttended += contestHistory.length;
      }
    } catch (err) {
      console.warn(`[Profile] Codeforces fetch note for "${cf}":`, err.message);
    }
  }

  // 2. LeetCode
  if (lc && lc.trim()) {
    try {
      const username = lc.trim();
      const query = `
        query getUserContestRanking($username: String!) {
          userContestRanking(username: $username) {
            attendedContestsCount
            rating
            globalRanking
            totalParticipants
            topPercentage
            badge {
              name
            }
          }
          userContestRankingHistory(username: $username) {
            attended
            rating
            ranking
            contest {
              title
              startTime
            }
          }
          matchedUser(username: $username) {
            submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
        }
      `;

      const response = await axios.post(
        'https://leetcode.com/graphql',
        {
          query,
          variables: { username },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://leetcode.com',
          },
          timeout: 6000,
        }
      );

      const data = response.data?.data;
      if (data) {
        const ranking = data.userContestRanking;
        const submitStats = data.matchedUser?.submitStatsGlobal?.acSubmissionNum || [];
        const history = (data.userContestRankingHistory || [])
          .filter((h) => h.attended)
          .slice(-5)
          .reverse()
          .map((h) => ({
            name: h.contest?.title || 'LeetCode Contest',
            rank: h.ranking,
            rating: Math.round(h.rating),
            date: h.contest?.startTime ? new Date(h.contest.startTime * 1000).toISOString() : new Date().toISOString(),
          }));

        const totalSolved = submitStats.find((s) => s.difficulty === 'All')?.count || 0;
        const easySolved = submitStats.find((s) => s.difficulty === 'Easy')?.count || 0;
        const mediumSolved = submitStats.find((s) => s.difficulty === 'Medium')?.count || 0;
        const hardSolved = submitStats.find((s) => s.difficulty === 'Hard')?.count || 0;

        const attended = ranking?.attendedContestsCount || 0;

        result.leetcode = {
          username,
          rating: ranking ? Math.round(ranking.rating) : 0,
          globalRanking: ranking?.globalRanking || null,
          topPercentage: ranking?.topPercentage ? `${ranking.topPercentage}%` : null,
          badge: ranking?.badge?.name || null,
          contestsAttended: attended,
          totalSolved,
          easySolved,
          mediumSolved,
          hardSolved,
          recentContests: history,
        };
        result.totalContestsAttended += attended;
      }
    } catch (err) {
      console.warn(`[Profile] LeetCode fetch note for "${lc}":`, err.message);
    }
  }

  // 3. CodeChef
  if (cc && cc.trim()) {
    try {
      const handle = cc.trim();
      const response = await axios.get(`https://codechef-api.vercel.app/handle/${encodeURIComponent(handle)}`, { timeout: 6000 }).catch(() => null);
      if (response?.data && response.data.success !== false) {
        const d = response.data;
        const attended = d.ratingData?.length || 0;
        result.codechef = {
          handle,
          rating: d.currentRating || 0,
          highestRating: d.highestRating || 0,
          stars: d.stars || '1★',
          globalRank: d.globalRank || null,
          countryRank: d.countryRank || null,
          contestsAttended: attended,
        };
        result.totalContestsAttended += attended;
      }
    } catch (err) {
      console.warn(`[Profile] CodeChef fetch note for "${cc}":`, err.message);
    }
  }

  return result;
};

