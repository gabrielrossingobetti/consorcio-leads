'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, CheckCircle, ChevronLeft, Loader2, MessageCircle } from 'lucide-react'
import { ResultadoCalculo, formatCurrency } from '@/lib/calculos'
import { registrarReuniaoAgendada, registrarWhatsappIniciado } from '@/lib/gtag'
import { getUTMs } from '@/lib/utm'
import { getSessao } from '@/lib/sessao'

const WHATSAPP_CONSULTOR = '5511993929660'

interface Props {
  resultado: ResultadoCalculo
  /** Opcionais: no fluxo novo o contato é pedido AQUI, depois do horário. */
  nome?: string
  whatsapp?: string
  /** Onde começar. 'dia' pula a tela de opções para quem já clicou em agendar. */
  inicio?: 'escolha' | 'dia'
  onBack: () => void
  /** Recebe o horário confirmado (ISO) e o contato coletado */
  onSuccess: (slotIso: string, contato: { nome: string; whatsapp: string }) => void
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

/** Próximos 14 dias, pulando domingo — não há atendimento. */
function getNext14Days(): Date[] {
  const days: Date[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    if (d.getDay() === 0) continue
    days.push(d)
  }
  return days
}

function toDateStr(d: Date) { return d.toISOString().slice(0, 10) }

function formatSlot(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
}

// A grade de horários vem inteiramente da API, que já devolve só os slots
// realmente atendidos naquele dia e ainda livres na agenda do consultor.
// Não há bloqueio artificial: o que aparece ocupado está ocupado de verdade.

function logFunil(evento: string, extra: Record<string, unknown> = {}) {
  fetch('/api/funil', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ evento, sessao: getSessao(), ...extra }),
  }).catch(() => {})
}

type Step =
  | 'escolha'
  | 'dia' | 'hora' | 'contato' | 'confirmar' | 'sucesso'
  | 'whats_contato'
  | 'proposta_sucesso'

