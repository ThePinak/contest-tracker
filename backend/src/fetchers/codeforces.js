import axios from 'axios';

export const fetchCodeforces = async () => {
  try {
    const response = await axios.get('https://codeforces.com/api/contest.list');
    
    if (response.data.status !== 'OK') {
      throw new Error(`Codeforces API Error: ${response.data.comment}`);
    }

    const contests = response.data.result;

    // Filter only upcoming contests
    const upcoming = contests.filter((c) => c.phase === 'BEFORE');

    return upcoming.map((c) => ({
      platform: 'CODEFORCES',
      name: c.name,
      url: `https://codeforces.com/contests/${c.id}`,
      startTime: new Date(c.startTimeSeconds * 1000),
      durationSecs: c.durationSeconds,
    }));
  } catch (error) {
    console.error('[Codeforces Fetcher] Error:', error?.message || error);
    return [];
  }
};

