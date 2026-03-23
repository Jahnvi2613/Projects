import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RISK_CONFIG, SENSORS } from "../services/sensorMeta";
import HealthGauge from "../components/HealthGauge";

export default function ResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Guard: if navigated here directly without state
  if (!state?.prediction) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-stone-500 gap-4">
        <p>No prediction result found.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-3 bg-amber-500 text-gray-950 font-bold rounded-xl text-sm"
        >
          Run Diagnostics
        </button>
      </div>
    );
  }

  const { prediction, inputs } = state;
  const { risk_level, health_score, risk_description, recommendations } = prediction;
  const cfg = RISK_CONFIG[risk_level] || RISK_CONFIG["Healthy"];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900">Diagnostic Result</h1>
          <p className="text-stone-500 text-sm mt-1">{new Date().toLocaleString()}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-sm border border-stone-300 hover:bg-stone-200 transition-all"
          >
            ← New Scan
          </button>
          <button
            onClick={() => navigate("/history")}
            className="px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl text-sm hover:bg-amber-500/20 transition-all"
          >
            View History
          </button>
        </div>
      </div>

      {/* Main result card */}
      <div
        className="bg-transparent border rounded-2xl p-8 mb-6 text-center"
        style={{ borderColor: `${cfg.color}40` }}
      >
        {/* Gauge */}
        <div className="flex justify-center mb-6">
          <HealthGauge score={health_score} riskLevel={risk_level} size={220} />
        </div>

        {/* Risk badge */}
        <div
          className="inline-block px-6 py-2 rounded-full font-bold text-gray-950 text-lg mb-4"
          style={{ backgroundColor: cfg.color }}
        >
          {risk_level}
        </div>

        {/* Description */}
        <p className="text-stone-700 text-sm max-w-xl mx-auto leading-relaxed">{risk_description}</p>
      </div>

      {/* Recommendations */}
      {recommendations?.length > 0 && (
        <div className="bg-transparent border border-[#44403c] rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span>💡</span> Recommendations
          </h2>
          <ul className="space-y-2">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                <span className="mt-0.5 text-amber-400 flex-shrink-0">→</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Input summary */}
      {inputs && (
        <div className="bg-transparent border border-[#44403c] rounded-2xl p-6">
          <h2 className="font-bold text-stone-900 mb-4">Sensor Readings Submitted</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {SENSORS.map((s) => (
              <div key={s.key} className="bg-stone-100 rounded-lg p-2.5">
                <p className="text-xs text-stone-400 mb-0.5">{s.label}</p>
                <p className="text-sm font-bold text-stone-900">
                  {inputs[s.key]} <span className="text-xs font-normal text-stone-500">{s.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
