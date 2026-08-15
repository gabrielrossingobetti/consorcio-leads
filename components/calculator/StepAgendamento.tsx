'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, CheckCircle, ChevronLeft, Loader2, MessageCircle } from 'lucide-react'
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

function toDateStr(d: Date) { return d.toISOString().slice(0, 10) }

function formatSlot(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
}

function getAllSlots(date: Date): string[] {
  const slots: string[] = []
  for (let m = 9 * 60 + 30; m < 19 * 60; m += 30) {
    const d = new Date(date)
    d.setUTCHours(Math.floor(m / 60) + 3, m % 60, 0, 0)
    slots.push(d.toISOString())
  }
  return slots
}

function getBlockedSlots(date: Date, allSlots: string[]): Set<string> {
  const seed = date.getDate() + date.getMonth() * 31
  const blocked = new Set<string>()
  allSlots.forEach((slot, i) => {
    if ((seed * 31 + i * 17) % 100 < 35) blocked.add(slot)
  })
  return blocked
}

function logFunil(evento: string, extra: Record<string, unknown> = {}) {
  fetch('/api/funil', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ evento, ...extra }),
  }).catch(() => {})
}

type Step =
  | 'escolha'
  | 'dia' | 'hora' | 'confirmar' | 'sucesso'
  | 'proposta_form' | 'proposta_sucesso'

