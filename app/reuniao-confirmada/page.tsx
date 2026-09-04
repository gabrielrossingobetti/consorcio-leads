'use client'

import { Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, CalendarPlus, Clock, UserCheck, FileText } from 'lucide-react'
import { formatCurrency } from '@/lib/calculos'

/**
 * Página pós-agendamento.
 *
 * A reunião já está no Google Calendar. O único trabalho desta página é
 * CONFIRMAR e reduzir no-show — que é o que mata funil de reunião (metade
 * das pessoas falta). Nada de vender de novo: depois da decisão, argumento
 * novo vira dúvida nova.
 */

const PRODUTO_LABEL: Record<string, string> = {
  imovel: 'imóvel',
  carro: 'veículo',
  negocio: 'negócio',
  reforma: 'reforma',
  investidor: 'investimento',
}

function formatarQuando(iso: string) {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null

  const diaSemana = d.toLocaleDateString('pt-BR', { weekday: 'long' })
  const dia = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const hoje = new Date()
  const amanha = new Date(hoje)
  amanha.setDate(hoje.getDate() + 1)
  const mesmoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString()

  let prefixo = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)
  if (mesmoDia(d, hoje)) prefixo = 'Hoje'
  else if (mesmoDia(d, amanha)) prefixo = 'Amanhã'

  return { prefixo, dia, hora, date: d }
}

/** Link universal de "adicionar à agenda" — o maior redutor de falta que existe. */
function linkGoogleAgenda(inicio: Date, titulo: string, detalhes: string) {
  const fim = new Date(inicio.getTime() + 30 * 60 * 1000)
  const fmt = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, '')
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: titulo,
    dates: `${fmt(inicio)}/${fmt(fim)}`,
    details: detalhes,
  })
  return `https://calendar.google.com/calendar/render?${p.toString()}`
}

function Conteudo() {
  const params = useSearchParams()
  const nome = params.get('nome') || ''
  const produto = params.get('produto') || 'imovel'
  const credito = Number(params.get('credito') || 0)
  const parcela = Number(params.get('parcela') || 0)
  const slot = params.get('slot') || ''

  const quando = useMemo(() => formatarQuando(slot), [slot])
  const bemLabel = PRODUTO_LABEL[produto] || 'consórcio'
  const primeiroNome = nome.split(' ')[0]

  const agendaUrl = quando
    ? linkGoogleAgenda(
        quando.date,
        'Reunião — Consórcio Lidera',
        `Chamada de vídeo pelo WhatsApp, 15 minutos, sobre consórcio de ${bemLabel}${credito ? ` de ${formatCurrency(credito)}` : ''}.`
      )
    : null

  return (
    <main className="zona-clara min-h-screen px-5 py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-xl">
        {/* Confirmação */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: 'var(--c-green)' }}
        >
          <Check className="h-7 w-7 text-white" strokeWidth={3} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
        >
          <h1 className="font-display mt-6 text-[2rem] font-extrabold leading-[1.1] text-[var(--c-ink)] md:text-[2.6rem]">
            {primeiroNome ? `${primeiroNome}, sua reunião` : 'Sua reunião'}
            <br />
            está confirmada.
          </h1>

          {/* O horário — a informação mais importante da página */}
          {quando && (
            <div className="mt-8 rounded-xl border-2 border-[var(--c-electric)] bg-white p-6 md:p-7">
              <p className="eyebrow mb-3 text-[var(--c-electric)]">Seu horário</p>
              <p className="num-hero text-[1.9rem] leading-tight text-[var(--c-ink)] md:text-[2.3rem]">
                {quando.prefixo}, {quando.dia}
              </p>
              <p className="num-hero mt-1 text-[2.6rem] leading-none text-[var(--c-electric)] md:text-[3.2rem]">
                {quando.hora}
              </p>
              <p className="mt-4 flex items-center gap-2 text-[13.5px] text-[var(--c-ink-mid)]">
                <Clock className="h-4 w-4 shrink-0" />
                Chamada de vídeo pelo WhatsApp · 15 minutos
              </p>

              {agendaUrl && (
                <a
                  href={agendaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-primary mt-6 inline-flex w-full items-center justify-center gap-2.5 rounded-full px-6 py-3.5 text-[14.5px] font-bold"
                >
                  <CalendarPlus className="h-4.5 w-4.5" />
                  Adicionar à minha agenda
                </a>
              )}
            </div>
          )}

          {/* O que a pessoa simulou — reforça o contexto sem revender */}
          {credito > 0 && (
            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 rounded-xl border-2 border-[var(--c-rule)] bg-[var(--c-lift)] p-6">
              <div>
                <p className="text-[12px] text-[var(--c-ink-faint)]">Carta simulada</p>
                <p className="num-hero text-[1.3rem] text-[var(--c-ink)]">{formatCurrency(credito)}</p>
              </div>
              {parcela > 0 && (
                <div>
                  <p className="text-[12px] text-[var(--c-ink-faint)]">Parcela</p>
                  <p className="num-hero text-[1.3rem] text-[var(--c-gold)]">{formatCurrency(parcela)}</p>
                </div>
              )}
              <div>
                <p className="text-[12px] text-[var(--c-ink-faint)]">Consórcio de</p>
                <p className="num-hero text-[1.3rem] capitalize text-[var(--c-ink)]">{bemLabel}</p>
              </div>
            </div>
          )}

          {/* O que acontece agora — remove incerteza, que é o que gera falta */}
          <div className="mt-8">
            <h2 className="font-display text-[17px] font-bold text-[var(--c-ink)]">
              O que acontece agora
            </h2>
            <div className="mt-5 flex flex-col gap-5">
              {[
                {
                  Icon: UserCheck,
                  titulo: 'Você recebe uma confirmação',
                  desc: 'A secretária do consultor entra em contato antes da reunião para confirmar que está tudo certo com o seu horário.',
                },
                {
                  Icon: FileText,
                  titulo: 'O consultor prepara o seu caso',
                  desc: `Ele analisa a simulação que você fez e monta a estratégia de lance para o seu ${bemLabel} antes de falar com você.`,
                },
                {
                  Icon: Clock,
                  titulo: 'Na chamada, 15 minutos diretos',
                  desc: `O consultor apresenta os valores e como funciona o consórcio na administradora, analisa o seu cenário e mostra o melhor lance para o seu caso, com uma estimativa de quanto tempo levaria até a contemplação do seu ${bemLabel}.`,
                },
              ].map(({ Icon, titulo, desc }) => (
                <div key={titulo} className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[var(--c-rule)] bg-white">
                    <Icon className="h-4 w-4 text-[var(--c-electric)]" />
                  </div>
                  <div>
                    <p className="text-[14.5px] font-semibold text-[var(--c-ink)]">{titulo}</p>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--c-ink-mid)]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saída para remarcar — não é CTA de venda */}
          <div className="mt-10 border-t-2 border-[var(--c-rule)] pt-6">
            <p className="text-[13.5px] text-[var(--c-ink-mid)]">
              Precisa remarcar ou tem alguma dúvida antes?{' '}
              <a
                href="https://wa.me/5511993929660?text=Ol%C3%A1!%20Agendei%20uma%20reuni%C3%A3o%20e%20preciso%20falar%20sobre%20o%20hor%C3%A1rio."
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[var(--c-electric)] hover:underline"
              >
                Fale com a gente no WhatsApp
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

export default function ReuniaoConfirmada() {
  return (
    <Suspense fallback={<div className="zona-clara min-h-screen" />}>
      <Conteudo />
    </Suspense>
  )
}
