import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { prisma } from './db.js';
import { startCron, syncContests } from './jobs/sync.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Get all upcoming contests with filtering
app.get('/api/contests', async (req, res) => {
  try {
    const { platform, search, from, to } = req.query;

    const where = {
      startTime: {
        gte: new Date(), // Default to upcoming
      },
    };

    if (platform && typeof platform === 'string') {
      const platforms = platform.split(',').map((p) => p.toUpperCase());
      where.platform = { in: platforms };
    }

    if (search && typeof search === 'string') {
      where.name = {
        contains: search,
        mode: 'insensitive', // PostgreSQL specific
      };
    }

    if (from && typeof from === 'string') {
      where.startTime = { ...where.startTime, gte: new Date(from) };
    }

    if (to && typeof to === 'string') {
      where.startTime = { ...where.startTime, lte: new Date(to) };
    }

    const contests = await prisma.contest.findMany({
      where,
      orderBy: {
        startTime: 'asc',
      },
    });

    res.json(contests);
  } catch (error) {
    console.error('[API] Error fetching contests:', error);
    res.status(500).json({ error: 'Failed to fetch contests' });
  }
});

// Get the very next upcoming contest
app.get('/api/contests/next', async (req, res) => {
  try {
    const nextContest = await prisma.contest.findFirst({
      where: {
        startTime: {
          gte: new Date(),
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    if (!nextContest) {
      return res.status(404).json({ error: 'No upcoming contests found' });
    }

    res.json(nextContest);
  } catch (error) {
    console.error('[API] Error fetching next contest:', error);
    res.status(500).json({ error: 'Failed to fetch next contest' });
  }
});

app.listen(port, () => {
  console.log(`[Server] Running on http://localhost:${port}`);

  // Start the background sync job
  startCron();

  // Run an initial sync on startup
  syncContests();
});

