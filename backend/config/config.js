import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  useMockData: process.env.USE_MOCK_DATA === 'true',
  sheetsIdMain: process.env.SHEETS_ID_MAIN,
  sheetsGidExternal: process.env.SHEETS_GID_EXTERNAL || '578010795',
  sheetsGidBacklog: process.env.SHEETS_GID_BACKLOG || '1648284575',
  sheetsGidInternal: process.env.SHEETS_GID_INTERNAL || '933784391',
  sheetsGidRawSprint: process.env.SHEETS_GID_RAW_SPRINT || '578010795',
  sheetsGidBacklogSummary: process.env.SHEETS_GID_BACKLOG_SUMMARY || '1151553493',
  ga4PropertyIdEduCh: process.env.GA4_PROPERTY_ID_EDU_CH,
  ga4PropertyIdEdu: process.env.GA4_PROPERTY_ID_EDU,
  geminiApiKey: process.env.GEMINI_API_KEY,
  serviceAccountPath: process.env.SERVICE_ACCOUNT_PATH || './backend/config/serviceAccount.json',
};
