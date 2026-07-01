import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import sheetsRouter from './routes/sheets.js';
import analyticsRouter from './routes/analytics.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/sheets', sheetsRouter);
app.use('/api/analytics', analyticsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', useMockData: config.useMockData, timestamp: new Date().toISOString() });
});

app.listen(config.port, () => {
  console.log(`[server] http://localhost:${config.port}  mock=${config.useMockData}`);
});
