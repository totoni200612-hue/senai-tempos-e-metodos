import { Study } from '../types';

const STORAGE_KEY = 'app_tempos_metodos_studies_v1';
const ACTIVE_STUDY_KEY = 'app_tempos_metodos_active_id_v1';

export const INITIAL_STUDIES: Study[] = [
  {
    id: 'study-seed-01',
    metadata: {
      id: 'study-seed-01',
      processName: 'Montagem de Conjunto Soldado',
      productCode: 'PRD-8840-A',
      sector: 'Estamparia e Solda',
      operation: 'Solda TIG manual do suporte lateral',
      operatorName: 'Carlos Eduardo Silva',
      analystName: 'Engª Beatriz Lima',
      date: new Date().toISOString().slice(0, 10),
      workstation: 'Posto de Trabalho W-04',
      notes: 'Operação executada com gabarito de fixação rápida. Ritmo contínuo sem interrupções críticas.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    cycles: [
      { id: 'c-1', cycleNumber: 1, durationSeconds: 42.5, timestamp: '10:05:12', excluded: false },
      { id: 'c-2', cycleNumber: 2, durationSeconds: 44.1, timestamp: '10:06:01', excluded: false },
      { id: 'c-3', cycleNumber: 3, durationSeconds: 43.8, timestamp: '10:06:50', excluded: false },
      { id: 'c-4', cycleNumber: 4, durationSeconds: 41.9, timestamp: '10:07:38', excluded: false },
      { id: 'c-5', cycleNumber: 5, durationSeconds: 45.0, timestamp: '10:08:29', excluded: false },
      { id: 'c-6', cycleNumber: 6, durationSeconds: 58.2, timestamp: '10:09:35', excluded: true, exclusionReason: 'Queda temporária de pressão no gabarito pneumático (descarte técnico)' },
      { id: 'c-7', cycleNumber: 7, durationSeconds: 43.2, timestamp: '10:10:24', excluded: false },
      { id: 'c-8', cycleNumber: 8, durationSeconds: 42.7, timestamp: '10:11:12', excluded: false },
      { id: 'c-9', cycleNumber: 9, durationSeconds: 43.5, timestamp: '10:12:02', excluded: false },
      { id: 'c-10', cycleNumber: 10, durationSeconds: 44.3, timestamp: '10:12:52', excluded: false },
    ],
    adjustments: {
      ratingPercentage: 105, // Operador com ritmo 105%
      allowancesPercentage: 14, // 14% tolerâncias totais
      allowanceBreakdown: {
        personalNeeds: 5,
        basicFatigue: 4,
        standingWork: 2,
        badPosture: 1,
        heavyEffort: 0,
        heatNoise: 2,
        mentalStrain: 0,
        specialDelays: 0,
      },
      shiftHours: 8.8,
      shiftEfficiencyPercentage: 90,
    },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'study-seed-02',
    metadata: {
      id: 'study-seed-02',
      processName: 'Montagem Final e Teste Funcional',
      productCode: 'ELX-302-B',
      sector: 'Montagem Eletrônica',
      operation: 'Inserção de chicote e teste em bancada ESD',
      operatorName: 'Mariana Ferreira',
      analystName: 'Téc. Rodrigo Santos',
      date: new Date().toISOString().slice(0, 10),
      workstation: 'Bancada de Testes B-02',
      notes: 'Utilização de pulseira antiestática e leitor ótico de QR Code.',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    cycles: [
      { id: 'c-101', cycleNumber: 1, durationSeconds: 28.4, timestamp: '14:20:10', excluded: false },
      { id: 'c-102', cycleNumber: 2, durationSeconds: 27.9, timestamp: '14:20:42', excluded: false },
      { id: 'c-103', cycleNumber: 3, durationSeconds: 29.1, timestamp: '14:21:15', excluded: false },
      { id: 'c-104', cycleNumber: 4, durationSeconds: 28.0, timestamp: '14:21:47', excluded: false },
      { id: 'c-105', cycleNumber: 5, durationSeconds: 27.5, timestamp: '14:22:18', excluded: false },
      { id: 'c-106', cycleNumber: 6, durationSeconds: 28.8, timestamp: '14:22:51', excluded: false },
      { id: 'c-107', cycleNumber: 7, durationSeconds: 28.2, timestamp: '14:23:23', excluded: false },
      { id: 'c-108', cycleNumber: 8, durationSeconds: 27.7, timestamp: '14:23:55', excluded: false },
    ],
    adjustments: {
      ratingPercentage: 100,
      allowancesPercentage: 12,
      allowanceBreakdown: {
        personalNeeds: 5,
        basicFatigue: 4,
        standingWork: 0,
        badPosture: 0,
        heavyEffort: 0,
        heatNoise: 0,
        mentalStrain: 3,
        specialDelays: 0,
      },
      shiftHours: 8.0,
      shiftEfficiencyPercentage: 95,
    },
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

export function getSavedStudies(): Study[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDIES));
      return INITIAL_STUDIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_STUDIES;
  } catch (err) {
    console.error('Erro ao ler estudos do localStorage:', err);
    return INITIAL_STUDIES;
  }
}

export function saveStudiesToStorage(studies: Study[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(studies));
  } catch (err) {
    console.error('Erro ao salvar estudos no localStorage:', err);
  }
}

export function getActiveStudyId(): string {
  try {
    const id = localStorage.getItem(ACTIVE_STUDY_KEY);
    if (id) return id;
  } catch {
    // fallback
  }
  return INITIAL_STUDIES[0].id;
}

export function setActiveStudyId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_STUDY_KEY, id);
  } catch {
    // fallback
  }
}

export function createNewStudy(): Study {
  const newId = `study-${Date.now()}`;
  const now = new Date().toISOString();
  return {
    id: newId,
    metadata: {
      id: newId,
      processName: 'Novo Processo Produtivo',
      productCode: 'PROD-001',
      sector: 'Usinagem / Produção',
      operation: 'Operação 01 - Cronometragem Inicial',
      operatorName: 'Operador Padrão',
      analystName: 'Analista de Tempos e Métodos',
      date: now.slice(0, 10),
      workstation: 'Posto 01',
      notes: '',
      createdAt: now,
      updatedAt: now,
    },
    cycles: [],
    adjustments: {
      ratingPercentage: 100,
      allowancesPercentage: 14,
      allowanceBreakdown: {
        personalNeeds: 5,
        basicFatigue: 4,
        standingWork: 2,
        badPosture: 1,
        heavyEffort: 0,
        heatNoise: 2,
        mentalStrain: 0,
        specialDelays: 0,
      },
      shiftHours: 8.8,
      shiftEfficiencyPercentage: 90,
    },
    createdAt: now,
    updatedAt: now,
  };
}