export default function StepAgendamento({ resultado, nome, whatsapp, onBack, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('escolha')
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const days = getNext14Days()
  const ctx = { bem: resultado.bem, valor: resultado.valor, nome, whatsapp }

  useEffect(() => { logFunil('step_escolha', ctx) }, [])

  const bemLabel = resultado.bem === 'imovel' ? 'imóvel' : resultado.bem === 'carro' ? 'veículo' : resultado.bem

  async function fetchSlots(day: Date) {
    setLoadingSlots(true)
    setSlots([])
    try {
      const res = await fetch(`/api/calendar/availability?date=${toDateStr(day)}`)
      const data = await res.json()
      setSlots(data.slots || [])
    } catch { setSlots([]) }
    finally { setLoadingSlots(false) }
  }

  async function confirmarAgendamento() {
    if (!selectedSlot) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/calendar/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, whatsapp, bem: resultado.bem, valor: resultado.valor, slotIso: selectedSlot }),
      })
      if (res.ok) {
        if (typeof window !== 'undefined' && (window as any).gtag) {
          ;(window as any).gtag('event', 'meeting_scheduled', { bem: resultado.bem, valor: resultado.valor })
        }
        logFunil('reuniao_confirmada', ctx)
        setStep('sucesso')
        setTimeout(onSuccess, 4000)
      }
    } catch { }
    finally { setSubmitting(false) }
  }

  function enviarProposta() {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', 'direct_close_intent', { bem: resultado.bem, valor: resultado.valor })
    }
    logFunil('proposta_enviada', { ...ctx, cpf, email })

    // Salva no Supabase via API (não bloqueia)
    fetch('/api/ficha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bem: resultado.bem, valor: resultado.valor, nome, telefone: whatsapp, cpf, email }),
    }).catch(() => {})

    // Mensagem sai da pessoa, não do sistema
    const msg = [
      `Olá Gabriel, sou ${nome}.`,
      `Fiz a simulação de consórcio de ${bemLabel} na Indica Consórcio e gostaria de fazer uma carta de crédito de ${formatCurrency(resultado.valor)}.`,
      ``,
      `CPF: ${cpf}`,
      `E-mail: ${email}`,
      `WhatsApp: ${whatsapp}`,
    ].join('\n')

    window.open(`https://wa.me/5547992666948?text=${encodeURIComponent(msg)}`, '_blank')
    setStep('proposta_sucesso')
  }

  function abrirDuvidas() {
    logFunil('clicou_duvidas', ctx)
    const msg = `Olá Gabriel! Fiz uma simulação de consórcio de ${bemLabel} no valor de ${formatCurrency(resultado.valor)} na Indica Consórcio e tenho algumas dúvidas.`
    window.open(`https://wa.me/5547992666948?text=${encodeURIComponent(msg)}`, '_blank')
  }

  // ─── ESCOLHA ──────────────────────────────────────────────────────────────
  if (step === 'escolha') {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎯</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {nome.split(' ')[0]}, como quer prosseguir?
          </h2>
          <p className="text-gray-500 text-sm">
            Carta de {formatCurrency(resultado.valor)} · {bemLabel}
          </p>
        </div>

        <div className="flex flex-col gap-3">

          {/* Opção 1: Agendar bate-papo */}
          <button
            onClick={() => { logFunil('clicou_agendar', ctx); setStep('dia') }}
            className="w-full text-left p-5 rounded-2xl border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 transition-all active:scale-[0.99]"
          >
            <div className="flex items-start gap-4">
              <div className="bg-blue-500 text-white rounded-xl p-2.5 flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-base mb-1">Agendar bate-papo</div>
                <div className="text-sm text-gray-500">Escolha um horário. O administrativo confirma pelo WhatsApp. Conversa de 10 minutos.</div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  ✓ Sem compromisso · Gratuito
                </div>
              </div>
            </div>
          </button>

          {/* Opção 2: Quero minha proposta */}
          <button
            onClick={() => { logFunil('clicou_proposta', ctx); setStep('proposta_form') }}
            className="w-full text-left p-5 rounded-2xl border-2 border-green-500 bg-green-50 hover:bg-green-100 transition-all active:scale-[0.99]"
          >
            <div className="flex items-start gap-4">
              <div className="bg-green-500 text-white rounded-xl p-2.5 flex-shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-base mb-1">Quero minha proposta</div>
                <div className="text-sm text-gray-500">Direcionamos você para a administradora com a melhor condição disponível.</div>
              </div>
            </div>
          </button>

          {/* Opção 3: Tirar dúvidas */}
          <button
            onClick={abrirDuvidas}
            className="w-full text-left p-5 rounded-2xl border-2 border-gray-200 bg-white hover:bg-gray-50 transition-all active:scale-[0.99]"
          >
            <div className="flex items-start gap-4">
              <div className="bg-gray-700 text-white rounded-xl p-2.5 flex-shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-base mb-1">Tirar uma dúvida</div>
                <div className="text-sm text-gray-500">Fale pelo WhatsApp antes de decidir.</div>
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

  // ─── PROPOSTA FORM (CPF + Email) ──────────────────────────────────────────
  if (step === 'proposta_form') {
    const inputClass = 'w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors'

    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <button onClick={() => setStep('escolha')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-5 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="text-center mb-6">
          <div className="text-4xl mb-3">📋</div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Só mais dois dados</h2>
          <p className="text-gray-500 text-sm">
            {nome.split(' ')[0]}, seu nome e telefone já estão.<br />
            Precisamos do CPF e e-mail para montar a proposta.
          </p>
        </div>

        {/* Resumo da simulação */}
        <div className="bg-gray-50 rounded-xl p-4 mb-5 flex justify-between text-sm">
          <div>
            <p className="text-xs text-gray-400">Produto</p>
            <p className="font-semibold text-gray-800">Consórcio {bemLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Carta de crédito</p>
            <p className="font-bold text-green-700">{formatCurrency(resultado.valor)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">CPF</label>
            <input
              className={inputClass}
              value={cpf}
              onChange={e => {
                const nums = e.target.value.replace(/\D/g, '').slice(0, 11)
                const f = nums.length <= 3 ? nums : nums.length <= 6 ? `${nums.slice(0,3)}.${nums.slice(3)}` : nums.length <= 9 ? `${nums.slice(0,3)}.${nums.slice(3,6)}.${nums.slice(6)}` : `${nums.slice(0,3)}.${nums.slice(3,6)}.${nums.slice(6,9)}-${nums.slice(9)}`
                setCpf(f)
              }}
              placeholder="000.000.000-00"
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">E-mail</label>
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              inputMode="email"
            />
          </div>
        </div>

        <button
          onClick={enviarProposta}
          disabled={cpf.replace(/\D/g, '').length < 11 || !email.includes('@')}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl text-base transition-all"
        >
          Enviar pelo WhatsApp →
        </button>
        <p className="text-center text-xs text-gray-400 mt-2">Abre o WhatsApp com a mensagem pronta para enviar</p>
      </motion.div>
    )
  }

  // ─── PROPOSTA SUCESSO ─────────────────────────────────────────────────────
  if (step === 'proposta_sucesso') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center py-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mensagem enviada!</h2>
        <p className="text-gray-500 mb-4">
          {nome.split(' ')[0]}, em breve você recebe o retorno<br />com a proposta completa.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
          📲 Fique de olho no WhatsApp.
        </div>
      </motion.div>
    )
  }

  // ─── DIA ──────────────────────────────────────────────────────────────────
  if (step === 'dia') {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full">
        <button onClick={() => setStep('escolha')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="text-center mb-5">
          <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <h2 className="text-xl font-bold text-gray-900">Escolha o melhor dia</h2>
          <p className="text-gray-500 text-sm">Bate-papo de 10 minutos · Seg a Dom · 9h30 às 19h</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {days.map((day, i) => (
            <button key={i} onClick={() => { setSelectedDay(day); fetchSlots(day); setStep('hora') }}
              className="p-3 rounded-xl border-2 border-gray-200 text-center transition-all hover:border-blue-400 hover:bg-blue-50">
              <div className="text-xs text-gray-500 font-medium">{DIAS_SEMANA[day.getDay()]}</div>
              <div className="text-lg font-bold text-gray-900">{day.getDate()}</div>
              <div className="text-xs text-gray-400">{MESES[day.getMonth()]}</div>
            </button>
          ))}
        </div>
      </motion.div>
    )
  }

  // ─── HORA ─────────────────────────────────────────────────────────────────
  if (step === 'hora') {
    const allDaySlots = selectedDay ? getAllSlots(selectedDay) : []
    const blockedSlots = selectedDay ? getBlockedSlots(selectedDay, allDaySlots) : new Set<string>()

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
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              {allDaySlots.map((slot, i) => {
                const available = slots.includes(slot) && !blockedSlots.has(slot)
                return available ? (
                  <button key={i} onClick={() => { setSelectedSlot(slot); setStep('confirmar') }}
                    className="py-3 px-2 rounded-xl border-2 border-gray-200 text-center font-bold text-gray-800 hover:border-blue-500 hover:bg-blue-50 transition-all">
                    {formatSlot(slot)}
                  </button>
                ) : (
                  <div key={i} className="py-3 px-2 rounded-xl border-2 border-red-100 bg-red-50 text-center cursor-not-allowed">
                    <div className="font-bold text-red-300 text-sm">{formatSlot(slot)}</div>
                    <div className="text-xs text-red-200 mt-0.5">Ocupado</div>
                  </div>
                )
              })}
            </div>
            {allDaySlots.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p>Sem horários neste dia.</p>
                <button onClick={() => setStep('dia')} className="mt-3 text-blue-500 text-sm font-medium">Escolher outro dia</button>
              </div>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 justify-center">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-200 inline-block" /> Ocupado</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-200 border border-gray-300 inline-block" /> Disponível</span>
            </div>
          </>
        )}
      </motion.div>
    )
  }

  // ─── CONFIRMAR ────────────────────────────────────────────────────────────
  if (step === 'confirmar') {
    const slotDate = selectedSlot ? new Date(selectedSlot) : null
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <button onClick={() => setStep('hora')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">📅</div>
          <h2 className="text-xl font-bold text-gray-900">Confirmar bate-papo</h2>
        </div>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 mb-5 space-y-3">
          {[
            ['Nome', nome],
            ['WhatsApp', whatsapp],
            ['Produto', `Consórcio ${bemLabel}`],
            ['Carta', formatCurrency(resultado.valor)],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="font-semibold text-gray-900">{value}</span>
            </div>
          ))}
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
        <button onClick={confirmarAgendamento} disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold py-4 rounded-xl transition-all text-lg">
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : '✓ Confirmar bate-papo'}
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">O administrativo confirma pelo WhatsApp</p>
      </motion.div>
    )
  }

  // ─── SUCESSO (agendamento) ─────────────────────────────────────────────────
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center py-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      </motion.div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Bate-papo confirmado!</h2>
      <p className="text-gray-500 mb-4">
        {nome.split(' ')[0]}, tudo certo.<br />
        O administrativo vai confirmar pelo WhatsApp.
      </p>
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
        📲 Fique de olho no WhatsApp — a confirmação chega em breve.
      </div>
    </motion.div>
  )
}
