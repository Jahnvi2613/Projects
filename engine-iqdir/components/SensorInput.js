import React, { useState } from "react";

export default function SensorInput({ sensor, value, onChange, error }) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div className="relative">
      {/* Label row */}
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
          <span>{sensor.icon}</span>
          {sensor.label}
        </label>
        {/* Tooltip trigger */}
        <button
          type="button"
          onMouseEnter={() => setShowTip(true)}
          onMouseLeave={() => setShowTip(false)}
          onFocus={() => setShowTip(true)}
          onBlur={() => setShowTip(false)}
          className="w-4 h-4 rounded-full bg-stone-200 hover:bg-amber-500/30 text-stone-500 hover:text-amber-400 text-[10px] flex items-center justify-center transition-colors flex-shrink-0"
          aria-label={`Info about ${sensor.label}`}
        >
          ?
        </button>

        {/* Tooltip popover */}
        {showTip && (
          <div className="absolute right-0 top-6 z-50 w-64 bg-stone-100 border border-stone-300 rounded-xl p-3 shadow-xl text-xs text-stone-700 leading-relaxed">
            <p className="font-semibold text-amber-400 mb-1">{sensor.label}</p>
            {sensor.tooltip}
            <p className="mt-2 text-stone-400">
              Range: {sensor.min} – {sensor.max} {sensor.unit}
            </p>
          </div>
        )}
      </div>

      {/* Input + unit */}
      <div className="relative">
        <input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(sensor.key, e.target.value)}
          min={sensor.min}
          max={sensor.max}
          step={sensor.step}
          className={`w-full bg-stone-100 border ${
            error
              ? "border-red-500/70"
              : "border-stone-300 focus:border-amber-500/70"
          } rounded-lg px-3 py-2.5 text-sm text-stone-900 placeholder-gray-600 focus:outline-none focus:ring-1 ${
            error ? "focus:ring-red-500/30" : "focus:ring-amber-500/30"
          } transition-all pr-16`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-mono pointer-events-none">
          {sensor.unit}
        </span>
      </div>

      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}