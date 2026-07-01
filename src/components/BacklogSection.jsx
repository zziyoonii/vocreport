import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, LineElement,
  PointElement, Tooltip, Legend,
} from 'chart.js';
import { api } from '../services/api.js';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

export default function BacklogSection({ service, sprint }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.backlog(service).then(setData).finally(() => setLoading(false));
  }, [service]);

  if (loading) return <p className="text-gray-300 text-xs py-4">로딩 중...</p>;
  if (!data) return null;

  const latest = data.sprints[data.sprints.length - 1];

  const chartData = {
    labels: data.sprints.map((s) => `S${s.sprint}`),
    datasets: [
      { label: '신규 생성', data: data.sprints.map((s) => s.created), borderColor: '#6366f1', tension: 0.3, pointRadius: 3 },
      { label: '해결', data: data.sprints.map((s) => s.resolved), borderColor: '#22c55e', tension: 0.3, pointRadius: 3 },
      { label: '미해결', data: data.sprints.map((s) => s.unresolved), borderColor: '#ef4444', tension: 0.3, pointRadius: 3, borderDash: [4, 2] },
    ],
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: '신규 생성', value: latest?.created, color: 'text-indigo-500' },
          { label: '해결', value: latest?.resolved, color: 'text-green-500' },
          { label: '해결된 백로그', value: 0, color: 'text-gray-400', note: `S${sprint} 기준` },
        ].map((m) => (
          <div key={m.label} className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400">{m.label}</p>
            <p className={`text-xl font-bold ${m.color}`}>{m.value}<span className="text-xs font-normal text-gray-400 ml-0.5">건</span></p>
            {m.note && <p className="text-xs text-gray-300">{m.note}</p>}
          </div>
        ))}
      </div>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: { legend: { position: 'top', labels: { font: { size: 10 } } } },
          scales: { y: { beginAtZero: true, ticks: { font: { size: 9 } } }, x: { ticks: { font: { size: 9 } } } },
        }}
        height={130}
      />
    </div>
  );
}
