'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

interface Props {
  onConfirm: (meses: number) => void
  onBack: () => void
}

export default function StepMesesInvestidor({ onConfirm, onBack }: Props) {
  const [meses, setMeses] = useState(12)
  const percent = ((meses - 1) / (40 - 1)) * 100

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Sua estimativa de contemplação
        </h2>
        <p className="text-gray-500 text-base">
          Quanto antes contemplar, maior o lucro
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        <div className="text-center mb-6">
          <span className="text-5xl font-black text-yellow-600">{meses}</span>
          <span className="text-2xl font-bold text-gray-500 ml-2">meses</span>
        </div>

        <div className="relative">
          <input
            type="range"
            min={1}
            max={40}
            step={1}
            value={meses}
            onChange={(e) => setMeses(Number(e.target.value))}
            className="w-full h-3 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #eab308 ${percent}%, #e2e8f0 ${percent}%)`,
            }}
          />
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>1 mês</span>
            <span>40 meses</span>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-xs text-yellow-700 font-semibold">
            ⚡ O lance embutido de 25% acelera sua contemplação. O prazo exato depende das assembleias mensais — pode ser antes!
          </p>
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
          onClick={() => onConfirm(meses)}
          className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg active:scale-95"
        >
          Ver meu retorno
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
