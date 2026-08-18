'use client'

import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp, Calendar, MessageCircle } from 'lucide-react'
import { ResultadoCalculo, formatCurrency } from '@/lib/calculos'

interface Props {
  resultado: ResultadoCalculo
  nome?: string
  onContinuar: () => void
  onBack: () => void
}

export default function StepResultado({ resultado, nome, onContinuar, onBack }: Props) {
  const bemLabel = resultado.bem === 'imovel' ? 'imóvel' : resultado.bem === 'carro' ? 'veículo' : resultado.bem

  const abrirWhatsApp = () => {
    const saudacao = nome ? `Olá, sou ${nome}!` : 'Olá!'
    const texto = `${saudacao} Fiz a simulação no site e quero contratar o consórcio de ${bemLabel}.\n\nValor da carta: ${formatCurrency(resultado.valor)}\nParcela: ${formatCurrency(resultado.parcelaConsorcio)}/mês\nEconomia vs financiamento: ${formatCurrency(resultado.economiaTotal)}\n\nPode me ajudar a fechar?`
    window.open(`https://wa.me/5511993929660?text=${encodeURIComponent(texto)}`, '_blank')
  }

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-5"
      >
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold mb-3">
          ✅ Simulação concluída
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Veja a diferença<br />
          <span className="text-red-500">no total que você paga.</span>
        </h2>
      </motion.div>

      {/* Total pago lado a lado — o argumento principal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 gap-3 mb-4"
      >
        {/* Financiamento */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Financiamento</span>
          </div>
          <div className="space-y-2.5">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Parcela mensal</p>
              <p className="font-bold text-red-600 text-xl">{formatCurrency(resultado.parcelaFinanciamento)}</p>
            </div>
            <div className="pt-2 border-t border-red-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total pago em {resultado.prazoFinanciamentoMeses} meses</p>
              <p className="font-black text-red-700 text-lg">{formatCurrency(resultado.totalFinanciamento)}</p>
              <p className="text-[10px] text-red-400 mt-0.5">{formatCurrency(resultado.jurosFinanciamento)} só em juros</p>
            </div>
          </div>
        </div>

        {/* Consórcio */}
        <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingDown className="w-4 h-4 text-green-600" />
            <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Consórcio</span>
          </div>
          <div className="space-y-2.5">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Parcela mensal</p>
              <p className="font-bold text-green-700 text-xl">{formatCurrency(resultado.parcelaConsorcio)}</p>
              <p className="text-[10px] text-green-500 mt-0.5">até a contemplação</p>
            </div>
            <div className="pt-2 border-t border-green-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total pago em {resultado.prazoConsorcioMeses} meses</p>
              <p className="font-black text-green-700 text-lg">{formatCurrency(resultado.totalConsorcio)}</p>
              <p className="text-[10px] text-green-500 mt-0.5">zero juros — taxa admin apenas</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Diferença destacada — simples, sem inflação */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="bg-green-700 rounded-2xl p-4 mb-5 text-center"
      >
        <p className="text-green-200 text-xs uppercase tracking-widest mb-1">Diferença total</p>
        <p className="text-3xl font-black text-white">{formatCurrency(resultado.economiaTotal)}</p>
        <p className="text-green-200 text-sm mt-1">
          {resultado.percentualEconomia}% a menos no consórcio de {bemLabel}
        </p>
      </motion.div>

      {/* CTAs */}
      <div className="flex flex-col gap-3">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onClick={abrirWhatsApp}
          className="w-full flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#1ebe5d] text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg active:scale-95 text-base"
        >
          <MessageCircle className="w-5 h-5" />
          Quero meu contrato agora
        </motion.button>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          onClick={onContinuar}
          className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 font-semibold py-3.5 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-all"
        >
          <Calendar className="w-4 h-4" />
          Prefiro agendar uma reunião
        </motion.button>
      </div>

      <button onClick={onBack} className="mt-3 w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors">
        ← Refazer simulação
      </button>
    </div>
  )
}
