import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend,
} from 'chart.js';
import { api } from '../services/api.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function Badge({ value }) {
  if (value === null || value === undefined) return null;
  const pos = value > 0;
  return (
    <span className={`text-xs font-bold ml-1 ${pos ? 'text-red-500' : 'text-blue-500'}`}>
      {pos ? '▲' : '▼'}{Math.abs(value)}%
    </span>
  );
}

export default function ExternalCSSection({ service, sprint }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.externalCS(service).then(setData).finally(() => setLoading(false));
  }, [service]);

  if (loading) return <p className="text-gray-300 text-xs py-4">로딩 중...</p>;
  if (!data) return null;

  const cur = data.sprints.find((s) => s.sprint === sprint) || data.sprints[data.sprints.length - 1];
  const prev = data.sprints.find((s) => s.sprint === sprint - 1);
  if (!cur) return <p className="text-gray-300 text-xs">데이터 없음</p>;

  const tags = ['단순문의', '기술문의', '오류문의', '기타'];
  const tagChartData = {
    labels: tags,
    datasets: [
      {
        label: `S${sprint - 1}`,
        data: tags.map((t) => prev?.tagDist?.[t] || 0),
        backgroundColor: 'rgba(99,102,241,0.3)',
      },
      {
        label: `S${sprint}`,
        data: tags.map((t) => cur.tagDist?.[t] || 0),
        backgroundColor: 'rgba(99,102,241,0.8)',
      },
    ],
  };

  return (
    <div className="space-y-4">
      {/* 핵심 수치 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">문의 건수</p>
          <p className="text-2xl font-bold text-gray-800">
            {cur.count}<span className="text-xs text-gray-400 ml-1">건</span>
          </p>
          <Badge value={cur.countChange} />
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">평균 처리 시간</p>
          <p className="text-2xl font-bold text-gray-800">
            {cur.avgHours}<span className="text-xs text-gray-400 ml-1">시간</span>
          </p>
          <Badge value={cur.avgHoursChange} />
        </div>
      </div>

      {/* 태그별 비교 차트 */}
      <div>
        <p className="text-xs text-gray-400 mb-2">문의 건수</p>
        <Bar
          data={tagChartData}
          options={{
            responsive: true,
            plugins: { legend: { position: 'top', labels: { font: { size: 10 } } } },
            scales: { y: { beginAtZero: true, ticks: { font: { size: 10 } } }, x: { ticks: { font: { size: 10 } } } },
          }}
          height={140}
        />
      </div>

      {/* 고객 유형 구분 */}
      <div>
        <p className="text-xs text-gray-400 mb-2">고객·문의 유형 구분</p>
        <div className="space-y-1.5">
          {Object.entries(cur.userTagMatrix).map(([userTag, dist]) => {
            const total = Object.values(dist).reduce((s, v) => s + v, 0);
            return (
              <div key={userTag} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-24 shrink-0">{userTag}</span>
                <div className="flex-1 flex gap-0.5 h-4 rounded overflow-hidden">
                  {tags.map((t, i) => {
                    const v = dist[t] || 0;
                    const pct = total ? (v / total) * 100 : 0;
                    const colors = ['bg-indigo-400', 'bg-orange-400', 'bg-red-400', 'bg-gray-300'];
                    return pct > 0 ? (
                      <div key={t} className={`${colors[i]} h-full`} style={{ width: `${pct}%` }} title={`${t}: ${v}건`} />
                    ) : null;
                  })}
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">{total}건</span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 mt-2">
          {tags.map((t, i) => {
            const colors = ['bg-indigo-400', 'bg-orange-400', 'bg-red-400', 'bg-gray-300'];
            return (
              <div key={t} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-sm ${colors[i]}`} />
                <span className="text-xs text-gray-400">{t}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
