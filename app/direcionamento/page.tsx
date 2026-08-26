'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const PRODUTO_LABEL: Record<string, string> = {
  imovel: 'Imóvel',
  carro: 'Veículo',
  negocio: 'Negócio',
  reforma: 'Reforma',
  investidor: 'Investimento',
}

const ADMINS = [
  { nome: 'Embracon',      cor: '#1B3A6B' },
  { nome: 'Porto Bank',    cor: '#004B93' },
  { nome: 'BB Consórcio',  cor: '#F8C200' },
  { nome: 'Magalu',        cor: '#0086FF' },
  { nome: 'Bradesco',      cor: '#CC0000' },
  { nome: 'Itaú',          cor: '#EC7000' },
  { nome: 'Caixa',         cor: '#005CA9' },
  { nome: 'Sicredi',       cor: '#00843D' },
]

const STATS = [
  { valor: 'R$2bi',    label: 'em crédito por mês' },
  { valor: '#1',       label: 'administradora privada do Brasil' },
  { valor: '35+',      label: 'anos de mercado' },
  { valor: '641mil+',  label: 'clientes atendidos' },
  { valor: '906mil+',  label: 'cotas comercializadas' },
  { valor: 'Bacen',    label: 'regulada pelo Banco Central' },
]

const PATROCINADORES = [
  'São Paulo FC', 'Flamengo', 'Big Brother Brasil',
  'Athletico-PR', 'Grêmio', 'Santos FC', 'Cuiabá EC',
]

const DIFERENCIAIS = [
  'Sem entrada — começa do zero',
  'Zero juros — só taxa administrativa',
  'Parcela em conta corrente',
  'Pioneira do consórcio imobiliário no Brasil',
  'Diversas formas de acelerar a contemplação',
  'Sem score mínimo exigido',
]

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)
}

type Phase = 'loading' | 'reveal' | 'content'

