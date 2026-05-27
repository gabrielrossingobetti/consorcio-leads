'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BemType, formatCurrency, CONFIG_BENS } from '@/lib/calculos'
import { ChevronRight } from 'lucide-react'

interface Props {
  bem: BemType
  onConfirm: (valor: number) => void
  onBack: () => void
}

const RANGES: Record<BemType, { min: number; max: number; step: number; default: number }> = {
  imovel:     { min: 100000, max: 1500000, step: 10000, default: 350000 },
  carro:      { min: 30000,  max: 300000,  step: 5000,  default: 80000  },
  negocio:    { min: 50000,  max: 500000,  step: 10000, default: 150000 },
  reforma:    { min: 20000,  max: 200000,  step: 5000,  default: 60000  },
  investidor: { min: 50000,  max: 500000,  step: 10000, default: 100000 },
}

export default function StepValor({ bem, onConfirm, onBack }: Props) {
  const range = RANGES[bem]
  const [valor, setValor] = useState(range.default)
  const config = CONFIG_BENS[bem]
  const percent = ((valor - range.min) / (range.max - range.min)) * 100

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {bem === 'investidor' ? 'Qual o valor da carta que deseja contratar?' : `Qual o valor do seu ${config.label.toLowerCase()}?`}
        </h2>
        <p className="text-gray-500 text-base">Arraste para ajustar</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        <div className="text-center mb-6">
          <span className="text-5xl font-black text-blue-600">
            {formatCurrency(valor)}
          </span>
        </div>

        <div className="relative">
          <input
            type="range"
            min={range.min}
            max={range.max}
            step={range.step}
            value={valor}
            onChange={(e) => setValor(Number(e.target.value))}
            className="w-full h-3 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #2563eb ${percent}%, #e2e8f0 ${percent}%)`,
            }}
          />
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>{formatCurrency(range.min)}</span>
            <span>{formatCurrency(range.max)}</span>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-gray-300 transition-all"
        >
          Voltar
        </button>
        <button
          onClick={() => onConfirm(valor)}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg active:scale-95"
        >
          Calcular agora
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
