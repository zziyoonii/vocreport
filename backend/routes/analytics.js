import { Router } from 'express';
import { createRequire } from 'module';
import { config } from '../config/config.js';
import { getUV } from '../services/googleAnalytics.js';
import { sprintToDateRange } from '../../src/config/sprintConfig.js';

const require = createRequire(import.meta.url);
const router = Router();

const mockAnalytics = require('../mockData/analytics.json');

function changeRate(prev, cur) {
  if (!prev) return null;
  return +((((cur - prev) / prev) * 100).toFixed(1));
}

router.get('/summary/:service', async (req, res) => {
  try {
    const { sprint } = req.query;
    const sprintNum = Number(sprint);

    if (config.useMockData || !config.ga4PropertyIdEduCh) {
      const eduChRows = mockAnalytics.eduChannel;
      const eduRows = mockAnalytics.edu;

      const cur = eduChRows.find((r) => r.sprint === sprintNum);
      const prev = eduChRows.find((r) => r.sprint === sprintNum - 1);
      const curEdu = eduRows.find((r) => r.sprint === sprintNum);
      const prevEdu = eduRows.find((r) => r.sprint === sprintNum - 1);

      return res.json({
        sprint: sprintNum,
        eduChannel: {
          activeUsers: cur?.activeUsers ?? null,
          prevActiveUsers: prev?.activeUsers ?? null,
          change: cur && prev ? changeRate(prev.activeUsers, cur.activeUsers) : null,
        },
        edu: {
          activeUsers: curEdu?.activeUsers ?? null,
          prevActiveUsers: prevEdu?.activeUsers ?? null,
          change: curEdu && prevEdu ? changeRate(prevEdu.activeUsers, curEdu.activeUsers) : null,
        },
      });
    }

    const { start, end } = sprintToDateRange(sprintNum);
    const { start: pStart, end: pEnd } = sprintToDateRange(sprintNum - 1);

    const [eduChCur, eduChPrev, eduCur, eduPrev] = await Promise.all([
      getUV(config.ga4PropertyIdEduCh, start, end),
      getUV(config.ga4PropertyIdEduCh, pStart, pEnd),
      getUV(config.ga4PropertyIdEdu, start, end, 'edu.goorm.io'),
      getUV(config.ga4PropertyIdEdu, pStart, pEnd, 'edu.goorm.io'),
    ]);

    res.json({
      sprint: sprintNum,
      eduChannel: { activeUsers: eduChCur, prevActiveUsers: eduChPrev, change: changeRate(eduChPrev, eduChCur) },
      edu: { activeUsers: eduCur, prevActiveUsers: eduPrev, change: changeRate(eduPrev, eduCur) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