function DirecionamentoContent() {
  const params = useSearchParams()
  const nome      = params.get('nome')      || ''
  const produto   = params.get('produto')   || 'imovel'
  const credito   = Number(params.get('credito')  || 0)
  const parcela   = Number(params.get('parcela')  || 0)
  const whatsapp  = params.get('whatsapp')  || ''

  const [phase, setPhase]       = useState<Phase>('loading')
  const [adminIdx, setAdminIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  const produtoLabel  = PRODUTO_LABEL[produto] || 'Consórcio'
  const primeiroNome  = nome.split(' ')[0]

  const whatsappMsg = [
    `Olá! Me chamo ${nome}.`,
    `Fiz a simulação no Indica Consórcio e quero contratar um consórcio de ${produtoLabel} pela Ademicon.`,
    credito > 0 ? `Carta de crédito: ${fmt(credito)}` : '',
    parcela > 0 ? `Parcela: ${fmt(parcela)}/mês` : '',
    whatsapp ? `Meu WhatsApp: ${whatsapp}` : '',
    `Aguardo o contato!`,
  ].filter(Boolean).join('\n')

  const whatsappUrl = `https://wa.me/5511993929660?text=${encodeURIComponent(whatsappMsg)}`

  // Phase 1: loading
  useEffect(() => {
    if (phase !== 'loading') return

    const progInt = setInterval(() => {
      setProgress(p => Math.min(p + 2.5, 100))
    }, 60)

    const adminInt = setInterval(() => {
      setAdminIdx(i => (i + 1) % ADMINS.length)
    }, 380)

    const timeout = setTimeout(() => {
      clearInterval(progInt)
      clearInterval(adminInt)
      setProgress(100)
      setPhase('reveal')
    }, 3200)

    return () => { clearInterval(progInt); clearInterval(adminInt); clearTimeout(timeout) }
  }, [phase])

  // Phase 2: reveal → content
  useEffect(() => {
    if (phase !== 'reveal') return
    const t = setTimeout(() => setPhase('content'), 2200)
    return () => clearTimeout(t)
  }, [phase])

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* ── PHASE 1 — LOADING ───────────────────────────────────────── */}
      <AnimatePresence>
        {phase === 'loading' && (
          <motion.div
            key="loading"
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex flex-col items-center justify-center px-6"
            style={{ background: '#080D1A' }}
          >
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3"
            >
              Indica Consórcio · Seleção Inteligente
            </motion.p>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white text-2xl md:text-3xl font-bold text-center leading-snug mb-10"
            >
              Analisando as melhores<br />
              administradoras para o seu perfil...
            </motion.h1>

            {/* Admin cycling */}
            <div className="w-80 h-16 flex items-center justify-center relative mb-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={adminIdx}
                  initial={{ opacity: 0, y: 12, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.9 }}
                  transition={{ duration: 0.22 }}
                  className="absolute flex items-center gap-3"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg flex-shrink-0"
                    style={{ background: ADMINS[adminIdx].cor }}
                  >
                    {ADMINS[adminIdx].nome[0]}
                  </div>
                  <span className="text-white text-lg font-semibold whitespace-nowrap">{ADMINS[adminIdx].nome}</span>
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-white/40 text-sm whitespace-nowrap"
                  >
                    verificando...
                  </motion.span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress */}
            <div className="w-80 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D98A)', width: `${progress}%` }}
              />
            </div>
            <p className="text-white/25 text-xs mt-2">{Math.round(progress)}% concluído</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PHASE 2 — REVEAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex flex-col items-center justify-center"
            style={{ background: '#D62020' }}
          >
            {/* Flash effect */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ background: '#fff' }}
            />

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.35, type: 'spring', stiffness: 220, damping: 14 }}
              className="mb-5"
            >
              <div className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
                <span className="text-5xl font-black" style={{ color: '#D62020' }}>A</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 }}
              className="mb-2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)' }}
            >
              ✓ Administradora selecionada
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="text-white font-black text-5xl md:text-6xl text-center mb-3"
            >
              Ademicon
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="text-white/80 text-lg text-center px-8 max-w-sm"
            >
              A melhor opção para o seu<br />consórcio de {produtoLabel}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PHASE 3 — CONTENT ───────────────────────────────────────── */}
      <AnimatePresence>
        {phase === 'content' && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ background: '#D62020', minHeight: '100vh' }}
          >

            {/* Hero */}
            <div className="px-6 pt-14 pb-8 max-w-2xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="flex justify-center mb-5"
              >
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-4xl font-black" style={{ color: '#D62020' }}>A</span>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: 'rgba(255,255,255,0.55)' }}
              >
                Administradora indicada pelo Indica Consórcio
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-white font-black text-5xl mb-3"
              >
                Ademicon
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-lg mb-1"
                style={{ color: 'rgba(255,255,255,0.85)' }}
              >
                {primeiroNome ? `${primeiroNome}, a ` : 'A '}melhor administradora para o seu consórcio de <strong>{produtoLabel}</strong>
              </motion.p>

              {credito > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="text-sm"
                  style={{ color: 'rgba(255,255,255,0.55)' }}
                >
                  Carta de crédito: {fmt(credito)}{parcela > 0 ? ` · Parcela estimada: ${fmt(parcela)}/mês` : ''}
                </motion.p>
              )}
            </div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="px-6 max-w-md mx-auto mb-10"
            >
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-lg mb-3 shadow-xl transition-all hover:brightness-95 active:scale-[0.98]"
                style={{ background: '#fff', color: '#D62020' }}
              >
                💬 Falar com especialista agora
              </a>

              <div
                className="w-full px-5 py-4 rounded-2xl text-center text-sm"
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <p style={{ color: 'rgba(255,255,255,0.75)' }}>
                  📲 Um especialista Ademicon vai entrar em contato
                </p>
                <p className="font-bold mt-0.5" style={{ color: 'rgba(255,255,255,0.95)' }}>
                  no WhatsApp {whatsapp ? `(${whatsapp})` : 'que você informou'}
                </p>
              </div>
            </motion.div>

            {/* Diferenciais */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="px-6 max-w-2xl mx-auto mb-8"
            >
              <div
                className="rounded-2xl p-6"
                style={{ background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Diferenciais da Ademicon
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {DIFERENCIAIS.map((d, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className="text-white/80 text-base flex-shrink-0">✓</span>
                      <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="px-6 max-w-2xl mx-auto mb-8"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-center mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Por que a Ademicon é a número 1?
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {STATS.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.85 + i * 0.07 }}
                    className="rounded-xl p-4 text-center"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)' }}
                  >
                    <div className="text-white text-2xl font-black mb-1">{s.valor}</div>
                    <div className="text-xs leading-tight" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Patrocinadores */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="px-6 max-w-2xl mx-auto mb-10"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-center mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Patrocinadora oficial de
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {PATROCINADORES.map((p, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-sm font-semibold"
                    style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}
                  >
                    {p}
                  </span>
                ))}
                <span
                  className="px-3 py-1.5 rounded-full text-sm"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}
                >
                  + milhares de marcas
                </span>
              </div>
            </motion.div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="px-6 max-w-md mx-auto pb-16 text-center"
            >
              <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Pronto para dar o próximo passo?
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-base transition-all hover:brightness-95 active:scale-[0.98] shadow-xl"
                style={{ background: '#fff', color: '#D62020' }}
              >
                💬 Falar com especialista Ademicon
              </a>
              <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Indica Consórcio · Conectando você à melhor administradora
              </p>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default function DirecionamentoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080D1A' }}>
        <div className="text-white/40 text-sm">Carregando...</div>
      </div>
    }>
      <DirecionamentoContent />
    </Suspense>
  )
}
