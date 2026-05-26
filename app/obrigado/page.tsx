'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Share2, MessageCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/calculos'

const BEM_LABELS: Record<string, string> = {
  imovel: 'imóvel',
  carro: 'veículo',
  negocio: 'negócio',
  reforma: 'reforma',
}

function ObrigadoContent() {
  const params = useSearchParams()
  const nome = params.get('nome') || 'você'
  const economia = Number(params.get('economia') || 0)
  const bem = params.get('bem') || 'imovel'
  const primeiroNome = nome.split(' ')[0]

  const compartilhar = () => {
    const texto = `🏆 Acabei de descobrir que vou economizar *${formatCurrency(economia)}* usando consórcio em vez de financiamento para comprar meu ${BEM_LABELS[bem] || 'bem'}!\n\nFaça você também a simulação gratuita:`
    const url = `https://wa.me/?text=${encodeURIComponent(texto + ' ' + window.location.origin)}`
    window.open(url, '_blank')
  }

  const falarEspecialista = () => {
    const texto = `Olá! Acabei de fazer uma simulação e vi que posso economizar ${formatCurrency(economia)} no consórcio. Quero saber mais!`
    const url = `https://wa.me/5511993929660?text=${encodeURIComponent(texto)}`
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="flex justify-center mb-6"
        >
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Recebemos, {primeiroNome}! 🎉
          </h1>
          <p className="text-gray-500 mb-8 text-lg">
            Um especialista entrará em contato pelo WhatsApp <strong>em até 2 horas</strong>.
          </p>
        </motion.div>

        {/* Card de economia */}
        {economia > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white mb-6"
          >
            <p className="text-green-100 text-sm mb-1">Sua economia potencial</p>
            <p className="text-4xl font-black mb-1">{formatCurrency(economia)}</p>
            <p className="text-green-100 text-sm">
              Escolhendo consórcio em vez de financiamento
            </p>
          </motion.div>
        )}

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-3"
        >
          <button
            onClick={falarEspecialista}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg text-lg"
          >
            <MessageCircle className="w-5 h-5" />
            Falar no WhatsApp agora
          </button>

          <button
            onClick={compartilhar}
            className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:border-gray-300 transition-all"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar com amigos
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-xs text-gray-400"
        >
          Conhece alguém que também sonha com {BEM_LABELS[bem] || 'um bem'} próprio? Compartilhe a simulação —
          pode ser o melhor presente que você dá hoje. ❤️
        </motion.p>
      </div>
    </div>
  )
}

export default function ObrigadoPage() {
  return (
    <Suspense>
      <ObrigadoContent />
    </Suspense>
  )
}
