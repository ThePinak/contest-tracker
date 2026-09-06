import axios from 'axios';

export const fetchCodechef = async () => {
  try {
    const response = await axios.get('https://www.codechef.com/api/list/contests/all');
    const data = response.data;

    if (data.status !== 'success') {
      throw new Error('CodeChef API did not return success status');
    }

    const futureContests = data.future_contests || [];

    return futureContests
      .map((c) => {
        const durationMins = parseInt(c.contest_duration, 10);
        const durationSecs = isNaN(durationMins) ? 0 : durationMins * 60;

        let startTime = new Date(c.contest_start_date_iso);
        if (isNaN(startTime.getTime())) {
          startTime = new Date(c.contest_start_date);
        }

        return {
          platform: 'CODECHEF',
          name: c.contest_name,
          url: `https://www.codechef.com/${c.contest_code}`,
          startTime,
          durationSecs,
        };
      })
      .filter((c) => !isNaN(c.startTime.getTime()));
  } catch (error) {
    console.error('[CodeChef Fetcher] Error:', error?.message || error);
    return [];
  }
};

