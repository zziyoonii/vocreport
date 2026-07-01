import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = ['#a78bfa','#60a5fa','#f97316','#34d399','#f59e0b','#fb7185','#818cf8'];

export default function DonutChart({ data = {}, title = '' }) {
  const labels = Object.keys(data);
  const values = Object.values(data);
  const total = values.reduce((s, v) => s + v, 0);

  const chartData = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: PALETTE.slice(0, labels.length),
      borderWidth: 2,
      borderColor: '#fff',
      hoverOffset: 4,
    }],
  };

  return (
    <div className="flex flex-col items-center">
      {title && <p className="text-xs text-gray-500 mb-2 font-medium">{title}</p>}
      <div className="relative w-40 h-40">
        <Doughnut
          data={chartData}
          options={{
            cutout: '68%',
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw}건 (${((ctx.raw/total)*100).toFixed(1)}%)` } },
            },
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-gray-800">{total}</span>
          <span className="text-xs text-gray-400">건</span>
        </div>
      </div>
      <ul className="mt-3 space-y-1 w-full">
        {labels.map((label, i) => (
          <li key={label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: PALETTE[i] }} />
              <span className="text-gray-600">{label}</span>
            </span>
            <span className="text-gray-500 font-medium">{values[i]}건</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
