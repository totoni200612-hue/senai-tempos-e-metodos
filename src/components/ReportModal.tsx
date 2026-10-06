import React from 'react';
import { Study, CalculatedMetrics } from '../types';
import { formatSeconds, formatDecimalMinutes, formatTimeMMSSCC } from '../utils/calculations';
import { Printer, Download, X, CheckCircle, FileSpreadsheet } from 'lucide-react';

interface Props {
  isOpen: boolean;
  study: Study;
  metrics: CalculatedMetrics;
  onClose: () => void;
}

export const ReportModal: React.FC<Props> = ({
  isOpen,
  study,
  metrics,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const lines = [
      `RELATÓRIO TÉCNICO DE TEMPOS E MÉTODOS`,
      `Processo:;${study.metadata.processName}`,
      `Código do Produto:;${study.metadata.productCode}`,
      `Setor:;${study.metadata.sector}`,
      `Operação:;${study.metadata.operation}`,
      `Operador:;${study.metadata.operatorName}`,
      `Analista:;${study.metadata.analystName}`,
      `Posto:;${study.metadata.workstation}`,
      `Data:;${study.metadata.date}`,
      ``,
      `INDICADORES PRINCIPAIS`,
      `Tempo Médio (TM) [s]:;${metrics.averageTimeSeconds.toFixed(2)}`,
      `Ritmo do Operador [%]:;${study.adjustments.ratingPercentage}`,
      `Tempo Normal (TN) [s]:;${metrics.normalTimeSeconds.toFixed(2)}`,
      `Tolerâncias / Suplementos [%]:;${study.adjustments.allowancesPercentage}`,
      `Tempo Padrão (TP) [s]:;${metrics.standardTimeSeconds.toFixed(2)}`,
      `Peças por Hora [pç/h]:;${metrics.piecesPerHour.toFixed(1)}`,
      `Horas por Turno [h]:;${study.adjustments.shiftHours}`,
      `Eficiência Esperada [%]:;${study.adjustments.shiftEfficiencyPercentage}`,
      `Peças por Turno [pçs]:;${Math.floor(metrics.piecesPerShift)}`,
      `Desvio Padrão [s]:;${metrics.standardDeviation.toFixed(2)}`,
      `Coeficiente de Variação [%]:;${metrics.varianceCoefficient.toFixed(1)}`,
      `Amostra Mínima OIT [ciclos]:;${metrics.recommendedSampleSize}`,
      ``,
      `CICLOS CRONOMETRADOS`,
      `Ciclo;Tempo (s);Tempo (mm:ss);Status;Desvio vs Média (s);Observações`,
    ];

    study.cycles.forEach((c) => {
      const diff = c.durationSeconds - metrics.averageTimeSeconds;
      lines.push(
        `${c.cycleNumber};${c.durationSeconds.toFixed(2)};${formatTimeMMSSCC(c.durationSeconds)};${
          c.excluded ? 'Descartado' : 'Válido'
        };${diff.toFixed(2)};"${(c.notes || c.exclusionReason || '').replace(/"/g, '""')}"`
      );
    });

    const csvContent = '\uFEFF' + lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cronoanalise_${study.metadata.productCode || 'Estudo'}_${study.metadata.date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-300 overflow-hidden my-4 flex flex-col max-h-[95vh]">
        
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="print:hidden px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold tracking-wider uppercase">
              Relatório Técnico de Cronoanálise · Impressão / PDF
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar Excel (CSV)</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar em PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100 print:p-0 print:bg-white print:overflow-visible">
          
          <div className="bg-white p-8 sm:p-10 rounded-xl shadow-xs border border-slate-200 print:border-none print:shadow-none print:p-0 max-w-3xl mx-auto space-y-6 text-slate-900">
            
            {/* Header Técnico */}
            <div className="border-b-2 border-slate-900 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-bold">
                    ENGENHARIA INDUSTRIAL & PROCESSOS · CRONOANÁLISE
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mt-0.5">
                    Estudo de Tempos e Métodos
                  </h1>
                </div>
                <div className="text-right font-mono text-xs text-slate-500">
                  <div>DOC ID: <strong className="text-slate-800">{study.id.slice(-8).toUpperCase()}</strong></div>
                  <div>Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
                </div>
              </div>
            </div>

            {/* Ficha de Identificação Técnica */}
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 bg-slate-100 px-2 py-1 rounded">
                1. Identificação do Processo e Posto de Trabalho
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border border-slate-200 p-3 rounded-lg bg-slate-50/50">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Processo:</span>
                  <strong className="text-slate-900">{study.metadata.processName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Código do Produto:</span>
                  <strong className="font-mono text-slate-900">{study.metadata.productCode}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Setor Fabril:</span>
                  <span className="text-slate-900">{study.metadata.sector}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Data do Estudo:</span>
                  <span className="font-mono text-slate-900">{study.metadata.date}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px] uppercase">Operação Analisada:</span>
                  <span className="text-slate-900 font-medium">{study.metadata.operation}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Operador:</span>
                  <span className="text-slate-900">{study.metadata.operatorName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Analista / Cronometrista:</span>
                  <span className="text-slate-900">{study.metadata.analystName || 'Não informado'}</span>
                </div>
                {study.metadata.workstation && (
                  <div className="col-span-2">
                    <span className="text-slate-500 block text-[10px] uppercase">Posto / Máquina:</span>
                    <span className="text-slate-900">{study.metadata.workstation}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Resumo de Resultados e Indicadores Chave */}
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 bg-slate-100 px-2 py-1 rounded">
                2. Indicadores Consolidados de Tempos & Capacidade
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 border border-slate-300 rounded-lg bg-slate-50 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Tempo Médio (TM)</div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                    {formatSeconds(metrics.averageTimeSeconds)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {formatDecimalMinutes(metrics.averageTimeSeconds)}
                  </div>
                </div>

                <div className="p-3 border border-slate-300 rounded-lg bg-slate-50 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Tempo Normal (TN)</div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                    {formatSeconds(metrics.normalTimeSeconds)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Ritmo: {study.adjustments.ratingPercentage}%
                  </div>
                </div>

                <div className="p-3 border-2 border-sky-600 rounded-lg bg-sky-50 text-center">
                  <div className="text-[10px] text-sky-800 uppercase font-bold">Tempo Padrão (TP)</div>
                  <div className="text-xl font-bold font-mono text-sky-950 mt-0.5">
                    {formatSeconds(metrics.standardTimeSeconds)}
                  </div>
                  <div className="text-[10px] text-sky-700">
                    Tol: +{study.adjustments.allowancesPercentage}%
                  </div>
                </div>

                <div className="p-3 border border-slate-300 rounded-lg bg-emerald-50 text-center">
                  <div className="text-[10px] text-emerald-800 uppercase font-bold">Capacidade Horária</div>
                  <div className="text-xl font-bold font-mono text-emerald-950 mt-0.5">
                    {Math.floor(metrics.piecesPerHour)} pç/h
                  </div>
                  <div className="text-[10px] text-emerald-700 font-mono">
                    {metrics.piecesPerHour.toFixed(1)} teórica
                  </div>
                </div>
              </div>

              {/* Parâmetros adicionais */}
              <div className="grid grid-cols-3 gap-2 mt-2 text-xs font-mono bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-700">
                <div>
                  <span className="text-[10px] font-sans text-slate-500 block">Capacidade / Turno:</span>
                  <strong>{Math.floor(metrics.piecesPerShift)} pçs</strong> ({study.adjustments.shiftHours}h)
                </div>
                <div>
                  <span className="text-[10px] font-sans text-slate-500 block">Eficiência do Turno:</span>
                  <strong>{study.adjustments.shiftEfficiencyPercentage}%</strong>
                </div>
                <div>
                  <span className="text-[10px] font-sans text-slate-500 block">Ritmo Operador:</span>
                  <strong>{metrics.efficiencyRatingLabel}</strong>
                </div>
              </div>
            </div>

            {/* 3. Análise Estatística da Amostra */}
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 bg-slate-100 px-2 py-1 rounded">
                3. Análise Estatística da Amostra (Confiabilidade OIT)
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono border border-slate-200 p-3 rounded-lg">
                <div>
                  <span className="text-slate-500 block text-[10px] font-sans uppercase">Ciclos Válidos:</span>
                  <strong className="text-slate-900">{metrics.validCyclesCount}</strong> / {metrics.totalCycles}
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-sans uppercase">Menor / Maior:</span>
                  <span>{formatSeconds(metrics.minTimeSeconds)} · {formatSeconds(metrics.maxTimeSeconds)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-sans uppercase">Desvio Padrão:</span>
                  <span>±{metrics.standardDeviation.toFixed(2)}s</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-sans uppercase">Var. (CV%):</span>
                  <span>{metrics.varianceCoefficient.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-sans uppercase">Amostra Mín OIT:</span>
                  <strong className="text-sky-800">{metrics.recommendedSampleSize} ciclos</strong>
                </div>
              </div>
            </div>

            {/* 4. Tabela de Leituras dos Ciclos */}
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 bg-slate-100 px-2 py-1 rounded">
                4. Relação de Leituras Cronometradas
              </h2>

              <table className="w-full text-xs font-mono border border-slate-300 divide-y divide-slate-200">
                <thead className="bg-slate-100 text-slate-800 font-bold text-[10px] uppercase">
                  <tr>
                    <th className="p-1.5 text-left w-14">Ciclo</th>
                    <th className="p-1.5 text-left">Tempo (s)</th>
                    <th className="p-1.5 text-left">Minutos Dec.</th>
                    <th className="p-1.5 text-left">Desvio da Média</th>
                    <th className="p-1.5 text-left">Status</th>
                    <th className="p-1.5 text-left">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {study.cycles.map((c) => {
                    const diff = c.durationSeconds - metrics.averageTimeSeconds;
                    return (
                      <tr key={c.id} className={c.excluded ? 'bg-amber-50/50 text-slate-400' : ''}>
                        <td className="p-1.5 font-bold">#{c.cycleNumber}</td>
                        <td className="p-1.5 font-bold text-slate-900">{formatSeconds(c.durationSeconds)}</td>
                        <td className="p-1.5">{formatDecimalMinutes(c.durationSeconds)}</td>
                        <td className="p-1.5">
                          {c.excluded ? '—' : `${diff > 0 ? '+' : ''}${diff.toFixed(2)}s`}
                        </td>
                        <td className="p-1.5 font-sans">
                          {c.excluded ? (
                            <span className="text-amber-700 font-semibold text-[10px]">DESCARTADO</span>
                          ) : (
                            <span className="text-emerald-700 text-[10px]">VÁLIDO</span>
                          )}
                        </td>
                        <td className="p-1.5 font-sans text-slate-600 text-[10px]">
                          {c.exclusionReason || c.notes || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Observações Gerais */}
            {study.metadata.notes && (
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 bg-slate-100 px-2 py-1 rounded">
                  5. Observações do Posto e Engenharia
                </h2>
                <p className="text-xs text-slate-700 italic border border-slate-200 p-2.5 rounded-lg bg-slate-50">
                  {study.metadata.notes}
                </p>
              </div>
            )}

            {/* Campo de Assinaturas Formais */}
            <div className="pt-8 border-t border-slate-300 mt-8">
              <div className="grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                  <div className="border-b border-slate-400 mb-1 h-8" />
                  <span className="font-bold text-slate-800 block">Cronometrista / Analista</span>
                  <span className="text-[10px] text-slate-500">{study.metadata.analystName || 'Responsável Técnico'}</span>
                </div>
                <div>
                  <div className="border-b border-slate-400 mb-1 h-8" />
                  <span className="font-bold text-slate-800 block">Supervisor de Produção</span>
                  <span className="text-[10px] text-slate-500">Validação de Posto</span>
                </div>
                <div>
                  <div className="border-b border-slate-400 mb-1 h-8" />
                  <span className="font-bold text-slate-800 block">Engenharia de Processos</span>
                  <span className="text-[10px] text-slate-500">Aprovação Final</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
