import React, { useState } from 'react';
import { Study } from '../types';
import { calculateStudyMetrics, formatSeconds } from '../utils/calculations';
import { 
  Search, 
  FolderClock, 
  Plus, 
  Trash2, 
  Copy, 
  ExternalLink, 
  X, 
  Calendar, 
  Tag, 
  User, 
  Download, 
  Upload 
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  studies: Study[];
  activeStudyId: string;
  onSelectStudy: (studyId: string) => void;
  onCreateNewStudy: () => void;
  onDuplicateStudy: (studyId: string) => void;
  onDeleteStudy: (studyId: string) => void;
  onImportJSON: (jsonString: string) => void;
  onExportAllJSON: () => void;
  onClose: () => void;
}

export const HistoryModal: React.FC<Props> = ({
  isOpen,
  studies,
  activeStudyId,
  onSelectStudy,
  onCreateNewStudy,
  onDuplicateStudy,
  onDeleteStudy,
  onImportJSON,
  onExportAllJSON,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Extract unique sectors
  const sectors = Array.from(new Set(studies.map((s) => s.metadata.sector).filter(Boolean)));

  // Filter studies
  const filteredStudies = studies.filter((study) => {
    const term = searchTerm.toLowerCase();
    const matchText =
      study.metadata.processName.toLowerCase().includes(term) ||
      study.metadata.productCode.toLowerCase().includes(term) ||
      study.metadata.sector.toLowerCase().includes(term) ||
      study.metadata.operation.toLowerCase().includes(term) ||
      study.metadata.operatorName.toLowerCase().includes(term) ||
      study.metadata.date.includes(term);

    const matchSector = selectedSector === 'all' || study.metadata.sector === selectedSector;

    return matchText && matchSector;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportJSON(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
              <FolderClock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Histórico de Estudos de Tempos
              </h3>
              <p className="text-xs text-slate-500">
                {studies.length} estudo{studies.length !== 1 ? 's' : ''} registrado{studies.length !== 1 ? 's' : ''} no banco de dados local
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCreateNewStudy}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Estudo</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por processo, produto, setor, operador ou data (ex: PRD-8840 ou 2026)..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Sector filters */}
          {sectors.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-500 text-[11px] font-semibold mr-1">Setor:</span>
              <button
                type="button"
                onClick={() => setSelectedSector('all')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedSector === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Todos ({studies.length})
              </button>
              {sectors.map((sec) => {
                const count = studies.filter((s) => s.metadata.sector === sec).length;
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSelectedSector(sec)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      selectedSector === sec
                        ? 'bg-sky-700 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {sec} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* List of Studies */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredStudies.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Nenhum estudo encontrado com os critérios pesquisados.
            </div>
          ) : (
            filteredStudies.map((study) => {
              const metrics = calculateStudyMetrics(study.cycles, study.adjustments);
              const isActive = study.id === activeStudyId;
              const isDeleting = deleteConfirmId === study.id;

              return (
                <div
                  key={study.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-sky-50/40 border-sky-400 ring-1 ring-sky-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    
                    {/* Left: Metadata */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">
                          {study.metadata.processName || 'Processo sem nome'}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                            Estudo Atual Aberto
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1 font-mono text-slate-700">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {study.metadata.productCode}
                        </span>
                        <span>·</span>
                        <span>{study.metadata.sector}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          {study.metadata.operatorName}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {study.metadata.date}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 italic">
                        Op: {study.metadata.operation}
                      </p>
                    </div>

                    {/* Middle: Key KPIs */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center font-mono">
                      <div>
                        <div className="text-[10px] text-slate-500 font-sans uppercase">Ciclos</div>
                        <div className="text-xs font-bold text-slate-800">
                          {study.cycles.length}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-sans uppercase">T. Padrão</div>
                        <div className="text-xs font-bold text-sky-700">
                          {formatSeconds(metrics.standardTimeSeconds)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-sans uppercase">Pçs / Hora</div>
                        <div className="text-xs font-bold text-emerald-700">
                          {Math.floor(metrics.piecesPerHour)}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectStudy(study.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDuplicateStudy(study.id)}
                        title="Duplicar estudo"
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {isDeleting ? (
                        <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 p-1 rounded-lg">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteStudy(study.id);
                              setDeleteConfirmId(null);
                            }}
                            className="px-2 py-0.5 bg-rose-600 text-white rounded text-[11px] font-bold cursor-pointer"
                          >
                            Excluir
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-1 text-slate-600 text-[11px] cursor-pointer"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(study.id)}
                          title="Excluir estudo"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer: Backup JSON Import/Export */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExportAllJSON}
              className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-md cursor-pointer hover:border-slate-300"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Exportar Backup (JSON)</span>
            </button>

            <label className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-md cursor-pointer hover:border-slate-300">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Importar Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <span className="text-slate-500 text-[11px]">
            Dados salvos automaticamente de forma segura no navegador.
          </span>
        </div>

      </div>
    </div>
  );
};
