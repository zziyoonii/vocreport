const BASE = '/api';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

export const api = {
  externalCS: (service, sprint) => get(`/sheets/external-cs/${service}?sprint=${sprint}`),
  internalCS: (service, sprint) => get(`/sheets/internal-cs/${service}?sprint=${sprint}`),
  sprintRaw: () => get('/sheets/sprint-raw'),
  vocInsight: (prev, cur, service = 'edu') => get(`/sheets/voc-insight?sprints=${prev},${cur}&service=${service}`),
  cacheStatus: () => get('/sheets/voc-insight/cache-status'),
  deleteCache: (prev, cur) =>
    fetch(`${BASE}/sheets/voc-insight/cache?prevSprint=${prev}&currentSprint=${cur}`, { method: 'DELETE' }).then((r) => r.json()),
  backlog: (service) => get(`/sheets/backlog/${service}`),
  analyticsSummary: (service, sprint) => get(`/analytics/summary/${service}?sprint=${sprint}`),
  health: () => get('/health'),
};
