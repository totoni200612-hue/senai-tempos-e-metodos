import React from 'react';
import { BookOpen, X, Calculator, ShieldCheck, Target, Activity } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Guia Metodológico · Tempos e Métodos
              </h3>
              <p className="text-xs text-slate-500">
                Fórmulas, conceitos industriais e padronização OIT
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          
          {/* Seção 1 */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Target className="w-4 h-4 text-sky-600" />
              1. Tempo Médio (TM)
            </h4>
            <p className="leading-relaxed">
              É a média aritmética dos tempos cronometrados considerados válidos. Ciclos anômalos (com falhas de máquina, queda de materiais ou desvios de processo) devem ser descartados para não distorcer a média.
            </p>
            <div className="p-2.5 bg-slate-100 rounded-lg font-mono text-[11px] text-slate-800">
              TM = (t₁ + t₂ + ... + tₙ) ÷ N_válidos
            </div>
          </div>

          {/* Seção 2 */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-sky-600" />
              2. Ritmo do Operador & Tempo Normal (TN)
            </h4>
            <p className="leading-relaxed">
              O ritmo é a avaliação da velocidade e habilidade do operador no momento da cronometragem, comparado ao ritmo de um trabalhador qualificado normal (100%):
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>100%:</strong> Ritmo normal de trabalho mantido durante toda a jornada sem exaustão.</li>
              <li><strong>110% a 120%:</strong> Operador com velocidade acima da média / alta destreza.</li>
              <li><strong>85% a 95%:</strong> Operador lento ou em fase de aprendizado.</li>
            </ul>
            <div className="p-2.5 bg-slate-100 rounded-lg font-mono text-[11px] text-slate-800">
              TN = TM × (Ritmo% ÷ 100)
            </div>
          </div>

          {/* Seção 3 */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              3. Tolerâncias / Suplementos & Tempo Padrão (TP)
            </h4>
            <p className="leading-relaxed">
              Nenhum ser humano trabalha 100% do tempo sem pausas. As tolerâncias (segundo as normas da Organização Internacional do Trabalho - OIT) adicionam tempo para:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Necessidades Pessoais:</strong> Mínimo 5% (beber água, higiene, descanso fisiológico).</li>
              <li><strong>Fadiga Básica:</strong> Mínimo 4% (recuperação biológica de energia).</li>
              <li><strong>Fadiga Variável / Ergonômica:</strong> Trabalho em pé (+2%), postura curvada (+2% a 7%), peso/esforço (+2% a 15%), calor/ruído (+2% a 5%).</li>
            </ul>
            <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-lg font-mono text-[11px] text-sky-950">
              TP = TN × (1 + Tolerâncias% ÷ 100)
            </div>
          </div>

          {/* Seção 4 */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-sky-600" />
              4. Capacidade Produtiva (Peças por Hora e Turno)
            </h4>
            <p className="leading-relaxed">
              O tempo padrão serve de base para balanceamento de linhas de montagem, cálculo de mão de obra e formação de custos:
            </p>
            <div className="p-2.5 bg-slate-100 rounded-lg font-mono text-[11px] text-slate-800 space-y-1">
              <div>Peças por Hora = 3.600 segundos ÷ TP</div>
              <div>Peças por Turno = (Horas_Turno × 3.600 ÷ TP) × Eficiência%</div>
            </div>
          </div>

          {/* Seção 5 */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Target className="w-4 h-4 text-sky-600" />
              5. Dimensionamento Amostral Estatístico (N' OIT)
            </h4>
            <p className="leading-relaxed">
              Para garantir 95% de confiança estatística com erro máximo de 5% sobre a média dos tempos:
            </p>
            <div className="p-2.5 bg-slate-100 rounded-lg font-mono text-[11px] text-slate-800">
              N' = [ (40 × Desvio_Padrão) ÷ Tempo_Médio ]²
            </div>
            <p className="text-slate-500 text-[11px]">
              Se a quantidade de ciclos cronometrados for menor que N', recomenda-se cronometrar mais ciclos para reduzir a incerteza estatística.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-800"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
