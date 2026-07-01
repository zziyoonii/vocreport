import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/config.js';

const cache = new Map();

export function getCacheStatus() {
  return Array.from(cache.keys());
}

export function deleteCache(prevSprint, currentSprint) {
  const key = `${prevSprint}_${currentSprint}`;
  cache.delete(key);
}

export async function analyzeVoC(prevData, currentData, prevSprint, currentSprint) {
  const key = `${prevSprint}_${currentSprint}`;
  if (cache.has(key)) {
    return { ...cache.get(key), cached: true };
  }

  const tags = ['단순문의', '기술문의', '오류문의', '기타'];

  const buildSummary = (data) =>
    tags.map((tag) => {
      const rows = data.filter((r) => r.tag === tag);
      return {
        tag,
        count: rows.length,
        avgHours: rows.length ? +(rows.reduce((s, r) => s + r.avgHours, 0) / rows.length).toFixed(1) : 0,
      };
    });

  const prevSummary = buildSummary(prevData);
  const curSummary = buildSummary(currentData);

  const diff = tags.map((tag) => {
    const p = prevSummary.find((x) => x.tag === tag);
    const c = curSummary.find((x) => x.tag === tag);
    const countChg = p.count ? (((c.count - p.count) / p.count) * 100).toFixed(1) : 'N/A';
    const timeChg = p.avgHours ? (((c.avgHours - p.avgHours) / p.avgHours) * 100).toFixed(1) : 'N/A';
    return { tag, prevCount: p.count, curCount: c.count, countChg, prevHours: p.avgHours, curHours: c.avgHours, timeChg };
  });

  const prompt = `당신은 고객경험(CX) 분석 전문가입니다.
아래는 구름 서비스의 스프린트별 고객 문의 변화 데이터입니다.

[Sprint ${prevSprint} → Sprint ${currentSprint} 변화]
${diff.map((d) => `- ${d.tag}: 건수 ${d.prevCount}→${d.curCount}건 (${d.countChg}%), 평균처리시간 ${d.prevHours}h→${d.curHours}h (${d.timeChg}%)`).join('\n')}

각 문의 유형별 증감 원인을 분석하고, 개선 방향을 제안해 주세요.
답변은 한국어로 작성하고, 각 유형별로 간결하게 (2~3문장) 설명해 주세요.`;

  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent(prompt);
  const insight = result.response.text();

  const output = { diff, insight, prevSprint, currentSprint };
  cache.set(key, output);
  return { ...output, cached: false };
}
