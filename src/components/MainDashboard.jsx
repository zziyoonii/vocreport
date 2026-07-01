import { useState, useEffect } from 'react';
import { currentSprintNo, sprintToDateRange, SERVICES } from '../config/sprintConfig.js';
import ServiceDetailDashboard from './ServiceDetailDashboard.jsx';
import { api } from '../services/api.js';

const SPRINT_TABS_COUNT = 2; // 직전 2개 스프린트 탭 표시

function SprintTabs({ selected, onSelect }) {
  const cur = currentSprintNo();
  const tabs = [
    { label: '이번 스프린트', sprint: cur },
    { label: `Sprint ${cur - 1}`, sprint: cur - 1 },
    { label: `Sprint ${cur - 2}`, sprint: cur - 2 },
  ];

  return (
    <div className="flex gap-3 flex-wrap">
      {tabs.map((t) => {
        const { start, end } = sprintToDateRange(t.sprint);
        const isSelected = selected === t.sprint;
        return (
          <button
            key={t.sprint}
            onClick={() => onSelect(t.sprint)}
            className={`rounded-xl px-5 py-3 text-left transition min-w-[180px] ${
              isSelected
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300'
            }`}
          >
            <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-800'}`}>{t.label}</p>
            <p className={`text-xs mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-gray-400'}`}>
              {start} ~ {end}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function UVSummary({ sprint }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.analyticsSummary('edu', sprint).then(setData).catch(() => {});
  }, [sprint]);

  if (!data) return <p className="text-gray-300 text-xs">로딩 중...</p>;

  const pos = data.eduChannel?.change > 0;
  return (
    <div className="mt-3 space-y-1">
      <div className="flex justify-between items-baseline">
        <span className="text-xs text-gray-400">총 방문자</span>
        <span className="text-base font-bold text-gray-800">{data.eduChannel?.activeUsers?.toLocaleString()}<span className="text-xs text-gray-400 ml-1">명</span></span>
      </div>
      <div className="flex justify-between items-baseline">
        <span className="text-xs text-gray-400">일평균</span>
        <span className="text-sm font-semibold text-gray-700">
          {data.eduChannel?.activeUsers ? Math.round(data.eduChannel.activeUsers / 21).toLocaleString() : '-'}<span className="text-xs text-gray-400 ml-1">명/일</span>
        </span>
      </div>
      {data.eduChannel?.change !== null && (
        <div className={`mt-2 rounded-lg px-3 py-2 ${pos ? 'bg-green-50' : 'bg-blue-50'}`}>
          <p className="text-xs text-gray-500">주간 추이</p>
          <p className={`text-lg font-bold ${pos ? 'text-green-600' : 'text-blue-600'}`}>
            {pos ? '+' : ''}{data.eduChannel.change}%
          </p>
          <p className="text-xs text-gray-400">직전 스프린트 대비</p>
        </div>
      )}
    </div>
  );
}

function ServiceCard({ service, sprint, onClick }) {
  const isEdu = service.id === 'edu';

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer p-5 flex flex-col"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{service.icon}</span>
          <span className="font-semibold text-gray-800">{service.label}</span>
        </div>
        <span className="text-gray-300 text-sm">→</span>
      </div>
      <p className="text-xs text-gray-400 mb-3">{sprintToDateRange(sprint).start} ~ {sprintToDateRange(sprint).end}</p>

      {isEdu ? (
        <UVSummary sprint={sprint} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-6">
          <div className="bg-gray-100 rounded-full px-4 py-1.5 text-xs text-gray-400 font-medium">🔌 준비중</div>
          <p className="text-xs text-gray-300 mt-2">GA4 데이터 연동 준비 중입니다</p>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400">
        상세 분석 보기 →
      </div>
    </div>
  );
}

export default function MainDashboard() {
  const [sprint, setSprint] = useState(currentSprintNo());
  const [selectedService, setSelectedService] = useState(null);

  if (selectedService) {
    return (
      <ServiceDetailDashboard
        service={selectedService}
        sprint={sprint}
        onBack={() => setSelectedService(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <h1 className="text-xl font-bold text-gray-900">VoC 대시보드</h1>
            <p className="text-xs text-gray-400">각 서비스의 방문자 현황을 한눈에 확인하세요</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1">
            <span>↻</span> 새로고침
          </button>
          <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-3 py-1.5 rounded-lg flex items-center gap-1">
            <span>✓</span> 연결됨
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8 space-y-8">
        <SprintTabs selected={sprint} onSelect={setSprint} />

        <div className="grid grid-cols-3 gap-6">
          {SERVICES.map((svc) => (
            <ServiceCard
              key={svc.id}
              service={svc}
              sprint={sprint}
              onClick={() => setSelectedService(svc)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
