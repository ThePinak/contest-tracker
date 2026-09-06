import axios from 'axios';

export const fetchLeetcode = async () => {
  try {
    const query = `
      query {
        topTwoContests {
          title
          titleSlug
          startTime
          duration
        }
      }
    `;

    const response = await axios.post('https://leetcode.com/graphql', {
      query,
    });

    const data = response.data;
    if (data.errors) {
      throw new Error(JSON.stringify(data.errors));
    }

    const contests = data.data?.topTwoContests || [];

    return contests.map((c) => ({
      platform: 'LEETCODE',
      name: c.title,
      url: `https://leetcode.com/contest/${c.titleSlug}`,
      startTime: new Date(c.startTime * 1000),
      durationSecs: c.duration,
    }));
  } catch (error) {
    console.error('[LeetCode Fetcher] Error:', error?.message || error);
    return [];
  }
};

