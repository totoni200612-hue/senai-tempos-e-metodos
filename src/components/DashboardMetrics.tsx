import React from 'react';
import { CalculatedMetrics, AdjustmentFactors } from '../types';
import { formatSeconds, formatDecimalMinutes } from '../utils/calculations';
import { 
  Clock, 
  Target, 
  Layers, 
  Zap, 
  TrendingUp, 
  ArrowDownRight, 
  ArrowUpRight, 
  Gauge, 
  CalendarClock 
} from 'lucide-react';

interface Props {
  metrics: CalculatedMetrics;
  adjustments: AdjustmentFactors;
  onOpenAdjustments: () => void;
}

export const DashboardMetrics: React.FC<Props> = ({
  metrics,
  adjustments,
  onOpenAdjustments,
}) => {
  return (
    <div className="space-y-4">
      {/* 4 Indicadores Principais solicitados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Tempo Médio */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 relative overflow-hidden transition-all hover:border-slate-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold tracking-wider text-slate-700 uppercase">
              Tempo Médio (TM)
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">
              {metrics.averageTimeSeconds > 0 ? metrics.averageTimeSeconds.toFixed(2) : '0.00'}
            </span>
            <span className="text-sm font-medium text-slate-700">segundos</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Equivalente:</span>
            <span className="font-mono font-medium text-slate-800">
              {formatDecimalMinutes(metrics.averageTimeSeconds)}
            </span>
          </div>
        </div>

        {/* 2. Tempo Padrão */}
        <div className="bg-sky-50/70 rounded-xl border border-sky-300 shadow-xs p-5 relative overflow-hidden transition-all hover:border-sky-400">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold tracking-wider text-sky-950 uppercase">
              Tempo Padrão (TP)
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-xs">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tracking-tight text-sky-950">
              {metrics.standardTimeSeconds > 0 ? metrics.standardTimeSeconds.toFixed(2) : '0.00'}
            </span>
            <span className="text-sm font-medium text-sky-800">segundos</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-sky-200/60 flex items-center justify-between text-xs text-sky-900">
            <span>Ritmo: {adjustments.ratingPercentage}% · Tol: +{adjustments.allowancesPercentage}%</span>
            <button
              onClick={onOpenAdjustments}
              className="font-medium text-sky-700 hover:text-sky-900 hover:underline cursor-pointer"
            >
              Ajustar
            </button>
          </div>
        </div>

        {/* 3. Peças por Hora */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 relative overflow-hidden transition-all hover:border-slate-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold tracking-wider text-slate-700 uppercase">
              Capacidade / Peças por Hora
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">
              {metrics.piecesPerHour > 0 ? Math.floor(metrics.piecesPerHour) : 0}
            </span>
            <span className="text-sm font-medium text-slate-700">pçs / hora</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Ritmo Teórico:</span>
            <span className="font-mono font-medium text-slate-800">
              {metrics.piecesPerHour > 0 ? metrics.piecesPerHour.toFixed(1) : '0.0'} pç/h
            </span>
          </div>
        </div>

        {/* 4. Quantidade de Ciclos */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 relative overflow-hidden transition-all hover:border-slate-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold tracking-wider text-slate-700 uppercase">
              Ciclos Registrados
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">
              {metrics.validCyclesCount}
            </span>
            <span className="text-sm font-medium text-slate-700">
              {metrics.excludedCyclesCount > 0
                ? `de ${metrics.totalCycles} (${metrics.excludedCyclesCount} descartado${metrics.excludedCyclesCount > 1 ? 's' : ''})`
                : 'ciclos válidos'}
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Amostra OIT ideal:</span>
            <span className="font-mono font-medium text-slate-800">
              {metrics.recommendedSampleSize} ciclos
            </span>
          </div>
        </div>

      </div>

      {/* Indicadores complementares de Engenharia de Tempos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Menor Tempo */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-700 mb-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
            <span>Menor Tempo</span>
          </div>
          <div className="font-mono font-semibold text-slate-800 text-sm">
            {formatSeconds(metrics.minTimeSeconds)}
          </div>
        </div>

        {/* Maior Tempo */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-700 mb-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
            <span>Maior Tempo</span>
          </div>
          <div className="font-mono font-semibold text-slate-800 text-sm">
            {formatSeconds(metrics.maxTimeSeconds)}
          </div>
        </div>

        {/* Desvio Padrão */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-700 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
            <span>Desvio Padrão (s)</span>
          </div>
          <div className="font-mono font-semibold text-slate-800 text-sm">
            ±{metrics.standardDeviation.toFixed(2)}s
          </div>
        </div>

        {/* Coeficiente de Variação (CV) */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-700 mb-1">
            <Gauge className="w-3.5 h-3.5 text-purple-600" />
            <span>Variabilidade (CV)</span>
          </div>
          <div className="font-mono font-semibold text-slate-800 text-sm">
            {metrics.varianceCoefficient.toFixed(1)}%
            <span className="text-[10px] text-slate-600 font-sans ml-1">
              {metrics.varianceCoefficient < 10 ? '(Estável)' : metrics.varianceCoefficient < 20 ? '(Moderado)' : '(Alto)'}
            </span>
          </div>
        </div>

        {/* Tempo Normal */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-700 mb-1">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tempo Normal (TN)</span>
          </div>
          <div className="font-mono font-semibold text-slate-800 text-sm">
            {formatSeconds(metrics.normalTimeSeconds)}
          </div>
        </div>

        {/* Peças por Turno */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-700 mb-1">
            <CalendarClock className="w-3.5 h-3.5 text-teal-600" />
            <span>Peças / Turno</span>
          </div>
          <div className="font-mono font-semibold text-slate-800 text-sm">
            {Math.floor(metrics.piecesPerShift)} pçs
            <span className="text-[10px] text-slate-600 font-sans ml-1">
              ({adjustments.shiftHours}h)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
