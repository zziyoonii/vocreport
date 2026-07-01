import { useEffect, useState } from 'react';
import PieChart from './charts/PieChart.jsx';
import { api } from '../services/api.js';

function Badge({ value }) {
  if (value === null || value === undefined) return null;
  const pos = value > 0;
  return (
    <span className={`text-xs font-semibold ml-1 ${pos ? 'text-red-500' : 'text-blue-500'}`}>
      {pos ? '▲' : '▼'}{Math.abs(value)}%
    </span>
  );
}

export default function ExternalCSSection({ service, sprint }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.externalCS(service)
      .then(setData)
      .finally(() => setLoading(false));
  }, [service]);

  if (loading) return <div className="text-gray-400 text-sm py-4">로딩 중...</div>;
  if (!data) return null;

  const cur = data.sprints.find((s) => s.sprint === sprint) || data.sprints[data.sprints.length - 1];
  if (!cur) return <div className="text-gray-400 text-sm">데이터 없음</div>;

  return (
    <div className="space-y-6">
      {/* 핵심 지표 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">총 문의 건수</p>
          <p className="text-2xl font-bold text-gray-800">
            {cur.count}<span className="text-sm font-normal text-gray-400 ml-1">건</span>
          </p>
          <Badge value={cur.countChange} />
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">평균 처리 시간</p>
          <p className="text-2xl font-bold text-gray-800">
            {cur.avgHours}<span className="text-sm font-normal text-gray-400 ml-1">h</span>
          </p>
          <Badge value={cur.avgHoursChange} />
        </div>
      </div>

      {/* Tag 분포 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">문의 유형 분포</h3>
        <PieChart data={cur.tagDist} />
      </div>

      {/* Top 5 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Top 5 문의 항목</h3>
        <ul className="space-y-2">
          {cur.top5.map((t, i) => (
            <li key={t.item} className="flex items-center justify-between">
              <span className="text-sm text-gray-600"><span className="font-bold text-indigo-500 mr-2">#{i + 1}</span>{t.item}</span>
              <span className="text-sm font-semibold text-gray-800">{t.count}건</span>
            </li>
          ))}
        </ul>
      </div>

      {/* UserTag 매트릭스 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 overflow-x-auto">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">고객 유형별 문의 매트릭스</h3>
        <table className="text-xs w-full">
          <thead>
            <tr className="text-gray-400">
              <th className="text-left pb-2">고객 유형</th>
              {['단순문의','기술문의','오류문의','기타'].map((t) => (
                <th key={t} className="pb-2 px-2">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(cur.userTagMatrix).map(([userTag, dist]) => (
              <tr key={userTag} className="border-t border-gray-50">
                <td className="py-1 text-gray-600 pr-3">{userTag}</td>
                {['단순문의','기술문의','오류문의','기타'].map((t) => (
                  <td key={t} className="py-1 px-2 text-center text-gray-700">{dist[t] || 0}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
