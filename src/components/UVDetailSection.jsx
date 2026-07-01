import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { sprintToDateRange } from '../config/sprintConfig.js';

function UVPanel({ title, color, data, prevData }) {
  const cur = data?.activeUsers;
  const prev = prevData?.activeUsers;
  const change = cur && prev ? (((cur - prev) / prev) * 100).toFixed(1) : null;
  const pos = change > 0;

  return (
    <div className={`rounded-2xl p-5 text-white ${color}`}>
      <p className="text-sm font-semibold opacity-90 mb-1">{title}</p>
      <p className="text-xs opacity-60 mb-4">{data?.period}</p>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs opacity-60">총 방문자</p>
          <p className="text-2xl font-bold">{cur?.toLocaleString() ?? '-'}</p>
          <p className="text-xs opacity-60 mt-0.5">고유 Active Users</p>
        </div>
        <div>
          <p className="text-xs opacity-60">일평균</p>
          <p className="text-2xl font-bold">{cur ? Math.round(cur / 21).toLocaleString() : '-'}</p>
          <p className="text-xs opacity-60 mt-0.5">21일 기준</p>
        </div>
        {change !== null && (
          <div>
            <p className="text-xs opacity-60">직전 스프린트 대비</p>
            <p className={`text-2xl font-bold ${pos ? 'text-green-300' : 'text-blue-200'}`}>
              {pos ? '+' : ''}{change}%
            </p>
            <p className="text-xs opacity-60 mt-0.5">
              직전 {prev?.toLocaleString()} → 현재 {cur?.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UVDetailSection({ sprint, prevSprint }) {
  const [cur, setCur] = useState(null);
  const [prev, setPrev] = useState(null);

  useEffect(() => {
    api.analyticsSummary('edu', sprint).then(setCur).catch(() => {});
    api.analyticsSummary('edu', prevSprint).then(setPrev).catch(() => {});
  }, [sprint, prevSprint]);

  const { start, end } = sprintToDateRange(sprint);
  const { start: pStart, end: pEnd } = sprintToDateRange(prevSprint);

  return (
    <div className="grid grid-cols-2 gap-4">
      <UVPanel
        title="📚 EDU CH 방문자 지표"
        color="bg-gradient-to-br from-indigo-500 to-purple-600"
        data={{ activeUsers: cur?.eduChannel?.activeUsers, period: `${start} ~ ${end} (21일)` }}
        prevData={{ activeUsers: prev?.eduChannel?.activeUsers }}
      />
      <UVPanel
        title="🎓 EDU 방문자 지표"
        color="bg-gradient-to-br from-purple-500 to-pink-600"
        data={{ activeUsers: cur?.edu?.activeUsers, period: `${start} ~ ${end} (21일)` }}
        prevData={{ activeUsers: prev?.edu?.activeUsers }}
      />
    </div>
  );
}
