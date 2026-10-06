import React, { useState } from 'react';
import { Cycle } from '../types';
import { formatSeconds, formatTimeMMSSCC } from '../utils/calculations';
import { Trash2, Edit3, Check, X, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';

interface Props {
  cycles: Cycle[];
  averageTime: number;
  onUpdateCycle: (cycleId: string, durationSeconds: number, excluded: boolean, exclusionReason?: string, notes?: string) => void;
  onDeleteCycle: (cycleId: string) => void;
  onClearCycles: () => void;
}

export const CyclesTable: React.FC<Props> = ({
  cycles,
  averageTime,
  onUpdateCycle,
  onDeleteCycle,
  onClearCycles,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDuration, setEditDuration] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const startEdit = (cycle: Cycle) => {
    setEditingId(cycle.id);
    setEditDuration(cycle.durationSeconds.toString());
    setEditNotes(cycle.notes || '');
  };

  const saveEdit = (cycle: Cycle) => {
    const parsed = parseFloat(editDuration.replace(',', '.'));
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateCycle(
        cycle.id,
        parsed,
        cycle.excluded,
        cycle.exclusionReason,
        editNotes.trim() || undefined
      );
    }
    setEditingId(null);
  };

  const toggleExclude = (cycle: Cycle) => {
    if (!cycle.excluded) {
      const reason = window.prompt(
        'Informe o motivo do descarte deste ciclo (ex: falha do equipamento, queda de peça, interferência externa):',
        'Anomalia / Outlier pontual descartado da análise estatística'
      );
      if (reason !== null) {
        onUpdateCycle(cycle.id, cycle.durationSeconds, true, reason || 'Descartado da análise', cycle.notes);
      }
    } else {
      onUpdateCycle(cycle.id, cycle.durationSeconds, false, undefined, cycle.notes);
    }
  };

  if (cycles.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400 mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 mb-1">
          Nenhum ciclo cronometrado ainda
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Inicie o cronômetro acima ou insira os tempos manualmente para calcular o tempo médio, tempo padrão e ritmo de produção.
        </p>
      </div>
    );
  }

  const validCycles = cycles.filter((c) => !c.excluded);
  const totalSeconds = validCycles.reduce((sum, c) => sum + c.durationSeconds, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Título e Ações */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Registro dos Ciclos Cronometrados
          </h3>
          <span className="text-xs text-slate-500">
            ({validCycles.length} válidos de {cycles.length} no total)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {showClearConfirm ? (
            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2 py-1 rounded-md text-xs">
              <span className="text-rose-700 font-medium">Excluir todos?</span>
              <button
                type="button"
                onClick={() => {
                  onClearCycles();
                  setShowClearConfirm(false);
                }}
                className="px-2 py-0.5 bg-rose-600 text-white rounded text-[11px] font-bold hover:bg-rose-700 cursor-pointer"
              >
                Sim
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[11px] hover:bg-slate-300 cursor-pointer"
              >
                Não
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="text-xs text-slate-500 hover:text-rose-600 px-2.5 py-1.5 rounded-md border border-slate-200 hover:border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar Ciclos</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Ciclos */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px] tracking-wider">
            <tr>
              <th className="py-2.5 px-4 w-16">Ciclo</th>
              <th className="py-2.5 px-4">Tempo (s)</th>
              <th className="py-2.5 px-4">Tempo (mm:ss)</th>
              <th className="py-2.5 px-4">Desvio vs Média</th>
              <th className="py-2.5 px-4">Status / Validade</th>
              <th className="py-2.5 px-4">Observação</th>
              <th className="py-2.5 px-4 text-right w-24">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {cycles.map((cycle) => {
              const isEditing = editingId === cycle.id;
              const diffToAvg = cycle.durationSeconds - averageTime;
              const diffPercent = averageTime > 0 ? (diffToAvg / averageTime) * 100 : 0;
              const isExcluded = cycle.excluded;

              return (
                <tr
                  key={cycle.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    isExcluded ? 'bg-amber-50/40 text-slate-400 line-through-text' : 'text-slate-800'
                  }`}
                >
                  {/* Número do Ciclo */}
                  <td className="py-2.5 px-4 font-semibold text-slate-900">
                    #{cycle.cycleNumber}
                  </td>

                  {/* Duração em segundos (ou input de edição) */}
                  <td className="py-2.5 px-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        className="w-20 px-2 py-1 text-xs border border-sky-400 rounded bg-white text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                        autoFocus
                      />
                    ) : (
                      <span className={`font-semibold ${isExcluded ? 'text-slate-400' : 'text-slate-900'}`}>
                        {formatSeconds(cycle.durationSeconds)}
                      </span>
                    )}
                  </td>

                  {/* Duração formatada MM:SS.cc */}
                  <td className="py-2.5 px-4 text-slate-600">
                    {formatTimeMMSSCC(cycle.durationSeconds)}
                  </td>

                  {/* Desvio em relação à média */}
                  <td className="py-2.5 px-4">
                    {isExcluded ? (
                      <span className="text-slate-400">---</span>
                    ) : averageTime > 0 ? (
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                          Math.abs(diffPercent) < 5
                            ? 'text-slate-600'
                            : diffToAvg > 0
                            ? 'text-amber-600 font-semibold'
                            : 'text-sky-600 font-semibold'
                        }`}
                      >
                        {diffToAvg > 0 ? `+${diffToAvg.toFixed(2)}s` : `${diffToAvg.toFixed(2)}s`}
                        <span>({diffPercent > 0 ? `+${diffPercent.toFixed(1)}%` : `${diffPercent.toFixed(1)}%`})</span>
                      </span>
                    ) : (
                      '---'
                    )}
                  </td>

                  {/* Status / Descarte */}
                  <td className="py-2.5 px-4 font-sans">
                    <button
                      type="button"
                      onClick={() => toggleExclude(cycle)}
                      title={isExcluded ? 'Clique para reativar este ciclo' : 'Clique para descartar este ciclo (anomalia)'}
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        isExcluded
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {isExcluded ? (
                        <>
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Descartado</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Válido</span>
                        </>
                      )}
                    </button>
                    {isExcluded && cycle.exclusionReason && (
                      <p className="text-[10px] text-amber-700 mt-0.5 font-normal line-clamp-1" title={cycle.exclusionReason}>
                        Motivo: {cycle.exclusionReason}
                      </p>
                    )}
                  </td>

                  {/* Notas */}
                  <td className="py-2.5 px-4 font-sans text-slate-500 text-[11px]">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Observação..."
                        className="w-full px-2 py-1 text-xs border border-sky-400 rounded bg-white text-slate-900 focus:outline-none"
                      />
                    ) : (
                      cycle.notes || '—'
                    )}
                  </td>

                  {/* Ações */}
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => saveEdit(cycle)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                            title="Salvar alteração"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1 text-slate-400 hover:bg-slate-100 rounded cursor-pointer"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(cycle)}
                            className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded cursor-pointer"
                            title="Editar tempo"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteCycle(cycle.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                            title="Excluir ciclo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-50 border-t border-slate-200 font-mono text-slate-700">
            <tr>
              <td className="py-2.5 px-4 font-bold font-sans">Total Válido</td>
              <td className="py-2.5 px-4 font-bold text-slate-900">{formatSeconds(totalSeconds)}</td>
              <td className="py-2.5 px-4">{formatTimeMMSSCC(totalSeconds)}</td>
              <td className="py-2.5 px-4 font-sans font-medium text-slate-500">Média: {formatSeconds(averageTime)}</td>
              <td colSpan={3} className="py-2.5 px-4 text-right font-sans text-[11px] text-slate-500">
                {validCycles.length} amostras computadas para o cálculo
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
