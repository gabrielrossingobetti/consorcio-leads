'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Share2, TrendingUp, ArrowRight } from 'lucide-react'
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
    const texto =
      `💰 Olha o que descobri sobre consórcio como investimento!\n\n` +
      `📥 *Invisto:* ${formatCurrency(resultado.totalParcelasPagas)}\n` +
      `📤 *Recebo:* ${formatCurrency(resultado.valorRecebido)}\n` +
      `🏆 *Lucro:* *${formatCurrency(resultado.lucroLiquido)}* (${resultado.retornoPercent}% de retorno)\n\n` +
      `Simule você também: ${window.location.origin}`
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
  }

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-5"
      >
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-sm font-bold mb-3">
          <TrendingUp className="w-4 h-4" /> Simulação de investimento
        </div>
        <h2 className="text-2xl font-black text-gray-900">
          Seu dinheiro <span className="text-amber-500">trabalhando por você</span>
        </h2>
      </motion.div>

      {/* 3 números impactantes */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-900 rounded-2xl p-5 mb-4"
      >
        <div className="flex items-center justify-between gap-2">
          {/* Investe */}
          <div className="text-center flex-1">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">Você investe</p>
            <p className="text-white font-black text-xl">{formatCurrency(resultado.totalParcelasPagas)}</p>
            <p className="text-gray-500 text-[10px] mt-0.5">{resultado.mesesEstimados} parcelas</p>
          </div>

          <ArrowRight className="w-5 h-5 text-amber-500 flex-shrink-0" />

          {/* Recebe */}
          <div className="text-center flex-1">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">Você recebe</p>
            <p className="text-amber-400 font-black text-xl">{formatCurrency(resultado.valorRecebido)}</p>
            <p className="text-gray-500 text-[10px] mt-0.5">já c/ valorização</p>
          </div>

          <ArrowRight className="w-5 h-5 text-green-500 flex-shrink-0" />

          {/* Lucro */}
          <div className="text-center flex-1">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">Lucro</p>
            <p className="text-green-400 font-black text-xl">{formatCurrency(resultado.lucroLiquido)}</p>
            <p className="text-green-500 text-[10px] font-bold mt-0.5">+{resultado.retornoPercent}%</p>
          </div>
        </div>
      </motion.div>

      {/* Card destaque de lucro */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white text-center mb-4"
      >
        <p className="text-amber-100 text-sm font-medium mb-1">Lucro estimado com valorização de 6% a.a.</p>
        <p className="text-4xl md:text-5xl font-black mb-1">
          <AnimatedNumber target={resultado.lucroLiquido} prefix="R$ " />
        </p>
        <p className="text-amber-100 text-sm">
          Retorno de <strong className="text-white">{resultado.retornoPercent}%</strong> sobre o que você investiu
        </p>
        {resultado.valorizacaoGanha > 0 && (
          <div className="mt-3 pt-3 border-t border-amber-400 text-xs text-amber-100">
            💹 Valorização da carta em {resultado.mesesEstimados} meses: <strong className="text-white">+{formatCurrency(resultado.valorizacaoGanha)}</strong>
          </div>
        )}
      </motion.div>

      {/* Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-5 space-y-2.5"
      >
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Como seu dinheiro cresce</p>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Carta contratada</span>
          <span className="font-bold text-gray-900">{formatCurrency(resultado.carta)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Lance embutido (25%)</span>
          <span className="text-sm font-semibold text-gray-500">− {formatCurrency(resultado.lanceEmbutido)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Carta líquida inicial</span>
          <span className="font-bold text-gray-900">{formatCurrency(resultado.cartaLiquida)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Valorização 6% a.a. ({resultado.mesesEstimados} meses)</span>
          <span className="font-semibold text-amber-600">+ {formatCurrency(resultado.valorizacaoGanha)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2.5 flex justify-between items-center">
          <span className="text-sm text-gray-600">Parcelas pagas ({resultado.mesesEstimados} × {formatCurrency(resultado.parcelaReduzida)})</span>
          <span className="font-bold text-red-500">− {formatCurrency(resultado.totalParcelasPagas)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Indica Consórcio compra sua carta (40%)</span>
          <span className="font-bold text-green-600">+ {formatCurrency(resultado.valorRecebido)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2.5 flex justify-between items-center">
          <span className="font-black text-gray-900">Lucro líquido</span>
          <span className="font-black text-amber-600 text-xl">{formatCurrency(resultado.lucroLiquido)}</span>
        </div>
      </motion.div>

      <div className="flex flex-col gap-3">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={onContinuar}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg active:scale-95 text-lg"
        >
          Quero colocar meu dinheiro pra trabalhar
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
