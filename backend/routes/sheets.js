import { Router } from 'express';
import { createRequire } from 'module';
import { config } from '../config/config.js';
import { analyzeVoC, getCacheStatus, deleteCache } from '../services/geminiAnalysis.js';

const require = createRequire(import.meta.url);
const router = Router();

// ── mock data ──────────────────────────────────────────────────────────────
const mockExternal = require('../mockData/externalCS.json');
const mockInternal = require('../mockData/internalCS.json');
const mockBacklog = require('../mockData/backlog.json');
const mockSprintRaw = require('../mockData/sprintRaw.json');

// ── helpers ────────────────────────────────────────────────────────────────
function calcAvg(arr) {
  return arr.length ? +(arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1) : 0;
}

function changeRate(prev, cur) {
  if (!prev) return null;
  return +((((cur - prev) / prev) * 100).toFixed(1));
}

// ── external CS ────────────────────────────────────────────────────────────
router.get('/external-cs/:service', async (req, res) => {
  try {
    const { service } = req.params;
    const raw = mockExternal.filter((r) => r.service === service);
    const sprints = [...new Set(raw.map((r) => r.sprint))].sort((a, b) => a - b);

    const bysprint = sprints.map((sprint) => {
      const rows = raw.filter((r) => r.sprint === sprint);
      const prev = raw.filter((r) => r.sprint === sprint - 1);
      const count = rows.length;
      const prevCount = prev.length;
      const avgHours = calcAvg(rows.map((r) => r.hours));
      const prevAvgHours = calcAvg(prev.map((r) => r.hours));

      const tagDist = ['단순문의', '기술문의', '오류문의', '기타'].reduce((acc, tag) => {
        acc[tag] = rows.filter((r) => r.tag === tag).length;
        return acc;
      }, {});

      const userTagMatrix = {};
      rows.forEach((r) => {
        if (!userTagMatrix[r.userTag]) userTagMatrix[r.userTag] = {};
        userTagMatrix[r.userTag][r.tag] = (userTagMatrix[r.userTag][r.tag] || 0) + 1;
      });

      const itemCount = {};
      rows.forEach((r) => { itemCount[r.item] = (itemCount[r.item] || 0) + 1; });
      const top5 = Object.entries(itemCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([item, count]) => ({ item, count }));

      return {
        sprint,
        count,
        prevCount,
        countChange: changeRate(prevCount, count),
        avgHours,
        prevAvgHours,
        avgHoursChange: changeRate(prevAvgHours, avgHours),
        tagDist,
        userTagMatrix,
        top5,
      };
    });

    res.json({ service, sprints: bysprint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── internal CS ────────────────────────────────────────────────────────────
router.get('/internal-cs/:service', async (req, res) => {
  try {
    const { service } = req.params;
    const raw = mockInternal.filter((r) => r.service === service);
    const sprints = [...new Set(raw.map((r) => r.sprint))].sort((a, b) => a - b);

    const byspring = sprints.map((sprint) => {
      const rows = raw.filter((r) => r.sprint === sprint);
      const count = rows.length;
      const avgDays = calcAvg(rows.map((r) => r.days));

      const typeDist = rows.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
      }, {});

      return { sprint, count, avgDays, typeDist };
    });

    res.json({ service, sprints: byspring });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── sprint raw (AI 분석용) ─────────────────────────────────────────────────
router.get('/sprint-raw', async (req, res) => {
  try {
    res.json(mockSprintRaw);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── VoC Gemini insight ─────────────────────────────────────────────────────
router.get('/voc-insight', async (req, res) => {
  try {
    const { sprints } = req.query;
    if (!sprints) return res.status(400).json({ error: 'sprints query required (e.g. ?sprints=116,117)' });

    const [prevSprint, currentSprint] = sprints.split(',').map(Number);
    const prevData = mockSprintRaw.filter((r) => r.sprint === prevSprint);
    const currentData = mockSprintRaw.filter((r) => r.sprint === currentSprint);

    if (!config.geminiApiKey) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured. Set USE_MOCK_DATA=true or provide a key.' });
    }

    const result = await analyzeVoC(prevData, currentData, prevSprint, currentSprint);
    res.json(result);
  } catch (err) {
    if (err.status === 429) {
      return res.status(429).json({ error: 'AI 분석 한도 도달. 잠시 후 다시 시도해 주세요.' });
    }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/voc-insight/cache-status', (_req, res) => {
  res.json({ cached: getCacheStatus() });
});

router.delete('/voc-insight/cache', (req, res) => {
  const { prevSprint, currentSprint } = req.query;
  deleteCache(Number(prevSprint), Number(currentSprint));
  res.json({ deleted: `${prevSprint}_${currentSprint}` });
});

// ── backlog ────────────────────────────────────────────────────────────────
router.get('/backlog/:service', async (req, res) => {
  try {
    const { service } = req.params;
    const raw = mockBacklog.filter((r) => r.service === service);
    const sorted = raw.sort((a, b) => a.sprint - b.sprint);
    res.json({ service, sprints: sorted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
