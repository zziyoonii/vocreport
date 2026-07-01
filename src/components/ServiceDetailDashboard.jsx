import { useEffect, useState } from 'react';
import { sprintToDateRange, currentSprintNo } from '../config/sprintConfig.js';
import { api } from '../services/api.js';
import ExternalCSSection from './ExternalCSSection.jsx';
import InternalCSSection from './InternalCSSection.jsx';
import BacklogSection from './BacklogSection.jsx';
import UVDetailSection from './UVDetailSection.jsx';
import SprintVoCComparison from './SprintVoCComparison.jsx';

export default function ServiceDetailDashboard({ service, sprint, onBack }) {
  const { start, end } = sprintToDateRange(sprint);
  const prevSprint = sprint - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition"
          >
            ← 돌아가기
          </button>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <span className="text-xl">{service.icon}</span>
            <div>
              <h1 className="text-base font-bold text-gray-900">{service.label} - VoC 상세 분석</h1>
              <p className="text-xs text-gray-400">기간: {start} ~ {end} (21일)</p>
            </div>
          </div>
        </div>
        <button className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1">
          <span>↻</span> 새로고침
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-6 space-y-6">
        {/* UV 지표 (EDU만) */}
        {service.id === 'edu' && (
          <UVDetailSection sprint={sprint} prevSprint={prevSprint} />
        )}

        {/* 외부 CS + 내부 CS (2단 그리드) */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-500 mb-4 flex items-center gap-2">
              <span>💬</span> 외부 CS 지표
            </h2>
            <ExternalCSSection service={service.id} sprint={sprint} />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-500 mb-4 flex items-center gap-2">
              <span>📋</span> 내부 CS 지표
            </h2>
            <InternalCSSection service={service.id} sprint={sprint} />
          </div>
        </div>

        {/* 스프린트 VoC 비교 분석 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-500 mb-4 flex items-center gap-2">
            <span>🔍</span> 스프린트 VoC 비교 분석
            <span className="ml-1 text-xs font-normal text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full">
              S{prevSprint} → S{sprint}
            </span>
          </h2>
          <SprintVoCComparison service={service.id} prevSprint={prevSprint} curSprint={sprint} />
        </div>
      </main>
    </div>
  );
}
