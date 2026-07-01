import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

function UVCard({ title, data }) {
  const pos = data?.change > 0;
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <p className="text-xs text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-800">
        {data?.activeUsers?.toLocaleString() ?? '-'}
        <span className="text-sm font-normal text-gray-400 ml-1">명</span>
      </p>
      {data?.change !== null && (
        <p className={`text-xs font-semibold mt-1 ${pos ? 'text-red-500' : 'text-blue-500'}`}>
          {pos ? '▲' : '▼'} {Math.abs(data.change)}% vs 이전 스프린트
        </p>
      )}
    </div>
  );
}

export default function UVSection({ sprint }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.analyticsSummary('all', sprint)
      .then(setData)
      .finally(() => setLoading(false));
  }, [sprint]);

  if (loading) return <div className="text-gray-400 text-sm py-4">로딩 중...</div>;
  if (!data) return null;

  return (
    <div className="grid grid-cols-2 gap-4">
      <UVCard title="EDU Channel UV" data={data.eduChannel} />
      <UVCard title="EDU (edu.goorm.io) UV" data={data.edu} />
    </div>
  );
}
