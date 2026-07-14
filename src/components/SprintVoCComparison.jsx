import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

export default function SprintVoCComparison({ service, prevSprint, curSprint }) {
  const [extCur, setExtCur] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.externalCS(service, curSprint),
      api.vocInsight(prevSprint, curSprint, service).catch(() => null),
    ]).then(([ext, voc]) => {
      setExtCur(ext);
      setInsights(voc?.insights || null);
    }).finally(() => setLoading(false));
  }, [service, prevSprint, curSprint]);

  if (loading) return <p className="text-gray-300 text-xs py-4">로딩 중...</p>;

  const top5 = extCur?.top5 || [];

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Top 5 문의 항목 */}
      <div>
        <p className="text-xs font-semibold text-yellow-600 mb-3">⭐ Top 5 문의 항목</p>
        <ul className="space-y-2">
          {top5.map((item, i) => {
            const diff = item.count - item.prevCount;
            const pos = diff > 0;
            return (
              <li key={item.combo} className="flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  <span className="font-bold text-indigo-400 mr-1.5">#{i + 1}</span>
                  {item.combo}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1 shrink-0">
                  {item.prevCount}건 → <span className="font-semibold text-gray-700">{item.count}건</span>
                  {diff !== 0 && (
                    <span className={pos ? 'text-red-400' : 'text-blue-400'}>
                      {pos ? '▲' : '▼'}{Math.abs(diff)}
                    </span>
                  )}
                  {diff === 0 && <span className="text-gray-300">=</span>}
                </span>
              </li>
            );
          })}
          {top5.length === 0 && <li className="text-xs text-gray-300">데이터 없음</li>}
        </ul>
      </div>

      {/* AI 인사이트 */}
      <div>
        <p className="text-xs font-semibold text-blue-600 mb-3">💡 주목해야 할 지표 ✨ Gemini 분석</p>
        {insights ? (
          <div className="space-y-4">
            {insights.map((ins) => (
              <div key={ins.tag} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs font-semibold text-blue-700 mb-2">✅ {ins.title}</p>
                <ul className="space-y-1.5">
                  {ins.points.map((pt, j) => (
                    <li key={j} className="text-xs text-blue-600 flex gap-1.5">
                      <span className="shrink-0 text-blue-300">{j + 1}.</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🤖</span>
              <p className="text-xs font-semibold text-amber-700">Gemini AI 분석</p>
            </div>
            <p className="text-xs text-amber-500">
              S{prevSprint} → S{curSprint} 스프린트 간 VoC 변화를 분석 중입니다.
            </p>
            <p className="text-xs text-amber-400 mt-1">GEMINI_API_KEY를 설정하면 AI 인사이트가 활성화됩니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
