import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts";
import { useAuth } from "../hooks/useAuth";
import { fetchHistory, deletePrediction } from "../services/api";
import { RISK_CONFIG } from "../services/sensorMeta";

const RISK_COLORS = {
  Healthy: "#22c55e",
  Moderate: "#eab308",
  "High Risk": "#f97316",
  Critical: "#ef4444",
};

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  const color = RISK_COLORS[payload.risk_level] || "#6b7280";
  return <circle cx={cx} cy={cy} r={5} fill={color} stroke="#111827" strokeWidth={2} />;
};

export default function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await fetchHistory(user.uid, 50);
      setPredictions(data.predictions || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this prediction record?")) return;
    setDeleting(id);
    try {
      await deletePrediction(id, user.uid);
      setPredictions((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    } finally {
      setDeleting(null);
    }
  };

  // Prepare chart data (oldest first)
  const chartData = [...predictions]
    .reverse()
    .map((p, i) => ({
      index: i + 1,
      health_score: p.health_score,
      risk_level: p.risk_level,
      date: new Date(p.createdAt).toLocaleDateString(),
    }));

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-stone-500 text-sm">Loading history...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900">Prediction History</h1>
          <p className="text-stone-500 text-sm mt-1">{predictions.length} scans recorded</p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-amber-500 text-gray-950 font-bold rounded-xl text-sm hover:bg-cyan-400 transition-all"
        >
          + New Scan
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
      )}

      {predictions.length === 0 ? (
        <div className="bg-[#292524] border border-[#44403c] rounded-2xl p-16 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-stone-500 mb-6">No predictions yet. Run your first diagnostic scan!</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-amber-500 text-gray-950 font-bold rounded-xl text-sm"
          >
            Start Scanning
          </button>
        </div>
      ) : (
        <>
          {/* Trend chart */}
          <div className="bg-transparent border border-[#44403c] rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-stone-900 mb-1">Health Score Trend</h2>
            <p className="text-xs text-stone-400 mb-6">History of your engine health scores over time</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                  labelStyle={{ color: "#9ca3af" }}
                  itemStyle={{ color: "#22d3ee" }}
                />
                <ReferenceLine y={75} stroke="#22c55e" strokeDasharray="4 4" label={{ value: "Healthy", fill: "#22c55e", fontSize: 10 }} />
                <ReferenceLine y={50} stroke="#eab308" strokeDasharray="4 4" label={{ value: "Moderate", fill: "#eab308", fontSize: 10 }} />
                <ReferenceLine y={25} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Critical", fill: "#ef4444", fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="health_score"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={<CustomDot />}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="bg-[#292524] border border-[#44403c] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#44403c] bg-[#292524]/80">
                    <th className="text-left text-xs font-semibold text-stone-400 px-4 py-3">DATE</th>
                    <th className="text-left text-xs font-semibold text-stone-400 px-4 py-3">SCORE</th>
                    <th className="text-left text-xs font-semibold text-stone-400 px-4 py-3">RISK LEVEL</th>
                    <th className="text-left text-xs font-semibold text-stone-400 px-4 py-3 hidden md:table-cell">RPM</th>
                    <th className="text-left text-xs font-semibold text-stone-400 px-4 py-3 hidden md:table-cell">COOLANT</th>
                    <th className="text-left text-xs font-semibold text-stone-400 px-4 py-3 hidden lg:table-cell">VOLTAGE</th>
                    <th className="text-left text-xs font-semibold text-stone-400 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((p) => {
                    const cfg = RISK_CONFIG[p.risk_level] || RISK_CONFIG["Healthy"];
                    return (
                      <tr key={p._id} className="border-b border-[#44403c]/50 hover:bg-stone-100/30 transition-colors">
                        <td className="px-4 py-3 text-stone-500 text-xs">
                          {new Date(p.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold" style={{ color: cfg.color }}>
                            {p.health_score.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-semibold text-gray-950"
                            style={{ backgroundColor: cfg.color }}
                          >
                            {p.risk_level}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-stone-500 hidden md:table-cell">{p.RPM}</td>
                        <td className="px-4 py-3 text-stone-500 hidden md:table-cell">{p.COOLANT_TEMP}°C</td>
                        <td className="px-4 py-3 text-stone-500 hidden lg:table-cell">{p.ELM_VOLTAGE}V</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDelete(p._id)}
                            disabled={deleting === p._id}
                            className="text-xs text-stone-400 hover:text-red-400 transition-colors disabled:opacity-50"
                          >
                            {deleting === p._id ? "..." : "✕"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
