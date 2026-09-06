import cron from 'node-cron';
import { prisma } from '../db.js';
import { fetchCodeforces } from '../fetchers/codeforces.js';
import { fetchLeetcode } from '../fetchers/leetcode.js';
import { fetchCodechef } from '../fetchers/codechef.js';

export const syncContests = async () => {
  console.log('[Sync Job] Starting contest sync...');

  try {
    const [cfContests, lcContests, ccContests] = await Promise.all([
      fetchCodeforces(),
      fetchLeetcode(),
      fetchCodechef(),
    ]);

    // Update Codeforces
    if (cfContests.length > 0) {
      await prisma.contest.deleteMany({ where: { platform: 'CODEFORCES' } });
      await prisma.contest.createMany({ data: cfContests });
      console.log(`[Sync Job] Synced ${cfContests.length} Codeforces contests.`);
    }

    // Update LeetCode
    if (lcContests.length > 0) {
      await prisma.contest.deleteMany({ where: { platform: 'LEETCODE' } });
      await prisma.contest.createMany({ data: lcContests });
      console.log(`[Sync Job] Synced ${lcContests.length} LeetCode contests.`);
    }

    // Update CodeChef
    if (ccContests.length > 0) {
      await prisma.contest.deleteMany({ where: { platform: 'CODECHEF' } });
      await prisma.contest.createMany({ data: ccContests });
      console.log(`[Sync Job] Synced ${ccContests.length} CodeChef contests.`);
    }

    // Clean up past contests older than 7 days
    const cleanupResult = await prisma.contest.deleteMany({
      where: {
        startTime: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });
    if (cleanupResult.count > 0) {
      console.log(`[Sync Job] Cleaned up ${cleanupResult.count} old contests.`);
    }

    console.log('[Sync Job] Sync complete.');
  } catch (error) {
    console.error('[Sync Job] Error during sync:', error);
  }
};

// Run every 15 minutes
export const startCron = () => {
  cron.schedule('*/15 * * * *', () => {
    syncContests();
  });
  console.log('[Cron] Sync job scheduled to run every 15 minutes.');
};

