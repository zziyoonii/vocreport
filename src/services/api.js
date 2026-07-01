const BASE = '/api';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

export const api = {
  externalCS: (service) => get(`/sheets/external-cs/${service}`),
  internalCS: (service) => get(`/sheets/internal-cs/${service}`),
  sprintRaw: () => get('/sheets/sprint-raw'),
  vocInsight: (prev, cur) => get(`/sheets/voc-insight?sprints=${prev},${cur}`),
  cacheStatus: () => get('/sheets/voc-insight/cache-status'),
  deleteCache: (prev, cur) =>
    fetch(`${BASE}/sheets/voc-insight/cache?prevSprint=${prev}&currentSprint=${cur}`, { method: 'DELETE' }).then((r) => r.json()),
  backlog: (service) => get(`/sheets/backlog/${service}`),
  analyticsSummary: (service, sprint) => get(`/analytics/summary/${service}?sprint=${sprint}`),
  health: () => get('/health'),
};
