import React from 'react';
import { Study } from '../types';
import { 
  Timer, 
  FolderClock, 
  Plus, 
  FileText, 
  BookOpen, 
  Edit, 
  Sliders, 
  Factory 
} from 'lucide-react';

interface Props {
  currentStudy: Study;
  totalStudiesCount: number;
  onOpenHistory: () => void;
  onCreateNewStudy: () => void;
  onOpenMetadataModal: () => void;
  onOpenReportModal: () => void;
  onOpenMethodologyModal: () => void;
}

export const Header: React.FC<Props> = ({
  currentStudy,
  totalStudiesCount,
  onOpenHistory,
  onCreateNewStudy,
  onOpenMetadataModal,
  onOpenReportModal,
  onOpenMethodologyModal,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Nav Bar */}
        <div className="py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-950">
              <Timer className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                  APP Tempos e Métodos
                </h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-semibold">
                  PRO v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cronoanálise Industrial · Tempo Padrão · OIT
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            
            {/* Novo Estudo */}
            <button
              type="button"
              onClick={onCreateNewStudy}
              className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Estudo</span>
            </button>

            {/* Histórico */}
            <button
              type="button"
              onClick={onOpenHistory}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <FolderClock className="w-4 h-4 text-sky-400" />
              <span>Histórico</span>
              <span className="ml-0.5 px-1.5 py-0.2 bg-slate-900 rounded-full text-[10px] text-slate-300 font-mono">
                {totalStudiesCount}
              </span>
            </button>

            {/* Relatório / PDF */}
            <button
              type="button"
              onClick={onOpenReportModal}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Relatório & PDF</span>
            </button>

            {/* Guia */}
            <button
              type="button"
              onClick={onOpenMethodologyModal}
              title="Guia Metodológico e Fórmulas da OIT"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-700"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Current Active Study Sub-Bar */}
        <div className="py-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Factory className="w-3.5 h-3.5 text-sky-400" />
              <span>Processo:</span>
              <strong className="text-white font-medium">
                {currentStudy.metadata.processName || 'Não especificado'}
              </strong>
            </span>

            <span className="text-slate-600 hidden sm:inline">·</span>

            <span className="text-slate-400">
              Produto: <strong className="text-slate-200 font-mono">{currentStudy.metadata.productCode}</strong>
            </span>

            <span className="text-slate-600 hidden sm:inline">·</span>

            <span className="text-slate-400">
              Setor: <span className="text-slate-300">{currentStudy.metadata.sector}</span>
            </span>

            <span className="text-slate-600 hidden sm:inline">·</span>

            <span className="text-slate-400">
              Operador: <span className="text-slate-300">{currentStudy.metadata.operatorName}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenMetadataModal}
            className="text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Edit className="w-3 h-3" />
            <span>Editar Cadastro</span>
          </button>
        </div>

      </div>
    </header>
  );
};
