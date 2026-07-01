import { google } from 'googleapis';
import { config } from '../config/config.js';
import { readFileSync } from 'fs';

let sheetsClient = null;

function getClient() {
  if (sheetsClient) return sheetsClient;
  const key = JSON.parse(readFileSync(config.serviceAccountPath, 'utf-8'));
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

export async function getSheetData(gid, range) {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: config.sheetsIdMain,
    range,
  });
  return res.data.values || [];
}
