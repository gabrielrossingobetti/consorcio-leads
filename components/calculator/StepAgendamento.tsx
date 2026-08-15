'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, CheckCircle, ChevronLeft, Loader2, Phone } from 'lucide-react'
import { ResultadoCalculo, formatCurrency } from '@/lib/calculos'

interface FichaForm {
  nome: string; cpf: string; nascimento: string; estado_civil: string
  nome_mae: string; nacionalidade: string; profissao: string; renda: string
  telefone: string; email: string; endereco: string; cidade: string
  cep: string; bairro: string
}

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

const FICHA_EMPTY: FichaForm = {
  nome: '', cpf: '', nascimento: '', estado_civil: '',
  nome_mae: '', nacionalidade: '', profissao: '', renda: '',
  telefone: '', email: '', endereco: '', cidade: '', cep: '', bairro: '',
}

type Step =
  | 'escolha'
  | 'dia' | 'hora' | 'confirmar' | 'carregando' | 'sucesso'
  | 'fechar_intro' | 'fechar_form' | 'fechar_sucesso'

function logFunil(evento: string, extra: Record<string, unknown> = {}) {
  fetch('/api/funil', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ evento, ...extra }),
  }).catch(() => {})
}

export default function StepAgendamento({ resultado, nome, whatsapp, onBack, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('escolha')
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [ficha, setFicha] = useState<FichaForm>({ ...FICHA_EMPTY, nome, telefone: whatsapp })
  const days = getNext14Days()
  const ctx = { bem: resultado.bem, valor: resultado.valor, nome, whatsapp }

  // loga quando o usuário chega na tela de escolha
  useEffect(() => { logFunil('step_escolha', ctx) }, [])

  function setField(key: keyof FichaForm, value: string) {
    setFicha(prev => ({ ...prev, [key]: value }))
  }

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
    } catch {
      // silence
    } finally {
      setSubmitting(false)
    }
  }

  async function enviarFicha() {
    setSubmitting(true)
    try {
      await fetch('/api/ficha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bem: resultado.bem,
          valor: resultado.valor,
          ...ficha,
          renda: ficha.renda ? Number(ficha.renda.replace(/\D/g, '')) / 100 : null,
        }),
      })

      const msg = [
        `*📋 Nova ficha cadastral — ${resultado.bem === 'imovel' ? 'Imóvel' : 'Veículo'}*`,
        `Carta: *${formatCurrency(resultado.valor)}*`,
        ``,
        `*Dados Pessoais*`,
        `Nome: ${ficha.nome}`,
        `CPF: ${ficha.cpf}`,
        `Nascimento: ${ficha.nascimento}`,
        `Estado Civil: ${ficha.estado_civil}`,
        `Nome da Mãe: ${ficha.nome_mae}`,
        `Nacionalidade: ${ficha.nacionalidade}`,
        ``,
        `*Trabalho e Renda*`,
        `Profissão: ${ficha.profissao}`,
        `Renda: R$ ${ficha.renda}`,
        ``,
        `*Contato*`,
        `Telefone: ${ficha.telefone}`,
        `E-mail: ${ficha.email}`,
        ``,
        `*Endereço*`,
        `${ficha.endereco}, ${ficha.bairro}`,
        `${ficha.cidade} — CEP: ${ficha.cep}`,
      ].join('\n')

      logFunil('ficha_enviada', { ...ctx, nome: ficha.nome, whatsapp: ficha.telefone })
      window.open(`https://wa.me/5547992666948?text=${encodeURIComponent(msg)}`, '_blank')
      setStep('fechar_sucesso')
    } catch {
      // silence
    } finally {
      setSubmitting(false)
    }
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
            Carta de {formatCurrency(resultado.valor)} · Sem juros, sem entrada obrigatória
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => { logFunil('clicou_agendar', ctx); setStep('dia') }}
            className="w-full text-left p-5 rounded-2xl border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 transition-all active:scale-[0.99]"
          >
            <div className="flex items-start gap-4">
              <div className="bg-blue-500 text-white rounded-xl p-2.5 flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-base mb-1">Agendar reunião com consultor</div>
                <div className="text-sm text-gray-500">Escolha um horário na agenda. Em 30 minutos te explico tudo e montamos a melhor proposta.</div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  ✓ Sem compromisso · Gratuito
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).gtag) {
                ;(window as any).gtag('event', 'direct_close_intent', { bem: resultado.bem, valor: resultado.valor })
              }
              logFunil('clicou_fechar', ctx)
              setStep('fechar_intro')
            }}
            className="w-full text-left p-5 rounded-2xl border-2 border-green-500 bg-green-50 hover:bg-green-100 transition-all active:scale-[0.99]"
          >
            <div className="flex items-start gap-4">
              <div className="bg-green-500 text-white rounded-xl p-2.5 flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-base mb-1">Quero entrar</div>
                <div className="text-sm text-gray-500">Já decidi. Preencho a ficha e aguardo o contato do consultor para assinar.</div>
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

  // ─── FECHAR INTRO ─────────────────────────────────────────────────────────
  if (step === 'fechar_intro') {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <button onClick={() => setStep('escolha')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="text-center mb-6">
          <div className="text-5xl mb-3">📝</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quase lá!</h2>
          <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
            Para subir o seu contrato, o consultor precisa de alguns dados cadastrais.<br />
            <span className="font-semibold text-gray-800">Leva menos de 2 minutos.</span>
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2">
          {[
            { icon: '🔒', text: 'Seus dados ficam seguros e não são compartilhados' },
            { icon: '📞', text: 'O consultor entra em contato pelo seu WhatsApp' },
            { icon: '✅', text: 'Sem burocracia — processo 100% digital' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-gray-600">
              <span className="text-base">{icon}</span>
              {text}
            </div>
          ))}
        </div>

        <button
          onClick={() => { logFunil('fechar_form_abriu', ctx); setStep('fechar_form') }}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-lg transition-all"
        >
          Preencher minha ficha →
        </button>
      </motion.div>
    )
  }

  // ─── FECHAR FORM ──────────────────────────────────────────────────────────
  if (step === 'fechar_form') {
    const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
    const labelClass = 'block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide'

    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full">
        <button onClick={() => setStep('fechar_intro')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-1">Ficha cadastral</h2>
        <p className="text-sm text-gray-400 mb-5">Consórcio {resultado.bem === 'imovel' ? 'Imóvel' : 'Veículo'} — Carta {formatCurrency(resultado.valor)}</p>

        {/* Seção 1: Dados Pessoais */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dados Pessoais</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Nome completo *</label>
              <input className={inputClass} value={ficha.nome} onChange={e => setField('nome', e.target.value)} placeholder="Seu nome completo" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>CPF</label>
                <input className={inputClass} value={ficha.cpf} onChange={e => setField('cpf', e.target.value)} placeholder="000.000.000-00" />
              </div>
              <div>
                <label className={labelClass}>Nascimento</label>
                <input className={inputClass} value={ficha.nascimento} onChange={e => setField('nascimento', e.target.value)} placeholder="DD/MM/AAAA" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Estado Civil</label>
                <select className={inputClass} value={ficha.estado_civil} onChange={e => setField('estado_civil', e.target.value)}>
                  <option value="">Selecione</option>
                  <option>Solteiro(a)</option>
                  <option>Casado(a)</option>
                  <option>Divorciado(a)</option>
                  <option>Viúvo(a)</option>
                  <option>União estável</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Nacionalidade</label>
                <input className={inputClass} value={ficha.nacionalidade} onChange={e => setField('nacionalidade', e.target.value)} placeholder="Brasileiro(a)" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Nome da Mãe</label>
              <input className={inputClass} value={ficha.nome_mae} onChange={e => setField('nome_mae', e.target.value)} placeholder="Nome completo da mãe" />
            </div>
          </div>
        </div>

        {/* Seção 2: Trabalho e Renda */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Trabalho e Renda</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Profissão</label>
                <input className={inputClass} value={ficha.profissao} onChange={e => setField('profissao', e.target.value)} placeholder="Sua profissão" />
              </div>
              <div>
                <label className={labelClass}>Renda (R$)</label>
                <input className={inputClass} value={ficha.renda} onChange={e => setField('renda', e.target.value)} placeholder="Ex: 5.000,00" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Telefone / WhatsApp *</label>
              <input className={inputClass} value={ficha.telefone} onChange={e => setField('telefone', e.target.value)} placeholder="(47) 99999-9999" />
            </div>
            <div>
              <label className={labelClass}>E-mail</label>
              <input className={inputClass} type="email" value={ficha.email} onChange={e => setField('email', e.target.value)} placeholder="seu@email.com" />
            </div>
          </div>
        </div>

        {/* Seção 3: Endereço */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Endereço</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Endereço (rua e número)</label>
              <input className={inputClass} value={ficha.endereco} onChange={e => setField('endereco', e.target.value)} placeholder="Rua das Flores, 123" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Bairro</label>
                <input className={inputClass} value={ficha.bairro} onChange={e => setField('bairro', e.target.value)} placeholder="Bairro" />
              </div>
              <div>
                <label className={labelClass}>CEP</label>
                <input className={inputClass} value={ficha.cep} onChange={e => setField('cep', e.target.value)} placeholder="00000-000" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Cidade</label>
              <input className={inputClass} value={ficha.cidade} onChange={e => setField('cidade', e.target.value)} placeholder="Sua cidade" />
            </div>
          </div>
        </div>

        <button
          onClick={enviarFicha}
          disabled={submitting || !ficha.nome || !ficha.telefone}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-4 rounded-xl text-lg transition-all"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : '✓ Enviar ficha e falar com consultor'}
        </button>
        <p className="text-center text-xs text-gray-400 mt-2">Abre o WhatsApp com seus dados já formatados</p>
      </motion.div>
    )
  }

  // ─── FECHAR SUCESSO ───────────────────────────────────────────────────────
  if (step === 'fechar_sucesso') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center py-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ficha enviada! 🎉</h2>
        <p className="text-gray-500 mb-4">
          {ficha.nome.split(' ')[0]}, o consultor já recebeu seus dados.<br />
          Em breve você recebe o contato pelo WhatsApp.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
          📲 Fique de olho no WhatsApp — o contato é rápido.
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
              className="p-3 rounded-xl border-2 border-gray-200 text-center transition-all hover:border-blue-400 hover:bg-blue-50"
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

  // ─── HORA ─────────────────────────────────────────────────────────────────
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

  // ─── SUCESSO (agendamento) ─────────────────────────────────────────────────
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center py-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      </motion.div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Reunião confirmada! 🎉</h2>
      <p className="text-gray-500 mb-4">
        {nome.split(' ')[0]}, sua reunião está agendada.<br />
        Vou entrar em contato pelo WhatsApp para confirmar.
      </p>
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
        📲 Fique de olho no WhatsApp — em breve você recebe a confirmação.
      </div>
    </motion.div>
  )
}
