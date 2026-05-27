'use client'

import { motion } from 'framer-motion'
import { Home, Car, Briefcase, Hammer, TrendingUp } from 'lucide-react'
import { BemType } from '@/lib/calculos'

interface Props {
  onSelect: (bem: BemType) => void
}

const OPCOES = [
  {
    bem: 'imovel' as BemType,
    icon: Home,
    titulo: 'Imóvel',
    descricao: 'Casa, apartamento ou terreno',
    cor: 'from-blue-500 to-blue-600',
    corHover: 'hover:border-blue-500',
    bg: 'bg-blue-50',
  },
  {
    bem: 'carro' as BemType,
    icon: Car,
    titulo: 'Veículo',
    descricao: 'Carro, moto ou caminhão',
    cor: 'from-emerald-500 to-emerald-600',
    corHover: 'hover:border-emerald-500',
    bg: 'bg-emerald-50',
  },
  {
    bem: 'negocio' as BemType,
    icon: Briefcase,
    titulo: 'Negócio',
    descricao: 'Empresa, franquia ou capital',
    cor: 'from-purple-500 to-purple-600',
    corHover: 'hover:border-purple-500',
    bg: 'bg-purple-50',
  },
  {
    bem: 'reforma' as BemType,
    icon: Hammer,
    titulo: 'Reforma',
    descricao: 'Construção ou reforma',
    cor: 'from-orange-500 to-orange-600',
    corHover: 'hover:border-orange-500',
    bg: 'bg-orange-50',
  },
  {
    bem: 'investidor' as BemType,
    icon: TrendingUp,
    titulo: 'Investidor',
    descricao: 'Quero investir e ter retorno',
    cor: 'from-yellow-500 to-amber-600',
    corHover: 'hover:border-yellow-500',
    bg: 'bg-yellow-50',
  },
]

export default function StepBem({ onSelect }: Props) {
  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          O que você quer conquistar?
        </h2>
        <p className="text-gray-500 text-base">
          Veja em segundos quanto você economiza no consórcio
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {OPCOES.map((opcao, i) => {
          const Icon = opcao.icon
          const isInvestidor = opcao.bem === 'investidor'
          return (
            <motion.button
              key={opcao.bem}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => onSelect(opcao.bem)}
              className={`
                ${isInvestidor ? 'col-span-2 flex-row justify-start gap-4 px-6 py-4' : 'flex-col gap-3 p-6'}
                flex items-center rounded-2xl border-2 border-gray-200
                ${opcao.corHover} bg-white cursor-pointer transition-all duration-200
                hover:shadow-lg hover:scale-105 active:scale-95
              `}
            >
              <div className={`p-3 rounded-xl ${opcao.bg} flex-shrink-0`}>
                <div className={`bg-gradient-to-br ${opcao.cor} p-2 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className={isInvestidor ? 'text-left' : 'text-center'}>
                <p className="font-bold text-gray-900 text-base">{opcao.titulo}</p>
                <p className="text-gray-500 text-xs mt-0.5">{opcao.descricao}</p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
