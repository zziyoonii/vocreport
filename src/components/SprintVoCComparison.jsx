import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

function DiffBadge({ value }) {
  if (value === null || value === undefined || value === 'N/A') return <span className="text-gray-300">-</span>;
  const n = Number(value);
  const pos = n > 0;
  return (
    <span className={`font-semibold text-xs ${pos ? 'text-red-500' : 'text-blue-500'}`}>
      {pos ? '+' : ''}{value}%
    </span>
  );
}

export default function SprintVoCComparison({ service, prevSprint, curSprint }) {
  const [raw, setRaw] = useState(null);
  const [externalData, setExternalData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.sprintRaw(),
      api.externalCS(service),
    ]).then(([rawData, extData]) => {
      setRaw(rawData.filter((r) => r.service === service));
      setExternalData(extData);
    }).finally(() => setLoading(false));
  }, [service, prevSprint, curSprint]);

  if (loading) return <p className="text-gray-300 text-xs py-4">로딩 중...</p>;

  const prevSummary = raw?.filter((r) => r.sprint === prevSprint) || [];
  const curSummary = raw?.filter((r) => r.sprint === curSprint) || [];

  const tags = ['단순문의', '기술문의', '오류문의', '기타'];

  // 외부 CS에서 tag별 건수 가져오기
  const prevExt = externalData?.sprints?.find((s) => s.sprint === prevSprint);
  const curExt = externalData?.sprints?.find((s) => s.sprint === curSprint);

  const tagDiff = tags.map((tag) => {
    const prevCount = prevExt?.tagDist?.[tag] || 0;
    const curCount = curExt?.tagDist?.[tag] || 0;
    const prevRaw = prevSummary.find((r) => r.tag === tag);
    const curRaw = curSummary.find((r) => r.tag === tag);
    const countChg = prevCount ? (((curCount - prevCount) / prevCount) * 100).toFixed(1) : null;
    return {
      tag,
      prevCount,
      curCount,
      countChg,
      prevAvgHours: prevRaw?.avgHours ?? '-',
      curAvgHours: curRaw?.avgHours ?? '-',
    };
  }).filter((d) => d.prevCount > 0 || d.curCount > 0);

  // Top 5 문의 항목 (현재 스프린트 기준)
  const itemMap = {};
  (raw || []).filter((r) => r.sprint === curSprint || r.sprint === prevSprint).forEach((r) => {
    const key = `${r.tag} > ${r.summary?.slice(0, 8) || r.tag}`;
  });

  // externalCS top5 활용
  const top5Cur = curExt?.top5 || [];
  const top5Prev = prevExt?.top5 || [];

  const top5 = top5Cur.map((item) => {
    const p = top5Prev.find((x) => x.item === item.item);
    return { item: `${item.item}`, curCount: item.count, prevCount: p?.count || 0 };
  });

  // 주목해야 할 지표: 증감률 큰 것
  const notable = [...tagDiff]
    .filter((d) => d.countChg !== null)
    .sort((a, b) => Math.abs(b.countChg) - Math.abs(a.countChg))
    .slice(0, 2);

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Top 5 문의 항목 */}
      <div>
        <p className="text-xs font-semibold text-yellow-600 mb-3">⭐ Top 5 문의 항목</p>
        <ul className="space-y-2">
          {top5.map((t, i) => {
            const diff = t.curCount - t.prevCount;
            const pos = diff > 0;
            return (
              <li key={t.item} className="flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  <span className="font-bold text-indigo-400 mr-1.5">#{i + 1}</span>
                  {t.item}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  {t.prevCount}건 → <span className="font-semibold text-gray-700">{t.curCount}건</span>
                  {diff !== 0 && (
                    <span className={`text-xs ${pos ? 'text-red-400' : 'text-blue-400'}`}>
                      {pos ? '▲' : '▼'}{Math.abs(diff)}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 주목해야 할 지표 + AI 인사이트 자리 */}
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-blue-600 mb-3">👀 주목해야 할 지표</p>
          <div className="space-y-2">
            {tagDiff.map((d) => (
              <div key={d.tag} className="flex items-center justify-between text-xs">
                <span className="text-gray-600 w-16">{d.tag}</span>
                <span className="text-gray-400">{d.prevCount}건 → {d.curCount}건</span>
                <DiffBadge value={d.countChg} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🤖</span>
            <p className="text-xs font-semibold text-amber-700">Gemini AI가 VoC 문의 내용을 분석하고 있습니다</p>
          </div>
          <p className="text-xs text-amber-500">
            S{prevSprint} → S{curSprint} 스프린트 간 tag별 변화 원인을 파악 중입니다...
          </p>
          <p className="text-xs text-amber-400 mt-1">GEMINI_API_KEY를 설정하면 AI 인사이트가 활성화됩니다</p>
        </div>
      </div>
    </div>
  );
}
