import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Tooltip, Legend,
} from 'chart.js';
import { api } from '../services/api.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

const TYPE_COLORS = {
  '기타': '#a78bfa',
  '데이터 수정': '#60a5fa',
  '오픈 제보/피드백': '#f97316',
  '채널 생성': '#34d399',
  '강의 복사': '#f59e0b',
  '기능 개선 요청': '#818cf8',
  '버그 수정 요청': '#fb7185',
};

export default function InternalCSSection({ service, sprint }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sprintRange, setSprintRange] = useState({ from: sprint - 7, to: sprint });

  useEffect(() => {
    setLoading(true);
    api.internalCS(service).then(setData).finally(() => setLoading(false));
  }, [service]);

  if (loading) return <p className="text-gray-300 text-xs py-4">로딩 중...</p>;
  if (!data) return null;

  const visible = data.sprints.filter((s) => s.sprint >= sprintRange.from && s.sprint <= sprintRange.to);
  const cur = data.sprints.find((s) => s.sprint === sprint) || data.sprints[data.sprints.length - 1];

  const allTypes = [...new Set(data.sprints.flatMap((s) => Object.keys(s.typeDist || {})))];

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
        backgroundColor: 'rgba(239,68,68,0.1)',
        tension: 0.3,
        yAxisID: 'y1',
        order: 1,
        pointRadius: 4,
      },
    ],
  };

  // 파이차트용 타입 합산 (전체 스프린트)
  const totalTypeDist = {};
  data.sprints.forEach((s) => {
    Object.entries(s.typeDist || {}).forEach(([type, cnt]) => {
      totalTypeDist[type] = (totalTypeDist[type] || 0) + cnt;
    });
  });

  const totalItems = Object.values(totalTypeDist).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      {/* 핵심 수치 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400">업무 요청</p>
          <p className="text-xl font-bold text-gray-800">{data.sprints.reduce((s, r) => s + r.count, 0)}<span className="text-xs text-gray-400 ml-1">건</span></p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400">평균 처리 시간</p>
          <p className="text-xl font-bold text-gray-800">{cur?.avgDays}<span className="text-xs text-gray-400 ml-1">일</span></p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400">이번 스프린트 (S{sprint})</p>
          <p className="text-xl font-bold text-gray-800">{cur?.count ?? '-'}<span className="text-xs text-gray-400 ml-1">건</span></p>
        </div>
      </div>

      {/* 스프린트별 추이 콤보 차트 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-400">스프린트별 업무 요청 추이</p>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <button
              onClick={() => setSprintRange((r) => ({ from: r.from - 1, to: r.to - 1 }))}
              className="px-1 hover:text-gray-600"
            >‹</button>
            <span>S{sprintRange.from}~S{sprintRange.to}</span>
            <button
              onClick={() => setSprintRange((r) => ({ from: r.from + 1, to: r.to + 1 }))}
              className="px-1 hover:text-gray-600"
            >›</button>
          </div>
        </div>
        <Bar
          data={comboData}
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              y: { stacked: true, beginAtZero: true, ticks: { font: { size: 9 } } },
              y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, ticks: { font: { size: 9 } } },
              x: { stacked: true, ticks: { font: { size: 9 } } },
            },
          }}
          height={160}
        />
      </div>

      {/* 유형 분포 (전체 누적) */}
      <div>
        <p className="text-xs text-gray-400 mb-2">문의 유형 분포 (전체)</p>
        <div className="flex gap-1 h-3 rounded-full overflow-hidden">
          {Object.entries(totalTypeDist).map(([type, cnt]) => (
            <div
              key={type}
              className="h-full"
              style={{ width: `${(cnt / totalItems) * 100}%`, backgroundColor: TYPE_COLORS[type] || '#cbd5e1' }}
              title={`${type}: ${cnt}건`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(totalTypeDist).map(([type, cnt]) => (
            <div key={type} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: TYPE_COLORS[type] || '#cbd5e1' }} />
              <span className="text-xs text-gray-400">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
