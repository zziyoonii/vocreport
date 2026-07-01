import { useEffect, useState } from 'react';
import SprintComboChart from './charts/SprintComboChart.jsx';
import PieChart from './charts/PieChart.jsx';
import { api } from '../services/api.js';

export default function InternalCSSection({ service }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.internalCS(service)
      .then(setData)
      .finally(() => setLoading(false));
  }, [service]);

  if (loading) return <div className="text-gray-400 text-sm py-4">로딩 중...</div>;
  if (!data) return null;

  const latest = data.sprints[data.sprints.length - 1];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">스프린트별 업무 요청 추이</h3>
        <SprintComboChart sprints={data.sprints} />
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">문의 유형 분포 (S{latest?.sprint})</h3>
        <PieChart data={latest?.typeDist || {}} />
      </div>
    </div>
  );
}
