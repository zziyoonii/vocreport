import { useEffect, useState } from 'react';
import BacklogTrendChart from './charts/BacklogTrendChart.jsx';
import { api } from '../services/api.js';

export default function BacklogSection({ service }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.backlog(service)
      .then(setData)
      .finally(() => setLoading(false));
  }, [service]);

  if (loading) return <div className="text-gray-400 text-sm py-4">로딩 중...</div>;
  if (!data) return null;

  const latest = data.sprints[data.sprints.length - 1];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '신규 생성', value: latest?.created, color: 'text-indigo-600' },
          { label: '해결', value: latest?.resolved, color: 'text-green-600' },
          { label: '미해결', value: latest?.unresolved, color: 'text-red-500' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{m.label}</p>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}<span className="text-sm font-normal text-gray-400 ml-1">건</span></p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">스프린트별 백로그 추이</h3>
        <BacklogTrendChart sprints={data.sprints} />
      </div>
    </div>
  );
}
