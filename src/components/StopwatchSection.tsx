import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Plus, Volume2, VolumeX, Keyboard, UploadCloud } from 'lucide-react';
import { formatTimeMMSSCC, parseTimeStringToSeconds } from '../utils/calculations';
import { playChronometerBeep } from '../utils/audio';

interface Props {
  currentCycleCount: number;
  onAddCycle: (durationSeconds: number, notes?: string) => void;
  onAddMultipleCycles: (times: number[]) => void;
}

export const StopwatchSection: React.FC<Props> = ({
  currentCycleCount,
  onAddCycle,
  onAddMultipleCycles,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [continuousMode, setContinuousMode] = useState(true); // true = reset timer on lap and keep running; false = stop on lap

  // Manual inputs
  const [manualInput, setManualInput] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [manualError, setManualError] = useState('');
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchText, setBatchText] = useState('');

  const startTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef(0);
  const requestAnimationRef = useRef<number | null>(null);

  const updateTimer = useCallback(() => {
    if (startTimeRef.current !== null) {
      const now = performance.now();
      const currentDelta = (now - startTimeRef.current) / 1000;
      setElapsedTime(accumulatedTimeRef.current + currentDelta);
      requestAnimationRef.current = requestAnimationFrame(updateTimer);
    }
  }, []);

  const handleStart = () => {
    if (!isRunning) {
      if (soundEnabled) playChronometerBeep('start');
      startTimeRef.current = performance.now();
      setIsRunning(true);
      requestAnimationRef.current = requestAnimationFrame(updateTimer);
    }
  };

  const handleStop = () => {
    if (isRunning) {
      if (soundEnabled) playChronometerBeep('stop');
      if (startTimeRef.current !== null) {
        const now = performance.now();
        accumulatedTimeRef.current += (now - startTimeRef.current) / 1000;
        setElapsedTime(accumulatedTimeRef.current);
      }
      startTimeRef.current = null;
      if (requestAnimationRef.current) {
        cancelAnimationFrame(requestAnimationRef.current);
        requestAnimationRef.current = null;
      }
      setIsRunning(false);
    }
  };

  const handleToggle = () => {
    if (isRunning) {
      handleStop();
    } else {
      handleStart();
    }
  };

  const handleReset = () => {
    if (soundEnabled) playChronometerBeep('reset');
    if (requestAnimationRef.current) {
      cancelAnimationFrame(requestAnimationRef.current);
      requestAnimationRef.current = null;
    }
    startTimeRef.current = null;
    accumulatedTimeRef.current = 0;
    setElapsedTime(0);
    setIsRunning(false);
  };

  // Record cycle
  const handleRecordCycle = () => {
    if (elapsedTime <= 0.1) return;

    const recordedSeconds = Number(elapsedTime.toFixed(2));
    if (soundEnabled) playChronometerBeep('lap');

    onAddCycle(recordedSeconds);

    if (continuousMode && isRunning) {
      // In continuous mode, reset the lap timer and continue timing immediately
      accumulatedTimeRef.current = 0;
      startTimeRef.current = performance.now();
      setElapsedTime(0);
    } else {
      // Single cycle mode
      handleReset();
    }
  };

  // Keyboard shortcut: Space = start/stop, Enter = record cycle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleToggle();
      } else if (e.code === 'Enter') {
        e.preventDefault();
        if (elapsedTime > 0.1) {
          handleRecordCycle();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, elapsedTime, continuousMode, soundEnabled]);

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (requestAnimationRef.current) {
        cancelAnimationFrame(requestAnimationRef.current);
      }
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError('');
    const seconds = parseTimeStringToSeconds(manualInput);

    if (seconds === null || seconds <= 0) {
      setManualError('Informe um tempo válido (ex: 45.2 ou 1:15)');
      return;
    }

    onAddCycle(Number(seconds.toFixed(2)), manualNotes.trim() || undefined);
    setManualInput('');
    setManualNotes('');
  };

  const handleBatchImport = () => {
    const linesOrCommas = batchText
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const validTimes: number[] = [];
    for (const item of linesOrCommas) {
      const parsed = parseTimeStringToSeconds(item);
      if (parsed !== null && parsed > 0) {
        validTimes.push(Number(parsed.toFixed(2)));
      }
    }

    if (validTimes.length > 0) {
      onAddMultipleCycles(validTimes);
      setBatchText('');
      setShowBatchModal(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header da seção */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Cronometragem do Posto
          </h2>
          <span className="text-xs text-slate-500 ml-2">
            Próximo Ciclo: <strong className="text-slate-800">#{currentCycleCount + 1}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Som toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Silenciar bipe do cronômetro' : 'Ativar bipe do cronômetro'}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md px-2.5 py-1.5 cursor-pointer transition-colors"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden sm:inline">Som Ativo</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline text-slate-400">Mudo</span>
              </>
            )}
          </button>

          {/* Modo contínuo toggle */}
          <button
            type="button"
            onClick={() => setContinuousMode(!continuousMode)}
            className={`text-xs px-2.5 py-1.5 rounded-md border cursor-pointer font-medium transition-colors ${
              continuousMode
                ? 'bg-sky-50 text-sky-800 border-sky-300'
                : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
            title="No modo contínuo, ao clicar em Registrar Ciclo, o cronômetro reinicia a medição sem parar o operador"
          >
            {continuousMode ? 'Modo Contínuo (Voltas)' : 'Modo Parada Única'}
          </button>

          {/* Inserção em Lote */}
          <button
            type="button"
            onClick={() => setShowBatchModal(true)}
            className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-md px-2.5 py-1.5 cursor-pointer hover:border-slate-300 transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Colar Vários</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Painel do Cronômetro Digital */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-slate-950 rounded-2xl text-white shadow-inner relative overflow-hidden border border-slate-800">
            {/* Ambient subtle grid */}
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="flex items-center justify-between w-full text-slate-400 text-xs font-mono uppercase tracking-widest mb-2 z-10">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                {isRunning ? 'CRONOMETRANDO EM TEMPO REAL' : 'CRONÔMETRO PRONTO'}
              </span>
              <span>CICLO #{currentCycleCount + 1}</span>
            </div>

            {/* Display Principal */}
            <div className="my-3 text-center z-10">
              <div className="text-6xl sm:text-7xl font-mono font-bold tracking-tight text-white select-none drop-shadow-sm font-['JetBrains_Mono',monospace]">
                {formatTimeMMSSCC(elapsedTime)}
              </div>
              <div className="text-slate-400 font-mono text-sm mt-1">
                {elapsedTime.toFixed(2)} segundos acumulados
              </div>
            </div>

            {/* Atalhos de Teclado Dica */}
            <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-500 mb-4 z-10">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono text-[10px]">Espaço</kbd>
                Iniciar/Pausar
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono text-[10px]">Enter</kbd>
                Registrar Ciclo
              </span>
            </div>

            {/* Botões do Cronômetro */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full z-10">
              {/* Botão Start / Pause */}
              <button
                type="button"
                onClick={handleToggle}
                className={`flex-1 min-w-[140px] py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/40'
                    : 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-emerald-950/40'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>{elapsedTime > 0 ? 'Continuar' : 'Iniciar'}</span>
                  </>
                )}
              </button>

              {/* Botão Registrar Ciclo (Lap) */}
              <button
                type="button"
                onClick={handleRecordCycle}
                disabled={elapsedTime <= 0.1}
                className="flex-1 min-w-[170px] py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:hover:bg-sky-600 text-white shadow-lg shadow-sky-900/40 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                <span>Registrar Ciclo</span>
              </button>

              {/* Botão Zerar */}
              <button
                type="button"
                onClick={handleReset}
                disabled={elapsedTime === 0 && !isRunning}
                title="Zerar cronômetro"
                className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Entrada Manual de Tempos */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Inserção Manual de Ciclo
                </h3>
                <span className="text-[11px] text-slate-600">
                  Digitação rápida
                </span>
              </div>

              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Insira o tempo de cronometragem já anotado em prancheta de campo ou cronômetro mecânico. Aceita segundos (ex: <code className="text-sky-700 font-semibold font-mono">42.5</code>) ou minutos e segundos (ex: <code className="text-sky-700 font-semibold font-mono">1:15</code>).
              </p>

              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Tempo do Ciclo *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={manualInput}
                      onChange={(e) => {
                        setManualInput(e.target.value);
                        if (manualError) setManualError('');
                      }}
                      placeholder="Ex: 43.8 ou 0:43.8"
                      className="w-full font-mono text-base bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                    <span className="absolute right-3 top-3 text-xs font-mono text-slate-400">
                      segundos
                    </span>
                  </div>
                  {manualError && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{manualError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Observação do Ciclo (Opcional)
                  </label>
                  <input
                    type="text"
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    placeholder="Ex: troca de ferramenta, rebarbação manual..."
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Ciclo #{currentCycleCount + 1} Manualmente</span>
                </button>
              </form>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Keyboard className="w-3.5 h-3.5 text-slate-400" />
                Suporta decimais com vírgula ou ponto
              </span>
              <button
                type="button"
                onClick={() => setShowBatchModal(true)}
                className="text-sky-600 hover:text-sky-800 font-medium cursor-pointer"
              >
                Colar lista de tempos →
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Modal de importação rápida em lote */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Inserir Vários Ciclos em Lote
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Cole uma sequência de tempos separados por vírgula, ponto e vírgula ou uma linha por tempo.
            </p>

            <textarea
              rows={6}
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder="Exemplo:&#10;42.5&#10;44.1&#10;43.8&#10;41.9&#10;45.0"
              className="w-full font-mono text-sm bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />

            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleBatchImport}
                disabled={!batchText.trim()}
                className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-lg cursor-pointer transition-colors shadow-xs"
              >
                Importar Ciclos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
