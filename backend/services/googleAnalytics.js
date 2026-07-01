import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { config } from '../config/config.js';

let analyticsClient = null;

function getClient() {
  if (analyticsClient) return analyticsClient;
  analyticsClient = new BetaAnalyticsDataClient({
    keyFilename: config.serviceAccountPath,
  });
  return analyticsClient;
}

export async function getUV(propertyId, startDate, endDate, hostnameFilter = null) {
  const client = getClient();
  const dimensionFilter = hostnameFilter
    ? {
        filter: {
          fieldName: 'hostName',
          stringFilter: { matchType: 'CONTAINS', value: hostnameFilter },
        },
      }
    : undefined;

  const [res] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [{ name: 'activeUsers' }],
    ...(dimensionFilter ? { dimensionFilter } : {}),
  });

  return Number(res.rows?.[0]?.metricValues?.[0]?.value || 0);
}
