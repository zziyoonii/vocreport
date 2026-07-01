import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, LineElement,
  PointElement, Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

export default function BacklogTrendChart({ sprints = [] }) {
  const labels = sprints.map((s) => `S${s.sprint}`);

  const data = {
    labels,
    datasets: [
      { label: '신규', data: sprints.map((s) => s.created), borderColor: '#6366f1', tension: 0.3 },
      { label: '해결', data: sprints.map((s) => s.resolved), borderColor: '#22c55e', tension: 0.3 },
      { label: '미해결', data: sprints.map((s) => s.unresolved), borderColor: '#ef4444', tension: 0.3 },
    ],
  };

  return (
    <Line
      data={data}
      options={{
        responsive: true,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true } },
      }}
    />
  );
}
