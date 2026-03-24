import React from "react";
import { RISK_CONFIG } from "../services/sensorMeta";

/**
 * SVG arc-based health score gauge.
 * score: 0–100
 */
export default function HealthGauge({ score, riskLevel, size = 200 }) {
  const cfg = RISK_CONFIG[riskLevel] || RISK_CONFIG["Healthy"];
  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) * 0.72;
  const strokeW = size * 0.075;

  // Arc from -210° to 30° (240° sweep), start at bottom-left
  const startAngle = -210;
  const sweep = 240;
  const endAngle = startAngle + sweep;
  const fillAngle = startAngle + (sweep * score) / 100;

  function polarToXY(angleDeg, radius) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function arcPath(fromDeg, toDeg, radius) {
    const start = polarToXY(fromDeg, radius);
    const end = polarToXY(toDeg, radius);
    const large = toDeg - fromDeg > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${large} 1 ${end.x} ${end.y}`;
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background track */}
        <path
          d={arcPath(startAngle, endAngle, r)}
          fill="none"
          stroke="#1f2937"
          strokeWidth={strokeW}
          strokeLinecap="round"
        />
        {/* Colored fill */}
        {score > 0 && (
          <path
            d={arcPath(startAngle, fillAngle, r)}
            fill="none"
            stroke={cfg.color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${cfg.color}80)`,
              transition: "all 1s ease-in-out",
            }}
          />
        )}
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = startAngle + (sweep * tick) / 100;
          const outer = polarToXY(angle, r + strokeW / 2 + 4);
          const inner = polarToXY(angle, r - strokeW / 2 - 4);
          return (
            <line
              key={tick}
              x1={outer.x} y1={outer.y}
              x2={inner.x} y2={inner.y}
              stroke="#374151"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-black leading-none"
          style={{ color: cfg.color, fontSize: size * 0.2 }}
        >
          {Math.round(score)}
        </span>
        <span className="text-stone-500 font-medium" style={{ fontSize: size * 0.065 }}>
          / 100
        </span>
        <span
          className="font-bold mt-1 px-2 py-0.5 rounded-full text-gray-950"
          style={{ backgroundColor: cfg.color, fontSize: size * 0.058 }}
        >
          {riskLevel}
        </span>
      </div>
    </div>
  );
}
