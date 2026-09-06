export type Platform = 'CODEFORCES' | 'LEETCODE' | 'CODECHEF';

export interface Contest {
  id: string;
  platform: Platform;
  name: string;
  url: string;
  startTime: string; // ISO string from API
  durationSecs: number;
  fetchedAt: string;
}
