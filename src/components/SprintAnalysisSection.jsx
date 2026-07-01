import { useState } from 'react';
import { api } from '../services/api.js';
import { currentSprintNo } from '../config/sprintConfig.js';

export default function SprintAnalysisSection() {
  const cur = currentSprintNo();
  const [prevSprint, setPrevSprint] = useState(cur - 1);
  const [curSprint, setCurSprint] = useState(cur);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.vocInsight(prevSprint, curSprint);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end flex-wrap">
        <div>
          <label className="text-xs text-gray-500 block mb-1">이전 스프린트</label>
          <input
            type="number"
            value={prevSprint}
            onChange={(e) => setPrevSprint(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 w-24 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">현재 스프린트</label>
          <input
            type="number"
            value={curSprint}
            onChange={(e) => setCurSprint(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 w-24 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <button
          onClick={analyze}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50 transition"
        >
          {loading ? '분석 중...' : 'AI 분석'}
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {result && (
        <div className="space-y-4">
          {result.cached && (
            <p className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit">캐시에서 반환됨</p>
          )}
          <div className="overflow-x-auto">
            <table className="text-xs w-full border border-gray-100 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  {['유형','이전 건수','현재 건수','건수 변화','이전 처리시간','현재 처리시간','시간 변화'].map((h) => (
                    <th key={h} className="px-3 py-2 text-gray-500 font-medium text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.diff.map((d) => (
                  <tr key={d.tag} className="border-t border-gray-50">
                    <td className="px-3 py-2 font-medium">{d.tag}</td>
                    <td className="px-3 py-2">{d.prevCount}</td>
                    <td className="px-3 py-2">{d.curCount}</td>
                    <td className={`px-3 py-2 font-semibold ${Number(d.countChg) > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                      {d.countChg !== 'N/A' ? `${d.countChg > 0 ? '+' : ''}${d.countChg}%` : '-'}
                    </td>
                    <td className="px-3 py-2">{d.prevHours}h</td>
                    <td className="px-3 py-2">{d.curHours}h</td>
                    <td className={`px-3 py-2 font-semibold ${Number(d.timeChg) > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                      {d.timeChg !== 'N/A' ? `${d.timeChg > 0 ? '+' : ''}${d.timeChg}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-indigo-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-indigo-700 mb-2">🤖 Gemini 분석 인사이트</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{result.insight}</p>
          </div>
        </div>
      )}
    </div>
  );
}
