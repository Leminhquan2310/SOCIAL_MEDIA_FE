import React, { useState, useEffect, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { adminApi } from "../../services/adminApi";
import { VisitStatDto } from "../../../types";
import { TrendingUp, BarChart2, Activity, Calendar } from "lucide-react";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type Range = "week" | "month" | "year";
type ChartType = "line" | "bar";

const RANGE_OPTIONS: { label: string; value: Range }[] = [
  { label: "7 ngày", value: "week" },
  { label: "30 ngày", value: "month" },
  { label: "365 ngày", value: "year" },
];

const CHART_TYPE_OPTIONS: { label: string; value: ChartType; icon: React.ReactNode }[] = [
  { label: "Line", value: "line", icon: <TrendingUp size={16} /> },
  { label: "Bar", value: "bar", icon: <BarChart2 size={16} /> },
];

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<VisitStatDto[]>([]);
  const [range, setRange] = useState<Range>("week");
  const [chartType, setChartType] = useState<ChartType>("line");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getVisitStats(range);
      setStats(data ?? []);
    } catch {
      setError("Không thể tải dữ liệu thống kê. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const totalVisits = stats.reduce((sum, s) => sum + s.visitCount, 0);
  const maxVisits = Math.max(...stats.map((s) => s.visitCount), 0);
  const avgVisits = stats.length > 0 ? Math.round(totalVisits / stats.length) : 0;

  const formatLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    if (range === "year") return `${d.getMonth() + 1}/${d.getFullYear()}`;
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  const labels = stats.map((s) => formatLabel(s.date));
  const dataValues = stats.map((s) => s.visitCount);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Lượt truy cập",
        data: dataValues,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor:
          chartType === "line"
            ? "rgba(59, 130, 246, 0.08)"
            : "rgba(59, 130, 246, 0.75)",
        fill: chartType === "line",
        tension: 0.4,
        pointRadius: chartType === "line" ? 4 : 0,
        pointHoverRadius: 6,
        borderWidth: 2,
        borderRadius: chartType === "bar" ? 6 : 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 12 },
        bodyFont: { size: 14, weight: "bold" as const },
        callbacks: {
          label: (ctx: { raw: unknown }) => ` ${(ctx.raw as number).toLocaleString()} lượt`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(148, 163, 184, 0.1)" },
        ticks: {
          color: "#94a3b8",
          font: { size: 11 },
          callback: (v: string | number) => Number(v).toLocaleString(),
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-0.5">Tổng quan lượt truy cập ứng dụng</p>
        </div>
        <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl p-1">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                range === opt.value
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Calendar size={13} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Tổng lượt truy cập", value: totalVisits.toLocaleString(), icon: <Activity size={20} />, color: "blue" },
          { label: "Cao nhất / ngày", value: maxVisits.toLocaleString(), icon: <TrendingUp size={20} />, color: "emerald" },
          { label: "Trung bình / ngày", value: avgVisits.toLocaleString(), icon: <BarChart2 size={20} />, color: "violet" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-${card.color}-50 text-${card.color}-600`}>
              {card.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{card.label}</p>
              <p className="text-xl font-bold text-gray-900">{loading ? "—" : card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-gray-800">Biểu đồ lượt truy cập</h3>
          {/* Chart type selector */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {CHART_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setChartType(opt.value)}
                title={opt.label}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  chartType === opt.value
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="h-72 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div className="h-72 flex items-center justify-center text-red-500 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="h-72">
            {chartType === "line" ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
