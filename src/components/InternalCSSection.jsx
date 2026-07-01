import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Tooltip, Legend,
} from 'chart.js';
import DonutChart from './charts/DonutChart.jsx';
import { api } from '../services/api.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

const TYPE_COLORS = {
  '기타':             '#a78bfa',
  '데이터 수정':      '#60a5fa',
  '오픈 제보/피드백': '#f97316',
  '채널 생성':        '#34d399',
  '강의 복사':        '#f59e0b',
  '기능 개선 요청':   '#818cf8',
  '버그 수정 요청':   '#fb7185',
};

export default function InternalCSSection({ service, sprint }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);   // 차트 슬라이딩용

  useEffect(() => {
    setLoading(true);
    api.internalCS(service).then(setData).finally(() => setLoading(false));
  }, [service]);

  if (loading) return <p className="text-gray-300 text-xs py-4">로딩 중...</p>;
  if (!data) return null;

  const allSprints = data.sprints;
  const cur = allSprints.find((s) => s.sprint === sprint) ?? allSprints[allSprints.length - 1];

  // 표시할 스프린트 윈도우 (최대 8개)
  const WINDOW = 8;
  const maxOffset = Math.max(0, allSprints.length - WINDOW);
  const visible = allSprints.slice(
    Math.max(0, allSprints.length - WINDOW - offset),
    allSprints.length - offset || undefined,
  );

  const allTypes = [...new Set(allSprints.flatMap((s) => Object.keys(s.typeDist || {})))];

  const comboData = {
    labels: visible.map((s) => `S${s.sprint}`),
    datasets: [
      ...allTypes.map((type) => ({
        type: 'bar',
        label: type,
        data: visible.map((s) => s.typeDist?.[type] || 0),
        backgroundColor: TYPE_COLORS[type] || '#cbd5e1',
        stack: 'types',
        order: 2,
      })),
      {
        type: 'line',
        label: '평균 처리 시간(일)',
        data: visible.map((s) => s.avgDays),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.08)',
        tension: 0.35,
        yAxisID: 'y1',
        order: 1,
        pointRadius: 4,
        pointBackgroundColor: '#ef4444',
      },
    ],
  };

  // 도넛용: 전체 스프린트 유형 합산
  const totalTypeDist = {};
  allSprints.forEach((s) => {
    Object.entries(s.typeDist || {}).forEach(([t, n]) => {
      totalTypeDist[t] = (totalTypeDist[t] || 0) + n;
    });
  });

  const totalRequests = allSprints.reduce((s, r) => s + r.count, 0);

  return (
    <div className="space-y-4">
      {/* 핵심 수치 */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: '업무 요청', value: totalRequests, unit: '건', color: 'text-gray-800' },
          { label: '평균 처리 시간', value: cur?.avgDays, unit: '일', color: 'text-gray-800' },
          { label: `이번 스프린트 (S${sprint})`, value: cur?.count ?? '-', unit: '건', color: 'text-indigo-600' },
        ].map((m) => (
          <div key={m.label} className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400">{m.label}</p>
            <p className={`text-xl font-bold ${m.color}`}>
              {m.value}<span className="text-xs font-normal text-gray-400 ml-0.5">{m.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* 콤보 차트 + 도넛 차트 나란히 */}
      <div className="flex gap-4 items-start">
        {/* 콤보 차트 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-400">스프린트별 업무 요청 추이</p>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <button
                disabled={offset >= maxOffset}
                onClick={() => setOffset((o) => Math.min(o + 1, maxOffset))}
                className="px-1 hover:text-gray-600 disabled:opacity-30"
              >‹</button>
              <span>S{visible[0]?.sprint}~S{visible[visible.length - 1]?.sprint}</span>
              <button
                disabled={offset <= 0}
                onClick={() => setOffset((o) => Math.max(o - 1, 0))}
                className="px-1 hover:text-gray-600 disabled:opacity-30"
              >›</button>
            </div>
          </div>
          <Bar
            data={comboData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y:  { stacked: true, beginAtZero: true, ticks: { font: { size: 9 } } },
                y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, ticks: { font: { size: 9 } } },
                x:  { stacked: true, ticks: { font: { size: 9 } } },
              },
            }}
            height={170}
          />
        </div>

        {/* 도넛 차트 */}
        <div className="w-44 shrink-0">
          <DonutChart data={totalTypeDist} title="문의 유형 분포 (전체)" />
        </div>
      </div>
    </div>
  );
}
