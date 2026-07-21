'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp, Clock, ChevronRight, Share2 } from 'lucide-react'
import { ResultadoCalculo, formatCurrency } from '@/lib/calculos'

interface Props {
  resultado: ResultadoCalculo
  onContinuar: () => void
  onBack: () => void
}

function AnimatedNumber({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const duration = 1500
    const steps = 60
    const increment = target / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      setCurrent(Math.min(Math.round(increment * step), target))
      if (step >= steps) clearInterval(timer)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [target])

  return <span>{prefix}{current.toLocaleString('pt-BR')}{suffix}</span>
}

export default function StepResultado({ resultado, onContinuar, onBack }: Props) {
  const compartilhar = () => {
    const texto = `🏆 Descobri que posso economizar *${formatCurrency(resultado.economiaTotal)}* usando consórcio em vez de financiamento!\n\nNo financiamento pagaria: ${formatCurrency(resultado.totalFinanciamento)}\nNo consórcio pago: ${formatCurrency(resultado.totalConsorcio)}\n\n✅ *Diferença: ${formatCurrency(resultado.economiaTotal)}*\n\nFaça você também: ${window.location.origin}`
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`
    window.open(url, '_blank')
  }

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold mb-3">
          ✅ Cálculo concluído
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Sua simulação está pronta.<br />
          <span className="text-red-500">Veja a diferença.</span>
        </h2>
      </motion.div>

      {/* Card de economia principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white text-center mb-4"
      >
        <p className="text-green-100 text-sm font-medium mb-1">Você economiza</p>
        <p className="text-4xl md:text-5xl font-black mb-1">
          <AnimatedNumber target={resultado.economiaTotal} prefix="R$ " />
        </p>
        <p className="text-green-100 text-sm">
          {resultado.percentualEconomia}% a menos que no financiamento
        </p>
        <div className="mt-3 pt-3 border-t border-green-400 text-xs text-green-100">
          Isso equivale a <strong className="text-white">{resultado.anosAluguelEconomizados} anos de aluguel</strong> que você não vai gastar
        </div>
      </motion.div>

      {/* Comparativo lado a lado */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-2 gap-3 mb-4"
      >
        {/* Financiamento */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Financiamento</span>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-[10px] text-gray-500 uppercase">Parcela</p>
              <p className="font-bold text-red-600 text-lg">{formatCurrency(resultado.parcelaFinanciamento)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase">Total pago</p>
              <p className="font-bold text-red-700">{formatCurrency(resultado.totalFinanciamento)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase">Só de juros</p>
              <p className="font-semibold text-red-500 text-sm">{formatCurrency(resultado.jurosFinanciamento)}</p>
            </div>
          </div>
        </div>

        {/* Consórcio */}
        <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-4 relative mt-3">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">✓ MELHOR OPÇÃO</span>
          </div>
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingDown className="w-4 h-4 text-green-600" />
            <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Consórcio</span>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-[10px] text-gray-500 uppercase">Parcela</p>
              <p className="font-bold text-green-600 text-lg">{formatCurrency(resultado.parcelaConsorcio)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase">Total pago</p>
              <p className="font-bold text-green-700">{formatCurrency(resultado.totalConsorcio)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase">Zero juros</p>
              <p className="font-semibold text-green-500 text-sm">Taxa admin apenas</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tempo de contemplação */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6"
      >
        <Clock className="w-5 h-5 text-blue-500 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          <strong>Tempo de contemplação:</strong> entre 1 e 36 meses — por sorteio ou lance
        </p>
      </motion.div>

      {/* CTAs */}
      <div className="flex flex-col gap-3">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={onContinuar}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg active:scale-95 text-lg"
        >
          Quero receber minha proposta
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
