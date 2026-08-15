'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, CheckCircle, ChevronLeft, Loader2, Phone } from 'lucide-react'
import { ResultadoCalculo, formatCurrency } from '@/lib/calculos'

interface Props {
  resultado: ResultadoCalculo
  nome: string
  whatsapp: string
  onBack: () => void
  onSuccess: () => void
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function getNext14Days(): Date[] {
  const days: Date[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d)
  }
  return days
}

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10)
}

function formatSlot(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
}

export default function StepAgendamento({ resultado, nome, whatsapp, onBack, onSuccess }: Props) {
  const [step, setStep] = useState<'escolha' | 'dia' | 'hora' | 'confirmar' | 'carregando' | 'sucesso'>('escolha')
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const days = getNext14Days()

  async function fetchSlots(day: Date) {
    setLoadingSlots(true)
    setSlots([])
    try {
      const res = await fetch(`/api/calendar/availability?date=${toDateStr(day)}`)
      const data = await res.json()
      setSlots(data.slots || [])
    } catch {
      setSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  async function confirmarAgendamento() {
    if (!selectedSlot) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/calendar/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          whatsapp,
          bem: resultado.bem,
          valor: resultado.valor,
          slotIso: selectedSlot,
        }),
      })
      if (res.ok) {
        // GA4 event
        if (typeof window !== 'undefined' && (window as any).gtag) {
          ;(window as any).gtag('event', 'meeting_scheduled', {
            bem: resultado.bem,
            valor: resultado.valor,
          })
        }
        setStep('sucesso')
        setTimeout(onSuccess, 4000)
      }
    } catch {
      // handle silently
    } finally {
      setSubmitting(false)
    }
  }

  // Escolha inicial: agendar ou fechar direto
  if (step === 'escolha') {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎯</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {nome.split(' ')[0]}, como quer prosseguir?
          </h2>
          <p className="text-gray-500 text-sm">
            Carta de {formatCurrency(resultado.valor)} · Parcela a partir de{' '}
            <span className="font-bold text-green-600">
              {formatCurrency(resultado.bem === 'imovel' ? Math.round(resultado.valor * 0.00337) : Math.round(resultado.valor * 0.0073))}
              /mês
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* Opção 1: Agendar reunião */}
          <button
            onClick={() => setStep('dia')}
            className="w-full text-left p-5 rounded-2xl border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 transition-all active:scale-[0.99]"
          >
            <div className="flex items-start gap-4">
              <div className="bg-blue-500 text-white rounded-xl p-2.5 flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-base mb-1">Agendar reunião com consultor</div>
                <div className="text-sm text-gray-500">Escolha um horário na agenda. Em 30 minutos te explico tudo e montamos a melhor proposta para você.</div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  ✓ Sem compromisso · Gratuito
                </div>
              </div>
            </div>
          </button>

          {/* Opção 2: Já quero fechar */}
          <button
            onClick={() => {
              // dispara evento de fechamento direto
              if (typeof window !== 'undefined' && (window as any).gtag) {
                ;(window as any).gtag('event', 'direct_close_intent', { bem: resultado.bem, valor: resultado.valor })
              }
              // redireciona pro whatsapp com mensagem pré-pronta
              const msg = `Olá Gabriel! Fiz a simulação de consórcio de ${resultado.bem === 'imovel' ? 'imóvel' : 'veículo'} no valor de ${formatCurrency(resultado.valor)} e gostei da proposta. Quero dar andamento!`
              window.open(`https://wa.me/5547992666948?text=${encodeURIComponent(msg)}`, '_blank')
            }}
            className="w-full text-left p-5 rounded-2xl border-2 border-green-500 bg-green-50 hover:bg-green-100 transition-all active:scale-[0.99]"
          >
            <div className="flex items-start gap-4">
              <div className="bg-green-500 text-white rounded-xl p-2.5 flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-base mb-1">Já quero fechar agora</div>
                <div className="text-sm text-gray-500">Fale direto comigo no WhatsApp. Já chego com a proposta montada e a gente resolve na hora.</div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  ⚡ Resposta imediata
                </div>
              </div>
            </div>
          </button>
        </div>

        <button onClick={onBack} className="mt-4 w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Voltar à simulação
        </button>
      </motion.div>
    )
  }

  // Escolha de dia
  if (step === 'dia') {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full">
        <button onClick={() => setStep('escolha')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="text-center mb-5">
          <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <h2 className="text-xl font-bold text-gray-900">Escolha o melhor dia</h2>
          <p className="text-gray-500 text-sm">Reunião de 30 minutos · Seg a Dom · 9h30 às 19h</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {days.map((day, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedDay(day)
                fetchSlots(day)
                setStep('hora')
              }}
              className={`p-3 rounded-xl border-2 text-center transition-all hover:border-blue-400 hover:bg-blue-50 ${
                i === 0 ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="text-xs text-gray-500 font-medium">{DIAS_SEMANA[day.getDay()]}</div>
              <div className="text-lg font-bold text-gray-900">{day.getDate()}</div>
              <div className="text-xs text-gray-400">{MESES[day.getMonth()]}</div>
            </button>
          ))}
        </div>
      </motion.div>
    )
  }

  // Escolha de horário
  if (step === 'hora') {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full">
        <button onClick={() => setStep('dia')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="text-center mb-5">
          <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <h2 className="text-xl font-bold text-gray-900">
            {selectedDay && `${DIAS_SEMANA[selectedDay.getDay()]}, ${selectedDay.getDate()} de ${MESES[selectedDay.getMonth()]}`}
          </h2>
          <p className="text-gray-500 text-sm">Horários disponíveis</p>
        </div>

        {loadingSlots ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>Sem horários disponíveis neste dia.</p>
            <button onClick={() => setStep('dia')} className="mt-3 text-blue-500 text-sm font-medium">Escolher outro dia</button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot, i) => (
              <button
                key={i}
                onClick={() => { setSelectedSlot(slot); setStep('confirmar') }}
                className="py-3 px-2 rounded-xl border-2 border-gray-200 text-center font-bold text-gray-800 hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                {formatSlot(slot)}
              </button>
            ))}
          </div>
        )}
      </motion.div>
    )
  }

  // Confirmação
  if (step === 'confirmar') {
    const slotDate = selectedSlot ? new Date(selectedSlot) : null
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <button onClick={() => setStep('hora')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="text-center mb-6">
          <div className="text-3xl mb-2">📅</div>
          <h2 className="text-xl font-bold text-gray-900">Confirmar agendamento</h2>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 mb-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Nome</span>
            <span className="font-semibold text-gray-900">{nome}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">WhatsApp</span>
            <span className="font-semibold text-gray-900">{whatsapp}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Produto</span>
            <span className="font-semibold text-gray-900">Consórcio {resultado.bem === 'imovel' ? 'Imóvel' : 'Veículo'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Carta</span>
            <span className="font-semibold text-gray-900">{formatCurrency(resultado.valor)}</span>
          </div>
          <div className="h-px bg-blue-200" />
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Data</span>
            <span className="font-bold text-blue-700">
              {slotDate && `${DIAS_SEMANA[slotDate.getDay()]}, ${slotDate.getDate()} de ${MESES[slotDate.getMonth()]}`}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Horário</span>
            <span className="font-bold text-blue-700">{selectedSlot && formatSlot(selectedSlot)}</span>
          </div>
        </div>

        <button
          onClick={confirmarAgendamento}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold py-4 rounded-xl transition-all text-lg"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : '✓ Confirmar reunião'}
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">Você receberá a confirmação pelo WhatsApp</p>
      </motion.div>
    )
  }

  // Sucesso
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center py-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      </motion.div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Reunião confirmada! 🎉</h2>
      <p className="text-gray-500 mb-4">
        {nome.split(' ')[0]}, sua reunião está agendada. <br />
        Vou entrar em contato pelo WhatsApp para confirmar.
      </p>
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
        📲 Fique de olho no WhatsApp — em breve você recebe a confirmação.
      </div>
    </motion.div>
  )
}
