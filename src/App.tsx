/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Study, 
  Cycle, 
  StudyMetadata, 
  AdjustmentFactors 
} from './types';
import { 
  getSavedStudies, 
  saveStudiesToStorage, 
  getActiveStudyId, 
  setActiveStudyId, 
  createNewStudy 
} from './utils/storage';
import { calculateStudyMetrics } from './utils/calculations';
import { Header } from './components/Header';
import { DashboardMetrics } from './components/DashboardMetrics';
import { StopwatchSection } from './components/StopwatchSection';
import { CyclesTable } from './components/CyclesTable';
import { AdjustmentsSection } from './components/AdjustmentsSection';
import { ChartsSection } from './components/ChartsSection';
import { StudyMetadataModal } from './components/StudyMetadataModal';
import { HistoryModal } from './components/HistoryModal';
import { ReportModal } from './components/ReportModal';
import { MethodologyModal } from './components/MethodologyModal';

export default function App() {
  const [studies, setStudies] = useState<Study[]>(() => getSavedStudies());
  const [activeStudyId, setCurrentActiveStudyId] = useState<string>(() => {
    const saved = getActiveStudyId();
    const initialList = getSavedStudies();
    if (initialList.some((s) => s.id === saved)) return saved;
    return initialList[0]?.id || 'study-default';
  });

  // Modals state
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isMethodologyModalOpen, setIsMethodologyModalOpen] = useState(false);

  // Active study object
  const activeStudy = useMemo(() => {
    const found = studies.find((s) => s.id === activeStudyId);
    if (found) return found;
    if (studies.length > 0) return studies[0];
    const brandNew = createNewStudy();
    return brandNew;
  }, [studies, activeStudyId]);

  // Persist studies to storage whenever they change
  useEffect(() => {
    saveStudiesToStorage(studies);
  }, [studies]);

  // Persist active ID
  useEffect(() => {
    setActiveStudyId(activeStudyId);
  }, [activeStudyId]);

  // Metrics for active study
  const metrics = useMemo(() => {
    return calculateStudyMetrics(activeStudy.cycles, activeStudy.adjustments);
  }, [activeStudy.cycles, activeStudy.adjustments]);

  // Update active study helper
  const updateCurrentStudy = (updater: (prev: Study) => Study) => {
    setStudies((prevList) =>
      prevList.map((study) => {
        if (study.id === activeStudy.id) {
          return updater(study);
        }
        return study;
      })
    );
  };

  // Cycle management
  const handleAddCycle = (durationSeconds: number, notes?: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8);
    const newCycle: Cycle = {
      id: `cycle-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      cycleNumber: activeStudy.cycles.length + 1,
      durationSeconds,
      timestamp: timeStr,
      excluded: false,
      notes,
    };

    updateCurrentStudy((prev) => ({
      ...prev,
      cycles: [...prev.cycles, newCycle],
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleAddMultipleCycles = (times: number[]) => {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8);
    let startNum = activeStudy.cycles.length + 1;

    const newCycles: Cycle[] = times.map((t, idx) => ({
      id: `cycle-${Date.now()}-${idx}`,
      cycleNumber: startNum + idx,
      durationSeconds: t,
      timestamp: timeStr,
      excluded: false,
    }));

    updateCurrentStudy((prev) => ({
      ...prev,
      cycles: [...prev.cycles, newCycles].flat(),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleUpdateCycle = (
    cycleId: string,
    durationSeconds: number,
    excluded: boolean,
    exclusionReason?: string,
    notes?: string
  ) => {
    updateCurrentStudy((prev) => ({
      ...prev,
      cycles: prev.cycles.map((c) =>
        c.id === cycleId
          ? {
              ...c,
              durationSeconds,
              excluded,
              exclusionReason: excluded ? exclusionReason : undefined,
              notes,
            }
          : c
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleDeleteCycle = (cycleId: string) => {
    updateCurrentStudy((prev) => {
      const filtered = prev.cycles.filter((c) => c.id !== cycleId);
      // Renumber cycles
      const renumbered = filtered.map((c, idx) => ({
        ...c,
        cycleNumber: idx + 1,
      }));
      return {
        ...prev,
        cycles: renumbered,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleClearCycles = () => {
    updateCurrentStudy((prev) => ({
      ...prev,
      cycles: [],
      updatedAt: new Date().toISOString(),
    }));
  };

  // Adjustments management
  const handleUpdateAdjustments = (newAdjustments: AdjustmentFactors) => {
    updateCurrentStudy((prev) => ({
      ...prev,
      adjustments: newAdjustments,
      updatedAt: new Date().toISOString(),
    }));
  };

  // Metadata management
  const handleSaveMetadata = (newMetadata: StudyMetadata) => {
    updateCurrentStudy((prev) => ({
      ...prev,
      metadata: newMetadata,
      updatedAt: new Date().toISOString(),
    }));
  };

  // Study actions
  const handleCreateNewStudy = () => {
    const brandNew = createNewStudy();
    setStudies((prev) => [brandNew, ...prev]);
    setCurrentActiveStudyId(brandNew.id);
    setIsMetadataModalOpen(true);
  };

  const handleSelectStudy = (studyId: string) => {
    setCurrentActiveStudyId(studyId);
  };

  const handleDuplicateStudy = (studyId: string) => {
    const original = studies.find((s) => s.id === studyId);
    if (!original) return;

    const dupId = `study-${Date.now()}`;
    const duplicated: Study = {
      ...original,
      id: dupId,
      metadata: {
        ...original.metadata,
        id: dupId,
        processName: `${original.metadata.processName} (Cópia)`,
        date: new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setStudies((prev) => [duplicated, ...prev]);
    setCurrentActiveStudyId(dupId);
  };

  const handleDeleteStudy = (studyId: string) => {
    setStudies((prev) => {
      const filtered = prev.filter((s) => s.id !== studyId);
      if (filtered.length === 0) {
        const brandNew = createNewStudy();
        setCurrentActiveStudyId(brandNew.id);
        return [brandNew];
      }
      if (activeStudyId === studyId) {
        setCurrentActiveStudyId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Backup JSON
  const handleExportAllJSON = () => {
    const jsonStr = JSON.stringify(studies, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_Tempos_e_Metodos_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].metadata) {
        setStudies(parsed);
        setCurrentActiveStudyId(parsed[0].id);
        alert('Estudos importados com sucesso!');
      } else {
        alert('Formato de arquivo JSON inválido.');
      }
    } catch {
      alert('Erro ao processar arquivo JSON.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Header
        currentStudy={activeStudy}
        totalStudiesCount={studies.length}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onCreateNewStudy={handleCreateNewStudy}
        onOpenMetadataModal={() => setIsMetadataModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenMethodologyModal={() => setIsMethodologyModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Painel Inicial com os Principais Indicadores */}
        <section aria-label="Painel de Indicadores Chave">
          <DashboardMetrics
            metrics={metrics}
            adjustments={activeStudy.adjustments}
            onOpenAdjustments={() => {
              const el = document.getElementById('ajustes-secao');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </section>

        {/* Cronometragem do Posto */}
        <section aria-label="Cronômetro Industrial e Inserção de Tempos">
          <StopwatchSection
            currentCycleCount={activeStudy.cycles.length}
            onAddCycle={handleAddCycle}
            onAddMultipleCycles={handleAddMultipleCycles}
          />
        </section>

        {/* Fatores de Ajuste (Ritmo, Tolerâncias, Turno) */}
        <section id="ajustes-secao" aria-label="Fatores de Ajuste e Tolerâncias">
          <AdjustmentsSection
            adjustments={activeStudy.adjustments}
            averageTime={metrics.averageTimeSeconds}
            onUpdateAdjustments={handleUpdateAdjustments}
          />
        </section>

        {/* Grid: Tabela de Ciclos e Análise Gráfica */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Tabela de Leituras */}
          <section className="xl:col-span-7" aria-label="Tabela de Ciclos">
            <CyclesTable
              cycles={activeStudy.cycles}
              averageTime={metrics.averageTimeSeconds}
              onUpdateCycle={handleUpdateCycle}
              onDeleteCycle={handleDeleteCycle}
              onClearCycles={handleClearCycles}
            />
          </section>

          {/* Gráficos de Controle e Comparativo */}
          <section className="xl:col-span-5" aria-label="Gráficos de Tempos">
            <ChartsSection
              cycles={activeStudy.cycles}
              metrics={metrics}
            />
          </section>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">APP Tempos e Métodos</span>
            <span>·</span>
            <span>Engenharia de Processos & Cronoanálise Industrial</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Normas OIT (Organização Internacional do Trabalho)</span>
            <span>·</span>
            <button
              type="button"
              onClick={() => setIsMethodologyModalOpen(true)}
              className="text-sky-400 hover:text-sky-300 underline cursor-pointer"
            >
              Fórmulas e Conceitos
            </button>
          </div>
        </div>
      </footer>

      {/* Modais */}
      <StudyMetadataModal
        isOpen={isMetadataModalOpen}
        metadata={activeStudy.metadata}
        onSave={handleSaveMetadata}
        onClose={() => setIsMetadataModalOpen(false)}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        studies={studies}
        activeStudyId={activeStudy.id}
        onSelectStudy={handleSelectStudy}
        onCreateNewStudy={handleCreateNewStudy}
        onDuplicateStudy={handleDuplicateStudy}
        onDeleteStudy={handleDeleteStudy}
        onImportJSON={handleImportJSON}
        onExportAllJSON={handleExportAllJSON}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        study={activeStudy}
        metrics={metrics}
        onClose={() => setIsReportModalOpen(false)}
      />

      <MethodologyModal
        isOpen={isMethodologyModalOpen}
        onClose={() => setIsMethodologyModalOpen(false)}
      />
    </div>
  );
}
