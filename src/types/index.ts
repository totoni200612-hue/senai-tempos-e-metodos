export interface Cycle {
  id: string;
  cycleNumber: number;
  durationSeconds: number; // in seconds, with decimal precision (e.g. 45.32)
  timestamp: string; // ISO string or time string
  excluded: boolean; // whether discarded from statistical calculations
  exclusionReason?: string;
  notes?: string;
}

export interface StudyMetadata {
  id: string;
  processName: string; // Nome do processo
  productCode: string; // Código do produto
  sector: string; // Setor
  operation: string; // Operação analisada
  operatorName: string; // Nome do operador
  analystName: string; // Nome do cronometrista / analista
  date: string; // Data do estudo (YYYY-MM-DD)
  workstation: string; // Posto de trabalho / Máquina
  notes: string; // Observações gerais
  createdAt: string;
  updatedAt: string;
}

export interface AllowanceBreakdown {
  personalNeeds: number; // Necessidades pessoais (default 5%)
  basicFatigue: number; // Fadiga básica (default 4%)
  standingWork: number; // Trabalho em pé (0% a 4%)
  badPosture: number; // Postura incômoda (0% a 7%)
  heavyEffort: number; // Esforço muscular / peso (0% a 20%)
  heatNoise: number; // Calor, ruído e poeira (0% a 10%)
  mentalStrain: number; // Tensão mental / precisão (0% a 8%)
  specialDelays: number; // Espera inevitável da máquina (0% a 10%)
}

export interface AdjustmentFactors {
  ratingPercentage: number; // Ritmo / Desempenho do operador (100% = normal)
  allowancesPercentage: number; // Tolerâncias totais em % (ex: 15%)
  allowanceBreakdown?: AllowanceBreakdown;
  shiftHours: number; // Horas por turno (ex: 8.8h ou 8h)
  shiftEfficiencyPercentage: number; // Eficiência planejada (ex: 90% ou 100%)
}

export interface CalculatedMetrics {
  totalCycles: number;
  validCyclesCount: number;
  excludedCyclesCount: number;
  totalValidTimeSeconds: number;
  averageTimeSeconds: number; // TM - Tempo Médio
  minTimeSeconds: number; // Menor tempo
  maxTimeSeconds: number; // Maior tempo
  rangeSeconds: number; // Amplitude (Máx - Mín)
  standardDeviation: number; // Desvio padrão
  varianceCoefficient: number; // Coeficiente de Variação (%)
  recommendedSampleSize: number; // Tamanho amostral estatístico recomendado (OIT)
  normalTimeSeconds: number; // TN = TM * (Ritmo / 100)
  standardTimeSeconds: number; // TP = TN * (1 + Tolerâncias / 100)
  piecesPerHour: number; // 3600 / TP
  piecesPerShift: number; // Peças por turno planejado
  efficiencyRatingLabel: string;
}

export interface Study {
  id: string;
  metadata: StudyMetadata;
  cycles: Cycle[];
  adjustments: AdjustmentFactors;
  createdAt: string;
  updatedAt: string;
}
