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
import { VisitStatDto, NewUserStatDto } from "../../../types";
import { TrendingUp, BarChart2, Activity, Calendar, UserPlus, Users } from "lucide-react";

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
  { label: "7 Days", value: "week" },
  { label: "30 Days", value: "month" },
  { label: "1 Year", value: "year" },
];

const CHART_TYPE_OPTIONS: { label: string; value: ChartType; icon: React.ReactNode }[] = [
  { label: "Line", value: "line", icon: <TrendingUp size={16} /> },
  { label: "Bar", value: "bar", icon: <BarChart2 size={16} /> },
];

const AdminDashboardPage: React.FC = () => {
  const [visitStats, setVisitStats] = useState<VisitStatDto[]>([]);
  const [userStats, setUserStats] = useState<NewUserStatDto[]>([]);
  const [range, setRange] = useState<Range>("week");
  const [chartType, setChartType] = useState<ChartType>("line");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [vData, uData] = await Promise.all([
        adminApi.getVisitStats(range),
        adminApi.getNewUserStats(range)
      ]);
      setVisitStats(vData ?? []);
      setUserStats(uData ?? []);
    } catch {
      setError("Failed to load statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const totalVisits = visitStats.reduce((sum, s) => sum + s.visitCount, 0);
  const avgVisits = visitStats.length > 0 ? Math.round(totalVisits / visitStats.length) : 0;
  
  const totalUsers = userStats.reduce((sum, s) => sum + s.newUserCount, 0);
  const avgUsers = userStats.length > 0 ? Math.round(totalUsers / userStats.length) : 0;

  const formatLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    if (range === "year") return `${d.getMonth() + 1}/${d.getFullYear()}`;
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  const labels = visitStats.map((s) => formatLabel(s.date));
  const visitData = visitStats.map((s) => s.visitCount);
  const userData = userStats.map((s) => s.newUserCount);

  const visitChartData = {
    labels,
    datasets: [
      {
        label: "Visits",
        data: visitData,
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

  const userChartData = {
    labels,
    datasets: [
      {
        label: "New Users",
        data: userData,
        borderColor: "rgb(16, 185, 129)",
        backgroundColor:
          chartType === "line"
            ? "rgba(16, 185, 129, 0.08)"
            : "rgba(16, 185, 129, 0.75)",
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
          label: (ctx: any) => ` ${ctx.dataset.label || ""}: ${Number(ctx.raw).toLocaleString()}`,
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
          <p className="text-sm text-gray-500 mt-0.5">Overview of application visits and users</p>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Visits", value: totalVisits.toLocaleString(), icon: <Activity size={20} />, bg: "bg-blue-50 text-blue-600" },
          { label: "New Registrations", value: totalUsers.toLocaleString(), icon: <UserPlus size={20} />, bg: "bg-emerald-50 text-emerald-600" },
          { label: "Avg Visits/Day", value: avgVisits.toLocaleString(), icon: <BarChart2 size={20} />, bg: "bg-indigo-50 text-indigo-600" },
          { label: "Avg Users/Day", value: avgUsers.toLocaleString(), icon: <Users size={20} />, bg: "bg-teal-50 text-teal-600" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-11 h-11 flex-shrink-0 rounded-xl flex items-center justify-center ${card.bg}`}>
              {card.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium truncate">{card.label}</p>
              <p className="text-lg font-bold text-gray-900 truncate">{loading ? "—" : card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Statistical Charts</h3>
        {/* Chart type selector */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          {CHART_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setChartType(opt.value)}
              title={opt.label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                chartType === opt.value
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visit Chart Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-6">Visit Statistics</h3>

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
                <Line data={visitChartData} options={chartOptions} />
              ) : (
                <Bar data={visitChartData} options={chartOptions} />
              )}
            </div>
          )}
        </div>

        {/* User Chart Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-6">New User Statistics</h3>

          {loading && (
            <div className="h-72 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
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
                <Line data={userChartData} options={chartOptions} />
              ) : (
                <Bar data={userChartData} options={chartOptions} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
