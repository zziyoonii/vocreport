import { Router } from 'express';
import { config } from '../config/config.js';
import { getExternalCSData, getInternalCSData, getVoCInsight } from '../data/mockData.js';
import { analyzeVoC, getCacheStatus, deleteCache } from '../services/geminiAnalysis.js';

const router = Router();

// ── 외부 CS ────────────────────────────────────────────────────────────────
router.get('/external-cs/:service', (req, res) => {
  try {
    const { service } = req.params;
    const sprint = Number(req.query.sprint) || 119;
    const data = getExternalCSData(service, sprint);
    if (!data) return res.status(404).json({ error: 'No data for this sprint' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── 내부 CS ────────────────────────────────────────────────────────────────
router.get('/internal-cs/:service', (req, res) => {
  try {
    const { service } = req.params;
    const sprint = Number(req.query.sprint) || 119;
    res.json(getInternalCSData(service, sprint));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── VoC 인사이트 ───────────────────────────────────────────────────────────
router.get('/voc-insight', async (req, res) => {
  try {
    const { sprints, service = 'edu' } = req.query;
    if (!sprints) return res.status(400).json({ error: 'sprints query required (e.g. ?sprints=118,119)' });
    const [prev, cur] = sprints.split(',').map(Number);

    if (!config.geminiApiKey || config.useMockData) {
      return res.json({ ...getVoCInsight(service, prev, cur), cached: false, mock: true });
    }

    const prevData = [getExternalCSData(service, prev)];
    const curData  = [getExternalCSData(service, cur)];
    const result = await analyzeVoC(prevData, curData, prev, cur);
    res.json(result);
  } catch (err) {
    if (err.status === 429) return res.status(429).json({ error: 'AI 분석 한도 도달. 잠시 후 다시 시도해 주세요.' });
    res.status(500).json({ error: err.message });
  }
});

router.get('/voc-insight/cache-status', (_req, res) => res.json({ cached: getCacheStatus() }));

router.delete('/voc-insight/cache', (req, res) => {
  const { prevSprint, currentSprint } = req.query;
  deleteCache(Number(prevSprint), Number(currentSprint));
  res.json({ deleted: `${prevSprint}_${currentSprint}` });
});

// ── sprint-raw (하위 호환) ─────────────────────────────────────────────────
router.get('/sprint-raw', (_req, res) => res.json([]));

export default router;
