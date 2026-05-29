'use client'

import { motion } from 'framer-motion'
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react'

interface Props {
  onSelect: (resposta: string) => void
  onBack: () => void
}

const OPCOES = [
  {
    valor: 'juros_altos',
    icon: CheckCircle,
    titulo: 'Sim, mas os juros eram muito altos',
    descricao: 'Tentei financiamento e me assustei com o custo',
    cor: 'from-green-500 to-green-600',
    bg: 'bg-green-50',
    border: 'hover:border-green-400',
  },
  {
    valor: 'reprovado',
    icon: XCircle,
    titulo: 'Sim, mas fui reprovado no crédito',
    descricao: 'Não consegui aprovação no banco',
    cor: 'from-red-500 to-red-600',
    bg: 'bg-red-50',
    border: 'hover:border-red-400',
  },
  {
    valor: 'pesquisando',
    icon: HelpCircle,
    titulo: 'Não, ainda estou pesquisando opções',
    descricao: 'Quero entender o que faz mais sentido pra mim',
    cor: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    border: 'hover:border-blue-400',
  },
]

export default function StepPerfil({ onSelect, onBack }: Props) {
  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Você já tentou financiamento antes?
        </h2>
        <p className="text-gray-500 text-base">
          Isso nos ajuda a preparar a melhor proposta para você
        </p>
      </motion.div>

      <div className="flex flex-col gap-3">
        {OPCOES.map((opcao, i) => {
          const Icon = opcao.icon
          return (
            <motion.button
              key={opcao.valor}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => onSelect(opcao.valor)}
              className={`
                flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-200
                ${opcao.border} bg-white cursor-pointer transition-all duration-200
                hover:shadow-md hover:scale-[1.02] active:scale-95 text-left
              `}
            >
              <div className={`p-2 rounded-xl ${opcao.bg} flex-shrink-0`}>
                <div className={`bg-gradient-to-br ${opcao.cor} p-1.5 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <p className="font-bold text-gray-900">{opcao.titulo}</p>
                <p className="text-gray-500 text-sm">{opcao.descricao}</p>
              </div>
            </motion.button>
          )
        })}
      </div>

      <button
        onClick={onBack}
        className="mt-4 w-full px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-gray-300 transition-all"
      >
        Voltar
      </button>
    </div>
  )
}
