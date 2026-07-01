import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

export default function SprintComboChart({ sprints = [] }) {
  const labels = sprints.map((s) => `S${s.sprint}`);

  const data = {
    labels,
    datasets: [
      {
        type: 'bar',
        label: '문의 건수',
        data: sprints.map((s) => s.count),
        backgroundColor: 'rgba(99,102,241,0.6)',
        yAxisID: 'y',
        order: 2,
      },
      {
        type: 'line',
        label: '평균 처리시간(일)',
        data: sprints.map((s) => s.avgDays),
        borderColor: 'rgb(249,115,22)',
        backgroundColor: 'rgba(249,115,22,0.1)',
        tension: 0.3,
        yAxisID: 'y1',
        order: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: { type: 'linear', position: 'left', title: { display: true, text: '건수' } },
      y1: { type: 'linear', position: 'right', title: { display: true, text: '처리시간(일)' }, grid: { drawOnChartArea: false } },
    },
  };

  return <Bar data={data} options={options} />;
}