export default function StepAgendamento({
  resultado, nome: nomeProp, whatsapp: whatsProp, inicio = 'escolha', onBack, onSuccess,
}: Props) {
  const [step, setStep] = useState<Step>(inicio)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  // Contato coletado aqui quando não veio de fora — é a mudança de ordem:
  // a pessoa escolhe o horário primeiro e só então se identifica.
  const [nome, setNome] = useState(nomeProp ?? '')
  const [whatsapp, setWhatsapp] = useState(whatsProp ?? '')
  const days = getNext14Days()
  const ctx = { bem: resultado.bem, valor: resultado.valor, nome, whatsapp }
  // Vazio quando ainda não sabemos o nome — no fluxo novo o contato só vem
  // depois do horário, então saudação com nome não pode ser assumida.
  const primeiroNome = nome.trim().split(' ')[0] || ''

  useEffect(() => { logFunil(inicio === 'dia' ? 'abriu_agenda' : 'step_escolha', ctx) }, [])

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
        // Único ponto do funil que envia conversão ao Google Ads.
        // A reunião está na agenda: é este o lead que vale a pena o algoritmo buscar.
        registrarReuniaoAgendada({ bem: resultado.bem, valor: resultado.valor })
        logFunil('reuniao_confirmada', ctx)
        setStep('sucesso')
        setTimeout(() => onSuccess(selectedSlot, { nome, whatsapp }), 2200)
      }
    } catch { }
    finally { setSubmitting(false) }
  }

  /**
   * Saída pelo WhatsApp. Salva o lead ANTES de abrir a conversa — assim o
   * consultor recebe a simulação mesmo se a pessoa desistir de mandar a
   * mensagem. Nada de CPF nem ficha: nome e WhatsApp bastam para começar.
   */
  async function abrirWhatsappProjeto() {
    registrarWhatsappIniciado({ bem: resultado.bem, valor: resultado.valor })
    logFunil('whatsapp_projeto_enviado', ctx)

    fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, whatsapp, bem: resultado.bem, valor: resultado.valor, ...getUTMs() }),
    }).catch(() => {})

    const msg = [
      `Olá! Sou ${nome}.`,
      `Simulei no site um consórcio de ${bemLabel} de ${formatCurrency(resultado.valor)}, com parcela de ${formatCurrency(resultado.parcelaConsorcio)}.`,
      `Quero montar o projeto e entender a estratégia de lance para o meu caso.`,
    ].join('\n')

    window.open(`https://wa.me/${WHATSAPP_CONSULTOR}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')
    setStep('proposta_sucesso')
  }

  // ─── ESCOLHA ──────────────────────────────────────────────────────────────
  if (step === 'escolha') {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        {/* Cabeçalho */}
        <div className="text-center mb-5">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Próximo passo{primeiroNome && `, ${primeiroNome}`}
          </h2>
          <p className="text-gray-500 text-sm">
            Carta de {formatCurrency(resultado.valor)} · {bemLabel}
          </p>
        </div>

        {/* CTA Principal — agendar */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => { logFunil('clicou_agendar', ctx); setStep('dia') }}
          className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl p-5 mb-3 text-left transition-all shadow-lg shadow-blue-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5" />
            <span className="font-bold text-lg">Receber consultoria gratuita</span>
          </div>
          <p className="text-blue-100 text-sm leading-relaxed mb-3">
            O especialista analisa o seu caso, monta a estratégia de lance para o que você tem
            hoje e mostra em quanto tempo dá para conquistar seu {bemLabel.toLowerCase()}.
          </p>
          <div className="flex items-center gap-4 text-xs text-blue-200">
            <span className="flex items-center gap-1">✓ Sem custo</span>
            <span className="flex items-center gap-1">✓ Sem compromisso de contratar</span>
          </div>
        </motion.button>

        {/* Divisor */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">ou</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* WhatsApp com o MESMO peso. O público de carta contemplada teme golpe:
            falar com gente de verdade agora é o que destrava. Não é "já quero
            contratar" — é chamar o consultor para montar o projeto junto. */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => { logFunil('clicou_whats_projeto', ctx); setStep('whats_contato') }}
          className="w-full text-left p-5 rounded-2xl border-2 border-[#1FA855] bg-white hover:bg-[#F2FBF6] active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-5 h-5 text-[#1FA855]" />
            <span className="font-bold text-lg text-[#12784A]">Falar no WhatsApp agora</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            O consultor recebe a sua simulação e monta o projeto com você por mensagem,
            no seu tempo. Sem preencher ficha, sem CPF.
          </p>
          <div className="flex items-center gap-4 text-xs text-[#1FA855]">
            <span>✓ Resposta de uma pessoa real</span>
            <span>✓ Sem compromisso</span>
          </div>
        </motion.button>

        <button onClick={onBack} className="w-full text-center text-xs text-gray-300 hover:text-gray-500 transition-colors mt-1">
          ← Voltar à simulação
        </button>
      </motion.div>
    )
  }

  // ─── PROPOSTA FORM (CPF + Email) ──────────────────────────────────────────
  // ─── PROPOSTA SUCESSO ─────────────────────────────────────────────────────
  if (step === 'proposta_sucesso') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center py-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Conversa aberta!</h2>
        <p className="text-gray-500 mb-4">
          {primeiroNome ? `${primeiroNome}, o` : 'O'} consultor já recebeu sua simulação<br />e responde no WhatsApp.
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
          <h2 className="text-xl font-bold text-gray-900">Quando prefere a consultoria?</h2>
          <p className="text-gray-500 text-sm">Sem custo · Vídeo de 15 min · Seg a Sáb</p>
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
          <p className="text-gray-500 text-sm">Horários livres</p>
        </div>

        {loadingSlots ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot, i) => (
                <button key={i} onClick={() => {
                    setSelectedSlot(slot)
                    logFunil('horario_escolhido', { ...ctx, slot })
                    // Se já sabemos quem é, pula direto para a confirmação.
                    setStep(nome && whatsapp ? 'confirmar' : 'contato')
                  }}
                  className="py-3 px-2 rounded-xl border-2 border-gray-200 text-center font-bold text-gray-800 hover:border-blue-500 hover:bg-blue-50 transition-all">
                  {formatSlot(slot)}
                </button>
              ))}
            </div>
            {slots.length === 0 && (
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

  // ─── WHATSAPP — nome e contato, nada de ficha nem CPF ─────────────────────
  if (step === 'whats_contato') {
    const valido = nome.trim().length >= 2 && whatsapp.replace(/\D/g, '').length >= 10
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <button onClick={() => setStep('escolha')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="bg-[#F2FBF6] border-2 border-[#1FA855]/30 rounded-2xl p-4 mb-5">
          <p className="text-[11px] uppercase tracking-wider text-[#12784A] font-semibold mb-1">
            O consultor já recebe
          </p>
          <p className="text-[14px] font-bold text-gray-900">
            Consórcio de {bemLabel} · {formatCurrency(resultado.valor)} · {formatCurrency(resultado.parcelaConsorcio)}/mês
          </p>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-1">Como ele te chama?</h2>
        <p className="text-sm text-gray-500 mb-5">
          Só isso. A conversa continua no WhatsApp, sem ficha e sem CPF.
        </p>

        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Seu nome</label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Como podemos te chamar?"
          className="w-full border-2 border-gray-200 focus:border-[#1FA855] rounded-xl px-4 py-3 mb-4 outline-none transition-colors text-gray-900 placeholder:text-gray-400"
        />

        <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp</label>
        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          inputMode="tel"
          placeholder="(00) 00000-0000"
          className="w-full border-2 border-gray-200 focus:border-[#1FA855] rounded-xl px-4 py-3 mb-5 outline-none transition-colors text-gray-900 placeholder:text-gray-400"
        />

        <button
          onClick={abrirWhatsappProjeto}
          disabled={!valido}
          className="w-full flex items-center justify-center gap-2 bg-[#1FA855] hover:bg-[#179046] disabled:opacity-40 text-white font-bold py-4 rounded-xl transition-all"
        >
          <MessageCircle className="w-5 h-5" />
          Abrir conversa no WhatsApp
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">Seus dados não são compartilhados com terceiros.</p>
      </motion.div>
    )
  }

  // ─── CONTATO — depois do horário escolhido, não antes ──────────────────────
  // A pessoa já investiu na escolha do horário; aqui ela só formaliza.
  // Enquanto isso o horário fica visível, para o pedido ter contrapartida.
  if (step === 'contato') {
    const slotDate = selectedSlot ? new Date(selectedSlot) : null
    const valido = nome.trim().length >= 2 && whatsapp.replace(/\D/g, '').length >= 10
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <button onClick={() => setStep('hora')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-5 text-center">
          <p className="text-[11px] uppercase tracking-wider text-blue-500 font-semibold">Horário reservado</p>
          <p className="text-lg font-bold text-blue-800 mt-1">
            {slotDate && `${DIAS_SEMANA[slotDate.getDay()]}, ${slotDate.getDate()} de ${MESES[slotDate.getMonth()]}`}
            {' · '}{selectedSlot && formatSlot(selectedSlot)}
          </p>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-1">Só falta seu contato</h2>
        <p className="text-sm text-gray-500 mb-5">É por onde o especialista te chama na hora da consultoria.</p>

        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Seu nome</label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Como podemos te chamar?"
          className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4 py-3 mb-4 outline-none transition-colors text-gray-900 placeholder:text-gray-400"
        />

        <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp</label>
        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          inputMode="tel"
          placeholder="(00) 00000-0000"
          className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4 py-3 mb-5 outline-none transition-colors text-gray-900 placeholder:text-gray-400"
        />

        <button
          onClick={() => { logFunil('contato_no_agendamento', { ...ctx, nome, whatsapp }); setStep('confirmar') }}
          disabled={!valido}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-4 rounded-xl transition-all"
        >
          Continuar
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">Seus dados não são compartilhados com terceiros.</p>
      </motion.div>
    )
  }

  if (step === 'confirmar') {
    const slotDate = selectedSlot ? new Date(selectedSlot) : null
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <button onClick={() => setStep(nomeProp ? 'hora' : 'contato')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">📅</div>
          <h2 className="text-xl font-bold text-gray-900">Confirmar consultoria</h2>
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
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : '✓ Confirmar consultoria'}
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
        {primeiroNome ? `${primeiroNome}, tudo certo.` : 'Tudo certo.'}<br />
        O administrativo vai confirmar pelo WhatsApp.
      </p>
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
        📲 Fique de olho no WhatsApp — a confirmação chega em breve.
      </div>
    </motion.div>
  )
}
