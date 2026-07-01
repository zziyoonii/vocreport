import { useState } from 'react';
import { currentSprintNo, SERVICES } from '../config/sprintConfig.js';
import ExternalCSSection from './ExternalCSSection.jsx';
import InternalCSSection from './InternalCSSection.jsx';
import SprintAnalysisSection from './SprintAnalysisSection.jsx';
import BacklogSection from './BacklogSection.jsx';
import UVSection from './UVSection.jsx';

const TABS = [
  { id: 'external', label: '📊 외부 CS' },
  { id: 'internal', label: '📈 내부 CS' },
  { id: 'ai', label: '🤖 AI 분석' },
  { id: 'backlog', label: '📋 백로그' },
  { id: 'uv', label: '🌐 UV' },
];

export default function MainDashboard() {
  const sprint = currentSprintNo();
  const [tab, setTab] = useState('external');
  const [service, setService] = useState('ide');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">CX Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">구름 고객경험팀 · Sprint {sprint}</p>
        </div>
        <div className="flex gap-2">
          {SERVICES.map((s) => (
            <button
              key={s.id}
              onClick={() => setService(s.id)}
              className={`text-sm px-3 py-1.5 rounded-full transition ${
                service === s.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </header>

      <nav className="bg-white border-b border-gray-100 px-6 flex gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-sm px-4 py-3 border-b-2 transition ${
              tab === t.id
                ? 'border-indigo-600 text-indigo-600 font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-6">
        {tab === 'external' && <ExternalCSSection service={service} sprint={sprint} />}
        {tab === 'internal' && <InternalCSSection service={service} />}
        {tab === 'ai' && <SprintAnalysisSection />}
        {tab === 'backlog' && <BacklogSection service={service} />}
        {tab === 'uv' && <UVSection sprint={sprint} />}
      </main>
    </div>
  );
}
