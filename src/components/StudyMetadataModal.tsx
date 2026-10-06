import React, { useState, useEffect } from 'react';
import { StudyMetadata } from '../types';
import { FileText, Save, X, Calendar, User, Building2, Tag, Wrench } from 'lucide-react';

interface Props {
  isOpen: boolean;
  metadata: StudyMetadata;
  onSave: (updated: StudyMetadata) => void;
  onClose: () => void;
}

export const StudyMetadataModal: React.FC<Props> = ({
  isOpen,
  metadata,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<StudyMetadata>(metadata);

  useEffect(() => {
    setFormData(metadata);
  }, [metadata, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Cadastro e Identificação do Estudo
              </h3>
              <p className="text-xs text-slate-500">
                Dados técnicos da cronoanálise de métodos e processos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Nome do Processo */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Nome do Processo *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.processName}
                  onChange={(e) => setFormData({ ...formData, processName: e.target.value })}
                  placeholder="Ex: Montagem do Subconjunto"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-3 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Código do Produto */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Código do Produto *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.productCode}
                  onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                  placeholder="Ex: PRD-2024-X"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-3 pr-3 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Setor */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Setor / Área Fabril *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  placeholder="Ex: Usinagem / Solda / Montagem"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-3 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Operação Analisada */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Operação Analisada *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.operation}
                  onChange={(e) => setFormData({ ...formData, operation: e.target.value })}
                  placeholder="Ex: Rebitagem manual e inspeção visual"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-3 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Nome do Operador */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Nome do Operador *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.operatorName}
                  onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
                  placeholder="Ex: João Silva"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-3 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Data do Estudo */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Data do Estudo *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-3 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Cronometrista / Analista */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Analista / Cronometrista
              </label>
              <input
                type="text"
                value={formData.analystName}
                onChange={(e) => setFormData({ ...formData, analystName: e.target.value })}
                placeholder="Ex: Eng. Responsável"
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Posto de Trabalho / Máquina */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Posto de Trabalho / Máquina
              </label>
              <input
                type="text"
                value={formData.workstation}
                onChange={(e) => setFormData({ ...formData, workstation: e.target.value })}
                placeholder="Ex: Prensa Hidráulica P-03"
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Condições do Posto de Trabalho & Observações Gerais
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Descreva ferramentas utilizadas, lote de peças, ritmo aparente, se houve interrupções ou condições especiais..."
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Botões do Rodapé */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Cadastro</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
