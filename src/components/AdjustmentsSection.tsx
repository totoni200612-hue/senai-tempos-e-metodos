import React, { useState } from 'react';
import { AdjustmentFactors, AllowanceBreakdown } from '../types';
import { Sliders, Calculator, Check, Info } from 'lucide-react';

interface Props {
  adjustments: AdjustmentFactors;
  averageTime: number;
  onUpdateAdjustments: (newAdjustments: AdjustmentFactors) => void;
}

const DEFAULT_BREAKDOWN: AllowanceBreakdown = {
  personalNeeds: 5,
  basicFatigue: 4,
  standingWork: 2,
  badPosture: 1,
  heavyEffort: 0,
  heatNoise: 2,
  mentalStrain: 0,
  specialDelays: 0,
};

export const AdjustmentsSection: React.FC<Props> = ({
  adjustments,
  averageTime,
  onUpdateAdjustments,
}) => {
  const [showOITCalculator, setShowOITCalculator] = useState(false);
  const [breakdown, setBreakdown] = useState<AllowanceBreakdown>(
    adjustments.allowanceBreakdown || DEFAULT_BREAKDOWN
  );

  const normalTime = averageTime * (adjustments.ratingPercentage / 100);
  const standardTime = normalTime * (1 + adjustments.allowancesPercentage / 100);

  const handleRatingChange = (rating: number) => {
    onUpdateAdjustments({
      ...adjustments,
      ratingPercentage: rating,
    });
  };

  const handleAllowanceChange = (allowance: number) => {
    onUpdateAdjustments({
      ...adjustments,
      allowancesPercentage: Math.max(0, allowance),
    });
  };

  const handleBreakdownChange = (key: keyof AllowanceBreakdown, value: number) => {
    const next = { ...breakdown, [key]: Math.max(0, value) };
    setBreakdown(next);
    const sum = Object.values(next).reduce((acc, v) => acc + v, 0);
    onUpdateAdjustments({
      ...adjustments,
      allowancesPercentage: sum,
      allowanceBreakdown: next,
    });
  };

  const handleShiftHoursChange = (hours: number) => {
    onUpdateAdjustments({
      ...adjustments,
      shiftHours: Math.max(1, hours),
    });
  };

  const handleEfficiencyChange = (eff: number) => {
    onUpdateAdjustments({
      ...adjustments,
      shiftEfficiencyPercentage: Math.min(100, Math.max(10, eff)),
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Fatores de Ajuste & Engenharia
          </h3>
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Ritmo (Desempenho) · Tolerâncias OIT · Parâmetros de Turno
        </span>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* 1. Ritmo / Desempenho do Operador */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Ritmo / Desempenho do Operador
                </label>
                <span className="font-mono font-bold text-lg text-sky-700">
                  {adjustments.ratingPercentage}%
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Avaliação da velocidade e método do operador segundo o padrão OIT (100% = ritmo normal e sustentável).
              </p>

              {/* Slider */}
              <input
                type="range"
                min="70"
                max="130"
                step="5"
                value={adjustments.ratingPercentage}
                onChange={(e) => handleRatingChange(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />

              {/* Botões rápidos */}
              <div className="grid grid-cols-5 gap-1.5 mt-3">
                {[80, 90, 100, 110, 120].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => handleRatingChange(rate)}
                    className={`py-1 text-xs font-semibold rounded border cursor-pointer transition-colors ${
                      adjustments.ratingPercentage === rate
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            {/* Cálculo de Tempo Normal */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600">Tempo Normal (TN = TM × {adjustments.ratingPercentage}%):</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {normalTime.toFixed(2)}s
              </span>
            </div>
          </div>

          {/* 2. Tolerâncias e Suplementos */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Tolerâncias & Suplementos (Fadiga/Pessoais)
                </label>
                <span className="font-mono font-bold text-lg text-sky-700">
                  +{adjustments.allowancesPercentage}%
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Acréscimo percentual para fadiga física, necessidades fisiológicas e esperas inevitáveis de fábrica.
              </p>

              {/* Input direto & Botão Calculadora OIT */}
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    step="1"
                    value={adjustments.allowancesPercentage}
                    onChange={(e) => handleAllowanceChange(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <span className="absolute right-3 top-2 text-xs font-mono text-slate-400">%</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowOITCalculator(!showOITCalculator)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                    showOITCalculator
                      ? 'bg-sky-100 text-sky-800 border-sky-300'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Calculadora OIT</span>
                </button>
              </div>

              {/* Sugestões padrão industriais */}
              <div className="flex items-center gap-1.5">
                {[10, 12, 14, 15, 18].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleAllowanceChange(pct)}
                    className={`flex-1 py-1 text-[11px] font-semibold rounded border cursor-pointer transition-colors ${
                      adjustments.allowancesPercentage === pct
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Cálculo de Tempo Padrão */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600">Tempo Padrão (TP = TN × {1 + adjustments.allowancesPercentage / 100}):</span>
              <span className="font-mono font-bold text-sky-900 text-sm">
                {standardTime.toFixed(2)}s
              </span>
            </div>
          </div>

        </div>

        {/* Calculadora Detalhada OIT (Colapsável) */}
        {showOITCalculator && (
          <div className="p-4 bg-sky-50/50 border border-sky-200 rounded-xl space-y-3 transition-all">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-sky-700" />
                Matriz de Tolerâncias e Suplementos (Norma OIT)
              </h4>
              <span className="text-xs font-mono font-bold text-sky-900">
                Soma: {adjustments.allowancesPercentage}%
              </span>
            </div>
            <p className="text-xs text-sky-800">
              Ajuste cada componente de esforço, ergonomia e ambiente de trabalho da fábrica:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Necessidades Pessoais */}
              <div className="bg-white p-2.5 rounded-lg border border-sky-200">
                <label className="font-semibold text-slate-800 block mb-1">Necessidades Pessoais (OIT)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="10"
                    value={breakdown.personalNeeds}
                    onChange={(e) => handleBreakdownChange('personalNeeds', Number(e.target.value))}
                    className="w-16 p-1 border rounded font-mono text-center"
                  />
                  <span className="text-slate-500 text-[11px]">% (mín 5%)</span>
                </div>
              </div>

              {/* Fadiga Básica */}
              <div className="bg-white p-2.5 rounded-lg border border-sky-200">
                <label className="font-semibold text-slate-800 block mb-1">Fadiga Básica</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="4"
                    max="8"
                    value={breakdown.basicFatigue}
                    onChange={(e) => handleBreakdownChange('basicFatigue', Number(e.target.value))}
                    className="w-16 p-1 border rounded font-mono text-center"
                  />
                  <span className="text-slate-500 text-[11px]">% (mín 4%)</span>
                </div>
              </div>

              {/* Trabalho em Pé */}
              <div className="bg-white p-2.5 rounded-lg border border-sky-200">
                <label className="font-semibold text-slate-800 block mb-1">Trabalho em Pé</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="6"
                    value={breakdown.standingWork}
                    onChange={(e) => handleBreakdownChange('standingWork', Number(e.target.value))}
                    className="w-16 p-1 border rounded font-mono text-center"
                  />
                  <span className="text-slate-500 text-[11px]">% (0 a 4%)</span>
                </div>
              </div>

              {/* Postura Incômoda */}
              <div className="bg-white p-2.5 rounded-lg border border-sky-200">
                <label className="font-semibold text-slate-800 block mb-1">Postura Desconfortável</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="8"
                    value={breakdown.badPosture}
                    onChange={(e) => handleBreakdownChange('badPosture', Number(e.target.value))}
                    className="w-16 p-1 border rounded font-mono text-center"
                  />
                  <span className="text-slate-500 text-[11px]">% (0 a 7%)</span>
                </div>
              </div>

              {/* Esforço Muscular */}
              <div className="bg-white p-2.5 rounded-lg border border-sky-200">
                <label className="font-semibold text-slate-800 block mb-1">Peso / Esforço Físico</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={breakdown.heavyEffort}
                    onChange={(e) => handleBreakdownChange('heavyEffort', Number(e.target.value))}
                    className="w-16 p-1 border rounded font-mono text-center"
                  />
                  <span className="text-slate-500 text-[11px]">% (carga/força)</span>
                </div>
              </div>

              {/* Calor, Ruído e Ventilação */}
              <div className="bg-white p-2.5 rounded-lg border border-sky-200">
                <label className="font-semibold text-slate-800 block mb-1">Calor / Ruído / Ambiente</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={breakdown.heatNoise}
                    onChange={(e) => handleBreakdownChange('heatNoise', Number(e.target.value))}
                    className="w-16 p-1 border rounded font-mono text-center"
                  />
                  <span className="text-slate-500 text-[11px]">%</span>
                </div>
              </div>

              {/* Tensão Mental */}
              <div className="bg-white p-2.5 rounded-lg border border-sky-200">
                <label className="font-semibold text-slate-800 block mb-1">Tensão Mental / Precisão</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="8"
                    value={breakdown.mentalStrain}
                    onChange={(e) => handleBreakdownChange('mentalStrain', Number(e.target.value))}
                    className="w-16 p-1 border rounded font-mono text-center"
                  />
                  <span className="text-slate-500 text-[11px]">%</span>
                </div>
              </div>

              {/* Esperas Inevitáveis */}
              <div className="bg-white p-2.5 rounded-lg border border-sky-200">
                <label className="font-semibold text-slate-800 block mb-1">Esperas do Processo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={breakdown.specialDelays}
                    onChange={(e) => handleBreakdownChange('specialDelays', Number(e.target.value))}
                    className="w-16 p-1 border rounded font-mono text-center"
                  />
                  <span className="text-slate-500 text-[11px]">%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Parâmetros de Turno & Capacidade */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Duração do Turno:</span>
              <input
                type="number"
                min="4"
                max="12"
                step="0.1"
                value={adjustments.shiftHours}
                onChange={(e) => handleShiftHoursChange(parseFloat(e.target.value) || 8)}
                className="w-18 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono text-slate-900"
              />
              <span className="text-xs text-slate-500">horas</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Eficiência Esperada:</span>
              <input
                type="number"
                min="50"
                max="100"
                step="5"
                value={adjustments.shiftEfficiencyPercentage}
                onChange={(e) => handleEfficiencyChange(parseFloat(e.target.value) || 90)}
                className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono text-slate-900"
              />
              <span className="text-xs text-slate-500">%</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Fórmula: TP = (TM × Ritmo%) × (1 + Tolerâncias%)</span>
          </div>
        </div>

      </div>
    </div>
  );
};
