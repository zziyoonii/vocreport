import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ['#6366f1','#f97316','#22c55e','#a855f7','#06b6d4','#f59e0b'];

export default function PieChart({ data = {}, title = '' }) {
  const labels = Object.keys(data);
  const values = Object.values(data);

  const chartData = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: COLORS.slice(0, labels.length),
      borderWidth: 1,
    }],
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {title && <p className="text-sm font-medium text-gray-700">{title}</p>}
      <div className="w-56 h-56">
        <Pie data={chartData} options={{ responsive: true, plugins: { legend: { position: 'right' } } }} />
      </div>
    </div>
  );
}
