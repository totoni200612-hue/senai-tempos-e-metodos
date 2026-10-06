import React, { useState } from 'react';
import { Cycle, CalculatedMetrics } from '../types';
import { formatSeconds, getControlLimits } from '../utils/calculations';
import { BarChart3, LineChart, Activity, AlertCircle } from 'lucide-react';

interface Props {
  cycles: Cycle[];
  metrics: CalculatedMetrics;
}

export const ChartsSection: React.FC<Props> = ({ cycles, metrics }) => {
  const [activeTab, setActiveTab] = useState<'run' | 'delta'>('run');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (cycles.length < 2) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Gráficos de Comportamento do Processo
        </h4>
        <p className="text-xs text-slate-500 mt-1">
          Registre pelo menos 2 ciclos para visualizar a carta de controle e a dispersão temporal.
        </p>
      </div>
    );
  }

  const { ucl, lcl } = getControlLimits(metrics.averageTimeSeconds, metrics.standardDeviation);

  // SVG dimensions
  const width = 800;
  const height = 260;
  const padding = { top: 25, right: 30, bottom: 35, left: 55 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Min and max for Y scale (with margin)
  const allValues = cycles.map((c) => c.durationSeconds);
  const minVal = Math.max(0, Math.min(...allValues, lcl) * 0.9);
  const maxVal = Math.max(...allValues, ucl, metrics.standardTimeSeconds) * 1.08;
  const rangeVal = maxVal - minVal || 1;

  const getY = (val: number) => {
    return padding.top + chartH - ((val - minVal) / rangeVal) * chartH;
  };

  const getX = (index: number) => {
    if (cycles.length <= 1) return padding.left + chartW / 2;
    return padding.left + (index / (cycles.length - 1)) * chartW;
  };

  // Points for line
  const points = cycles.map((c, i) => `${getX(i)},${getY(c.durationSeconds)}`).join(' ');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Tab bar */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Análise Gráfica dos Tempos de Ciclo
          </h3>
        </div>

        {/* Segmented control */}
        <div className="flex items-center p-1 bg-slate-200/70 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('run')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'run'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Carta de Controle (LSC / LIC)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('delta')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'delta'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Desvio vs Média (Delta)</span>
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* Run Chart (Carta de Controle de Tempos) */}
        {activeTab === 'run' && (
          <div>
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 mb-2 gap-3">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-sky-600 inline-block" />
                  <strong className="text-slate-800">Tempo do Ciclo</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-emerald-500 inline-block border-t border-dashed" />
                  <span>TM (Média): {formatSeconds(metrics.averageTimeSeconds)}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-indigo-500 inline-block" />
                  <span>TP (Padrão): {formatSeconds(metrics.standardTimeSeconds)}</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-3 h-0.5 bg-rose-400 inline-block" />
                  <span>Limites ±3σ: LSC {formatSeconds(ucl)} / LIC {formatSeconds(lcl)}</span>
                </span>
              </div>
            </div>

            {/* SVG responsive container */}
            <div className="relative w-full overflow-x-auto">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[550px] font-mono text-[10px]">
                {/* Horizontal reference grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const val = minVal + ratio * rangeVal;
                  const y = getY(val);
                  return (
                    <g key={ratio}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={width - padding.right}
                        y2={y}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                      <text
                        x={padding.left - 8}
                        y={y + 3}
                        textAnchor="end"
                        fill="#94a3b8"
                        fontSize="9"
                      >
                        {val.toFixed(1)}s
                      </text>
                    </g>
                  );
                })}

                {/* Upper control limit line (LSC) */}
                <line
                  x1={padding.left}
                  y1={getY(ucl)}
                  x2={width - padding.right}
                  y2={getY(ucl)}
                  stroke="#fb7185"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />

                {/* Lower control limit line (LIC) */}
                {lcl > 0 && (
                  <line
                    x1={padding.left}
                    y1={getY(lcl)}
                    x2={width - padding.right}
                    y2={getY(lcl)}
                    stroke="#fb7185"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Standard Time Line (TP) */}
                {metrics.standardTimeSeconds > 0 && (
                  <line
                    x1={padding.left}
                    y1={getY(metrics.standardTimeSeconds)}
                    x2={width - padding.right}
                    y2={getY(metrics.standardTimeSeconds)}
                    stroke="#6366f1"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Average line (TM) */}
                {metrics.averageTimeSeconds > 0 && (
                  <line
                    x1={padding.left}
                    y1={getY(metrics.averageTimeSeconds)}
                    x2={width - padding.right}
                    y2={getY(metrics.averageTimeSeconds)}
                    stroke="#10b981"
                    strokeWidth="1.5"
                  />
                )}

                {/* Connecting Polyline */}
                <polyline
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />

                {/* Data Points */}
                {cycles.map((c, i) => {
                  const cx = getX(i);
                  const cy = getY(c.durationSeconds);
                  const isHovered = hoveredIndex === i;
                  const isExcluded = c.excluded;

                  return (
                    <g
                      key={c.id}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Outer pulse if hovered */}
                      {isHovered && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r="9"
                          fill="#38bdf8"
                          fillOpacity="0.25"
                        />
                      )}

                      {/* Main point */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isHovered ? 5.5 : 4}
                        fill={isExcluded ? '#f59e0b' : '#0284c7'}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />

                      {/* X axis labels (Cycle #) */}
                      <text
                        x={cx}
                        y={height - 12}
                        textAnchor="middle"
                        fill="#64748b"
                        fontSize="9"
                      >
                        #{c.cycleNumber}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Hover tooltip card */}
            {hoveredIndex !== null && cycles[hoveredIndex] && (
              <div className="mt-2 p-2 bg-slate-900 text-white rounded-lg text-xs font-mono flex items-center justify-between">
                <span>
                  Ciclo #{cycles[hoveredIndex].cycleNumber}:{' '}
                  <strong className="text-sky-400">
                    {formatSeconds(cycles[hoveredIndex].durationSeconds)}
                  </strong>
                </span>
                <span className="text-slate-300">
                  {cycles[hoveredIndex].excluded ? (
                    <span className="text-amber-400">Descartado da Análise</span>
                  ) : (
                    `Desvio da média: ${(
                      cycles[hoveredIndex].durationSeconds - metrics.averageTimeSeconds
                    ).toFixed(2)}s`
                  )}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Delta Bar Chart */}
        {activeTab === 'delta' && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
              <span>Desvio individual de cada ciclo em relação ao Tempo Médio ({formatSeconds(metrics.averageTimeSeconds)}):</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-2 h-2 rounded bg-emerald-500 inline-block" /> Abaixo da média (mais rápido)
                </span>
                <span className="flex items-center gap-1 text-amber-600">
                  <span className="w-2 h-2 rounded bg-amber-500 inline-block" /> Acima da média (mais lento)
                </span>
              </div>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {cycles.map((c) => {
                const diff = c.durationSeconds - metrics.averageTimeSeconds;
                const isFaster = diff < 0;
                const maxDiff = Math.max(
                  ...cycles.map((x) => Math.abs(x.durationSeconds - metrics.averageTimeSeconds)),
                  0.5
                );
                const barWidthPct = Math.min(100, (Math.abs(diff) / maxDiff) * 100);

                return (
                  <div key={c.id} className="flex items-center gap-3 text-xs font-mono">
                    <span className="w-14 text-slate-500 font-semibold">#{c.cycleNumber}</span>
                    <span className="w-16 text-slate-800 font-medium">
                      {c.durationSeconds.toFixed(2)}s
                    </span>

                    {/* Dual directional bar */}
                    <div className="flex-1 h-5 bg-slate-100 rounded flex items-center relative overflow-hidden">
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300 z-10" />
                      {isFaster ? (
                        <div
                          className="h-full bg-emerald-500 rounded-l transition-all ml-auto mr-[50%]"
                          style={{ width: `${barWidthPct / 2}%` }}
                        />
                      ) : (
                        <div
                          className="h-full bg-amber-500 rounded-r transition-all ml-[50%]"
                          style={{ width: `${barWidthPct / 2}%` }}
                        />
                      )}
                    </div>

                    <span
                      className={`w-20 text-right font-medium ${
                        isFaster ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {diff > 0 ? `+${diff.toFixed(2)}s` : `${diff.toFixed(2)}s`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
