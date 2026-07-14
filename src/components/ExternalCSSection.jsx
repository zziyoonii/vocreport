import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { api } from '../services/api.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const TAG_COLORS = {
  '단순문의': '#6366f1',
  '기술문의': '#f97316',
  '오류문의': '#ef4444',
  '기타':     '#94a3b8',
};

function Badge({ prev, cur }) {
  if (!prev || prev === 0) return null;
  const pct = +(((cur - prev) / prev) * 100).toFixed(1);
  const pos = pct > 0;
  return (
    <span className={`text-xs font-bold ml-1 ${pos ? 'text-red-500' : 'text-blue-500'}`}>
      {pos ? '▲' : '▼'}{Math.abs(pct)}%
    </span>
  );
}

function DrilldownModal({ item, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800">{item.combo}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>직전 스프린트</span>
            <span className="font-semibold text-gray-700">{item.prevCount}건</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>이번 스프린트</span>
            <span className="font-semibold text-gray-700">{item.count}건</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
            상세 문의 내역은 Google Sheets 연동 후 확인 가능합니다.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExternalCSSection({ service, sprint }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.externalCS(service, sprint).then(setData).finally(() => setLoading(false));
  }, [service, sprint]);

  if (loading) return <p className="text-gray-300 text-xs py-4">로딩 중...</p>;
  if (!data) return null;

  const tags = Object.keys(data.tagCounts || {});
  const total = data.count || 0;
  const prev = data.prevSprint;

  const pieData = {
    labels: tags,
    datasets: [{
      data: tags.map((t) => data.tagCounts[t] || 0),
      backgroundColor: tags.map((t) => TAG_COLORS[t] || '#94a3b8'),
      borderWidth: 1,
    }],
  };

  const userTags = Object.keys(data.userTagMatrix || {});

  return (
    <div className="space-y-4">
      {/* 핵심 수치 */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">총 문의 건수</p>
          <p className="text-2xl font-bold text-gray-800">
            {total}<span className="text-xs text-gray-400 ml-1">건</span>
          </p>
          {prev && <Badge prev={prev.totalInquiries} cur={total} />}
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">평균 처리 시간</p>
          <p className="text-2xl font-bold text-gray-800">
            {data.avgHour}<span className="text-xs text-gray-400 ml-1">시간</span>
          </p>
          {prev && <Badge prev={prev.avgResolutionTime} cur={data.avgHour} />}
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">직전 스프린트</p>
          <p className="text-lg font-bold text-gray-500">
            {prev ? `${prev.totalInquiries}건` : '-'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">S{prev?.sprintNo}</p>
        </div>
      </div>

      {/* 파이차트 + 유저태그 매트릭스 */}
      <div className="flex gap-4 items-start">
        <div className="w-44 shrink-0">
          <p className="text-xs text-gray-400 mb-1">Tag별 분포</p>
          <Pie
            data={pieData}
            options={{
              responsive: true,
              plugins: { legend: { position: 'bottom', labels: { font: { size: 9 }, boxWidth: 10 } } },
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 mb-2">고객 유형 × 문의 유형</p>
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left text-gray-400 font-normal pb-1 w-24">고객 유형</th>
                {tags.map((t) => (
                  <th key={t} className="text-right font-normal pb-1" style={{ color: TAG_COLORS[t] || '#94a3b8' }}>
                    {t.replace('문의', '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {userTags.map((ut) => (
                <tr key={ut} className="border-t border-gray-50">
                  <td className="text-gray-500 py-1 pr-2 truncate max-w-[96px]">{ut}</td>
                  {tags.map((t) => (
                    <td key={t} className="text-right text-gray-600 py-1">
                      {data.userTagMatrix[ut]?.[t] ?? 0}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top 5 문의 항목 */}
      <div>
        <p className="text-xs text-gray-400 mb-2">Top 5 문의 항목 <span className="text-gray-300">(클릭 시 상세)</span></p>
        <ul className="space-y-1.5">
          {(data.top5 || []).map((item, i) => {
            const diff = item.count - item.prevCount;
            const pos = diff > 0;
            return (
              <li
                key={item.combo}
                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1 transition"
                onClick={() => setModal(item)}
              >
                <span className="text-xs text-gray-600">
                  <span className="font-bold text-indigo-400 mr-1">#{i + 1}</span>
                  {item.combo}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
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
        </ul>
      </div>

      {modal && <DrilldownModal item={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
