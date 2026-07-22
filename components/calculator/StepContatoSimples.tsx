'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, User, Lock, ChevronRight, Loader2 } from 'lucide-react'

function formatPhone(value: string): string {
  const nums = value.replace(/\D/g, '').slice(0, 11)
  if (nums.length <= 2) return nums
  if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`
}

interface Props {
  onSubmit: (nome: string, whatsapp: string) => Promise<void>
  onBack: () => void
}

export default function StepContatoSimples({ onSubmit, onBack }: Props) {
  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (nome.trim().length < 2) { setErro('Digite seu nome completo'); return }
    if (whatsapp.replace(/\D/g, '').length < 10) { setErro('WhatsApp inválido'); return }
    setErro('')
    setLoading(true)
    try {
      await onSubmit(nome.trim(), whatsapp.replace(/\D/g, ''))
    } catch {
      setErro('Algo deu errado. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Quase lá! Veja sua simulação
        </h2>
        <p className="text-gray-500 text-sm">
          Informe seus dados para liberar o resultado e receber sua proposta personalizada.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Seu nome</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Como podemos te chamar?"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-red-500 outline-none transition-colors text-gray-900 placeholder-gray-400"
              required
            />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              placeholder="(00) 00000-0000"
              value={whatsapp}
              onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-red-500 outline-none transition-colors text-gray-900 placeholder-gray-400"
              required
            />
          </div>
        </motion.div>

        {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 text-xs text-gray-400"
        >
          <Lock className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Seus dados são privados. Nunca compartilhamos com terceiros.</span>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg active:scale-95 text-lg"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Ver minha simulação
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </form>

      <button onClick={onBack} className="mt-3 w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors">
        ← Voltar
      </button>
    </div>
  )
}
