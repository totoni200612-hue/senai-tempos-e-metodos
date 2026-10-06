import { AdjustmentFactors, CalculatedMetrics, Cycle } from '../types';

/**
 * Calculates industrial engineering metrics for time study
 */
export function calculateStudyMetrics(
  cycles: Cycle[],
  adjustments: AdjustmentFactors
): CalculatedMetrics {
  const validCycles = cycles.filter((c) => !c.excluded);
  const totalCycles = cycles.length;
  const validCyclesCount = validCycles.length;
  const excludedCyclesCount = totalCycles - validCyclesCount;

  if (validCyclesCount === 0) {
    return {
      totalCycles,
      validCyclesCount: 0,
      excludedCyclesCount,
      totalValidTimeSeconds: 0,
      averageTimeSeconds: 0,
      minTimeSeconds: 0,
      maxTimeSeconds: 0,
      rangeSeconds: 0,
      standardDeviation: 0,
      varianceCoefficient: 0,
      recommendedSampleSize: 0,
      normalTimeSeconds: 0,
      standardTimeSeconds: 0,
      piecesPerHour: 0,
      piecesPerShift: 0,
      efficiencyRatingLabel: getRatingLabel(adjustments.ratingPercentage),
    };
  }

  const times = validCycles.map((c) => c.durationSeconds);
  const totalValidTimeSeconds = times.reduce((acc, curr) => acc + curr, 0);
  const averageTimeSeconds = totalValidTimeSeconds / validCyclesCount;

  const minTimeSeconds = Math.min(...times);
  const maxTimeSeconds = Math.max(...times);
  const rangeSeconds = maxTimeSeconds - minTimeSeconds;

  // Sample standard deviation (s)
  let standardDeviation = 0;
  if (validCyclesCount > 1) {
    const variance =
      times.reduce((acc, t) => acc + Math.pow(t - averageTimeSeconds, 2), 0) /
      (validCyclesCount - 1);
    standardDeviation = Math.sqrt(variance);
  }

  // Variance coefficient CV (%)
  const varianceCoefficient =
    averageTimeSeconds > 0 ? (standardDeviation / averageTimeSeconds) * 100 : 0;

  // Recommended sample size (Formula OIT: z=2 for 95% confidence, e=0.05 (5% error margin))
  // N = ( (2 * s) / (0.05 * TM) )^2 = ( (40 * s) / TM )^2
  let recommendedSampleSize = 1;
  if (averageTimeSeconds > 0 && standardDeviation > 0) {
    const nCalc = Math.pow((40 * standardDeviation) / averageTimeSeconds, 2);
    recommendedSampleSize = Math.max(1, Math.ceil(nCalc));
  } else {
    recommendedSampleSize = Math.max(1, validCyclesCount);
  }

  // Normal Time = TM * (Rating / 100)
  const ratingFactor = adjustments.ratingPercentage / 100;
  const normalTimeSeconds = averageTimeSeconds * ratingFactor;

  // Standard Time = TN * (1 + Allowances / 100)
  const allowanceFactor = 1 + adjustments.allowancesPercentage / 100;
  const standardTimeSeconds = normalTimeSeconds * allowanceFactor;

  // Pieces per hour = 3600 / Standard Time
  const piecesPerHour =
    standardTimeSeconds > 0 ? 3600 / standardTimeSeconds : 0;

  // Pieces per shift
  const shiftEfficiencyFactor =
    (adjustments.shiftEfficiencyPercentage || 100) / 100;
  const shiftSeconds = (adjustments.shiftHours || 8.8) * 3600;
  const piecesPerShift =
    standardTimeSeconds > 0
      ? (shiftSeconds / standardTimeSeconds) * shiftEfficiencyFactor
      : 0;

  return {
    totalCycles,
    validCyclesCount,
    excludedCyclesCount,
    totalValidTimeSeconds,
    averageTimeSeconds,
    minTimeSeconds,
    maxTimeSeconds,
    rangeSeconds,
    standardDeviation,
    varianceCoefficient,
    recommendedSampleSize,
    normalTimeSeconds,
    standardTimeSeconds,
    piecesPerHour,
    piecesPerShift,
    efficiencyRatingLabel: getRatingLabel(adjustments.ratingPercentage),
  };
}

export function getRatingLabel(rating: number): string {
  if (rating < 85) return 'Ritmo Lento / Abaixo do Padrão';
  if (rating < 95) return 'Ritmo Moderado';
  if (rating <= 105) return 'Ritmo Normal (100%)';
  if (rating <= 115) return 'Ritmo Rápido / Bom Desempenho';
  return 'Ritmo Muito Rápido / Alto Rendimento';
}

/**
 * Formats seconds into MM:SS.cc (centiseconds)
 */
export function formatTimeMMSSCC(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00.00';
  const mins = Math.floor(seconds / 60);
  const remainingSecs = seconds % 60;
  const wholeSecs = Math.floor(remainingSecs);
  const centiseconds = Math.floor((remainingSecs - wholeSecs) * 100);

  const mm = String(mins).padStart(2, '0');
  const ss = String(wholeSecs).padStart(2, '0');
  const cc = String(centiseconds).padStart(2, '0');

  return `${mm}:${ss}.${cc}`;
}

/**
 * Formats seconds with 2 decimals (e.g. 14.52s)
 */
export function formatSeconds(seconds: number, decimals: number = 2): string {
  if (isNaN(seconds) || seconds < 0) return `0.${'0'.repeat(decimals)}s`;
  return `${seconds.toFixed(decimals)}s`;
}

/**
 * Converts decimal seconds to decimal minutes (common in automotive & lean engineering, e.g., 0.450 min)
 */
export function formatDecimalMinutes(seconds: number): string {
  const mins = seconds / 60;
  return `${mins.toFixed(3)} min`;
}

/**
 * Parse manual input: either raw seconds (e.g. "45.2") or mm:ss ("1:15" or "01:15.20")
 */
export function parseTimeStringToSeconds(input: string): number | null {
  const clean = input.trim().replace(',', '.');
  if (!clean) return null;

  if (clean.includes(':')) {
    const parts = clean.split(':');
    if (parts.length === 2) {
      const minutes = parseFloat(parts[0]);
      const seconds = parseFloat(parts[1]);
      if (!isNaN(minutes) && !isNaN(seconds) && minutes >= 0 && seconds >= 0) {
        return minutes * 60 + seconds;
      }
    }
  }

  const numeric = parseFloat(clean);
  if (!isNaN(numeric) && numeric > 0) {
    return numeric;
  }
  return null;
}

/**
 * Computes upper and lower control limits (LSC & LIC)
 */
export function getControlLimits(average: number, stdDev: number) {
  const ucl = average + 3 * stdDev;
  const lcl = Math.max(0, average - 3 * stdDev);
  return { ucl, lcl };
}
