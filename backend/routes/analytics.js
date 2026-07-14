import { Router } from 'express';
import { config } from '../config/config.js';
import { getUV } from '../services/googleAnalytics.js';
import { sprintToDateRange } from '../../src/config/sprintConfig.js';
import { getUVData } from '../data/mockData.js';

const router = Router();

function changeRate(prev, cur) {
  if (!prev) return null;
  return +((((cur - prev) / prev) * 100).toFixed(1));
}

router.get('/summary/:service', async (req, res) => {
  try {
    const { sprint } = req.query;
    const sprintNum = Number(sprint);

    if (config.useMockData || !config.ga4PropertyIdEduCh) {
      const curCh  = getUVData('edu-channel', sprintNum);
      const prevCh = getUVData('edu-channel', sprintNum - 1);
      const curEdu  = getUVData('edu', sprintNum);
      const prevEdu = getUVData('edu', sprintNum - 1);

      return res.json({
        sprint: sprintNum,
        eduChannel: {
          activeUsers: curCh.activeUsers,
          prevActiveUsers: prevCh.activeUsers,
          change: changeRate(prevCh.activeUsers, curCh.activeUsers),
        },
        edu: {
          activeUsers: curEdu.activeUsers,
          prevActiveUsers: prevEdu.activeUsers,
          change: changeRate(prevEdu.activeUsers, curEdu.activeUsers),
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
