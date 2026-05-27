'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, ChevronRight, Share2 } from 'lucide-react'
import { ResultadoInvestidor, formatCurrency } from '@/lib/calculos'

interface Props {
  resultado: ResultadoInvestidor
  onContinuar: () => void
  onBack: () => void
}

function AnimatedNumber({ target, prefix = '' }: { target: number; prefix?: string }) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const steps = 60
    const increment = target / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      setCurrent(Math.min(Math.round(increment * step), target))
      if (step >= steps) clearInterval(timer)
    }, 1500 / steps)
    return () => clearInterval(timer)
  }, [target])
  return <span>{prefix}{current.toLocaleString('pt-BR')}</span>
}

export default function StepResultadoInvestidor({ resultado, onContinuar, onBack }: Props) {
  const compartilhar = () => {
    const texto = `💰 Descobri uma forma de investir em consórcio e ter retorno de *${resultado.retornoPercent}%*!\n\nInvesti: ${formatCurrency(resultado.totalParcelasPagas)}\nRecebi: ${formatCurrency(resultado.valorRecebido)}\nLucro: *${formatCurrency(resultado.lucroLiquido)}*\n\nVeja você também: ${window.location.origin}`
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
  }

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full text-sm font-bold mb-3">
          💰 Simulação de investimento
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Seu dinheiro <span className="text-yellow-600">trabalhando</span> por você
        </h2>
      </motion.div>

      {/* Card principal de lucro */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-6 text-white text-center mb-4"
      >
        <p className="text-yellow-100 text-sm font-medium mb-1">Lucro estimado</p>
        <p className="text-4xl md:text-5xl font-black mb-1">
          <AnimatedNumber target={resultado.lucroLiquido} prefix="R$ " />
        </p>
        <p className="text-yellow-100 text-sm">
          Retorno de {resultado.retornoPercent}% sobre o valor investido
        </p>
        <div className="mt-3 pt-3 border-t border-yellow-400 text-xs text-yellow-100">
          Carta de <strong className="text-white">{formatCurrency(resultado.carta)}</strong> com lance embutido de 25% — sem usar dinheiro do bolso
        </div>
      </motion.div>

      {/* Breakdown do investimento */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 space-y-3"
      >
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Como funciona</p>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Valor da carta</span>
          <span className="font-bold text-gray-900">{formatCurrency(resultado.carta)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Lance embutido (25%)</span>
          <span className="font-bold text-gray-500">− {formatCurrency(resultado.lanceEmbutido)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Carta líquida</span>
          <span className="font-bold text-gray-900">{formatCurrency(resultado.cartaLiquida)}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
          <span className="text-sm text-gray-600">Parcelas pagas ({resultado.mesesEstimados} meses × {formatCurrency(resultado.parcelaReduzida)})</span>
          <span className="font-bold text-red-500">− {formatCurrency(resultado.totalParcelasPagas)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Ademicon compra sua carta (40%)</span>
          <span className="font-bold text-green-600">+ {formatCurrency(resultado.valorRecebido)}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
          <span className="font-bold text-gray-900">Lucro líquido</span>
          <span className="font-black text-yellow-600 text-lg">{formatCurrency(resultado.lucroLiquido)}</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6"
      >
        <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800">
          <strong>Potencial ainda maior:</strong> a carta valoriza ~6% ao ano. Se contemplado antes dos {resultado.mesesEstimados} meses, o lucro aumenta. Um especialista pode detalhar sua estratégia.
        </p>
      </motion.div>

      <div className="flex flex-col gap-3">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={onContinuar}
          className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg active:scale-95 text-lg"
        >
          Quero investir {formatCurrency(resultado.carta)}
          <ChevronRight className="w-5 h-5" />
        </motion.button>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={compartilhar}
          className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:border-gray-300 transition-all"
        >
          <Share2 className="w-4 h-4" />
          Compartilhar no WhatsApp
        </motion.button>
      </div>

      <button onClick={onBack} className="mt-3 w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors">
        ← Refazer simulação
      </button>
    </div>
  )
}
