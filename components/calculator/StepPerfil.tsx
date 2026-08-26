'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, HelpCircle, ChevronRight } from 'lucide-react'

interface Props {
  onSelect: (resposta: string) => void
  onBack: () => void
}

const PASSOS_EXPLICACAO = [
  {
    num: '1',
    titulo: 'Você contrata uma carta de crédito',
    descricao: 'Escolhe o valor do bem que quer comprar e entra em um grupo de pessoas com o mesmo objetivo.',
  },
  {
    num: '2',
    titulo: 'Paga parcelas mensais até ser contemplado',
    descricao: 'Todo mês um ou mais participantes recebem a carta. Pode ser por sorteio ou lance. Quando você é contemplado, o valor total é liberado para comprar à vista.',
  },
  {
    num: '3',
    titulo: 'Compra à vista e continua as parcelas — sem juros',
    descricao: 'Com a carta em mãos você compra o bem à vista, conseguindo o melhor preço. Segue pagando as parcelas restantes com apenas a taxa administrativa — zero juros bancários.',
  },
]

const OPCOES_FINANCIAMENTO = [
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

type Fase = 'entendimento' | 'explicacao' | 'financiamento'

export default function StepPerfil({ onSelect, onBack }: Props) {
  const [fase, setFase] = useState<Fase>('entendimento')

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">

        {fase === 'entendimento' && (
          <motion.div
            key="entendimento"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Você já entende como funciona o consórcio?
              </h2>
              <p className="text-gray-500 text-base">
                Isso nos ajuda a mostrar as informações certas pra você
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setFase('financiamento')}
                className="flex items-center justify-between gap-4 p-5 rounded-2xl border-2 border-gray-200 hover:border-blue-400 bg-white cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-95 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-blue-50 flex-shrink-0">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-1.5 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Sim, já entendo</p>
                    <p className="text-gray-500 text-sm">Sei como funciona a carta de crédito</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </button>

              <button
                onClick={() => setFase('explicacao')}
                className="flex items-center justify-between gap-4 p-5 rounded-2xl border-2 border-gray-200 hover:border-amber-400 bg-white cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-95 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-amber-50 flex-shrink-0">
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-1.5 rounded-lg">
                      <HelpCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Não, quero entender</p>
                    <p className="text-gray-500 text-sm">Me explica como funciona antes de continuar</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </button>
            </div>

            <button
              onClick={onBack}
              className="mt-4 w-full px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-gray-300 transition-all"
            >
              Voltar
            </button>
          </motion.div>
        )}

        {fase === 'explicacao' && (
          <motion.div
            key="explicacao"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Como funciona o consórcio
              </h2>
              <p className="text-gray-500 text-sm">Em 3 passos simples</p>
            </div>

            <div className="flex flex-col gap-4 mb-6">
              {PASSOS_EXPLICACAO.map((passo, i) => (
                <motion.div
                  key={passo.num}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-100"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1C5FA8] text-white font-black text-sm flex items-center justify-center">
                    {passo.num}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-0.5">{passo.titulo}</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{passo.descricao}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => setFase('financiamento')}
              className="w-full py-4 rounded-xl font-bold text-white text-base transition-all hover:brightness-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #1C5FA8, #0D3D72)' }}
            >
              Entendi — continuar simulação →
            </button>

            <button
              onClick={() => setFase('entendimento')}
              className="mt-3 w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Voltar
            </button>
          </motion.div>
        )}

        {fase === 'financiamento' && (
          <motion.div
            key="financiamento"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Você já tentou financiamento antes?
              </h2>
              <p className="text-gray-500 text-base">
                Isso nos ajuda a preparar a melhor proposta para você
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {OPCOES_FINANCIAMENTO.map((opcao, i) => {
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
              onClick={() => setFase('entendimento')}
              className="mt-4 w-full px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-gray-300 transition-all"
            >
              Voltar
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
