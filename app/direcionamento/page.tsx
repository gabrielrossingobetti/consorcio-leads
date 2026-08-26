'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const PRODUTO_LABEL: Record<string, string> = {
  imovel: 'Imóvel',
  carro: 'Veículo',
  negocio: 'Negócio',
  reforma: 'Reforma',
  construcao: 'Construção',
  investidor: 'Investimento',
  viagens: 'Viagens',
  servicos: 'Serviços',
}

const ADMINS = [
  { nome: 'Embracon',      cor: '#1B3A6B' },
  { nome: 'Porto Bank',    cor: '#004B93' },
  { nome: 'BB Consórcio',  cor: '#F8C200', textDark: true },
  { nome: 'Magalu',        cor: '#0086FF' },
  { nome: 'Bradesco',      cor: '#CC0000' },
  { nome: 'Itaú',          cor: '#EC7000' },
  { nome: 'Caixa',         cor: '#005CA9' },
  { nome: 'Sicredi',       cor: '#00843D' },
]

const STATS = [
  { valor: '675mil+',  label: 'clientes atendidos' },
  { valor: '#1',       label: 'administradora privada do Brasil' },
  { valor: '35+',      label: 'anos de mercado' },
  { valor: 'R$145,8bi', label: 'em créditos ativos' },
  { valor: '945mil+',  label: 'cotas comercializadas' },
  { valor: '300+',     label: 'lojas em todo o Brasil' },
]

const DIFERENCIAIS = [
  { icon: '🏠', texto: 'Sem entrada — começa do zero' },
  { icon: '💰', texto: 'Zero juros — só taxa administrativa' },
  { icon: '📲', texto: 'Parcela em conta corrente' },
  { icon: '🏆', texto: 'Pioneira do consórcio imobiliário no Brasil' },
  { icon: '⚡', texto: 'Diversas formas de acelerar a contemplação' },
  { icon: '✅', texto: 'Sem score mínimo exigido' },
]

const PATROCINADORES = [
  'São Paulo FC', 'Flamengo', 'BBB', 'Athletico-PR', 'Grêmio', 'Santos FC',
]

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)
}

// SVG logo fiel à marca Ademicon
function AdemIconSVG({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="14" fill="#E52D27"/>
      {/* Casa - telhado */}
      <path d="M40 14 L66 36 H58 V62 H22 V36 H14 Z" fill="white"/>
      {/* Porta */}
      <rect x="33" y="44" width="14" height="18" rx="2" fill="#E52D27"/>
      {/* Janela esquerda */}
      <rect x="24" y="42" width="7" height="7" rx="1" fill="#E52D27"/>
      {/* Janela direita */}
      <rect x="49" y="42" width="7" height="7" rx="1" fill="#E52D27"/>
      {/* Seta cima (crescimento) */}
      <path d="M40 6 L46 14 H34 Z" fill="white" opacity="0.5"/>
    </svg>
  )
}

function AdemIconWordmark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <AdemIconSVG size={52} />
      <div>
        <div className="font-black text-2xl leading-none tracking-tight" style={{ color: '#E52D27', fontFamily: 'system-ui, sans-serif' }}>
          ADEMICON
        </div>
        <div className="text-xs text-gray-500 tracking-wide mt-0.5">consórcio e investimento</div>
      </div>
    </div>
  )
}

type Phase = 'loading' | 'reveal' | 'content'

function DirecionamentoContent() {
  const params = useSearchParams()
  const nome     = params.get('nome')     || ''
  const produto  = params.get('produto')  || 'imovel'
  const credito  = Number(params.get('credito')  || 0)
  const parcela  = Number(params.get('parcela')  || 0)
  const whatsapp = params.get('whatsapp') || ''

  const [phase, setPhase]       = useState<Phase>('loading')
  const [adminIdx, setAdminIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  const produtoLabel = PRODUTO_LABEL[produto] || 'Consórcio'
  const primeiroNome = nome.split(' ')[0]

  const whatsappMsg = [
    `Olá! Me chamo ${nome}.`,
    `Fiz a simulação no Indica Consórcio e quero contratar um consórcio de ${produtoLabel} pela Ademicon.`,
    credito > 0 ? `Carta de crédito: ${fmt(credito)}` : '',
    parcela > 0 ? `Parcela estimada: ${fmt(parcela)}/mês` : '',
    whatsapp ? `Meu WhatsApp: ${whatsapp}` : '',
    `Aguardo o contato!`,
  ].filter(Boolean).join('\n')

  const whatsappUrl = `https://wa.me/5511993929660?text=${encodeURIComponent(whatsappMsg)}`

  useEffect(() => {
    if (phase !== 'loading') return
    const progInt  = setInterval(() => setProgress(p => Math.min(p + 2.5, 100)), 60)
    const adminInt = setInterval(() => setAdminIdx(i => (i + 1) % ADMINS.length), 380)
    const timeout  = setTimeout(() => { clearInterval(progInt); clearInterval(adminInt); setProgress(100); setPhase('reveal') }, 3200)
    return () => { clearInterval(progInt); clearInterval(adminInt); clearTimeout(timeout) }
  }, [phase])

  useEffect(() => {
    if (phase !== 'reveal') return
    const t = setTimeout(() => setPhase('content'), 2400)
    return () => clearTimeout(t)
  }, [phase])

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* ── PHASE 1 — LOADING ─────────────────────────────────── */}
      <AnimatePresence>
        {phase === 'loading' && (
          <motion.div
            key="loading"
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 flex flex-col items-center justify-center px-6"
            style={{ background: '#0A0F1E' }}
          >
            <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mb-4">
              Indica Consórcio · Seleção Inteligente
            </motion.p>

            <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="text-white text-2xl md:text-3xl font-bold text-center leading-snug mb-12">
              Analisando as melhores<br />
              <span style={{ color: '#C9A84C' }}>administradoras para o seu perfil…</span>
            </motion.h1>

            <div className="w-72 h-14 flex items-center justify-center relative mb-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={adminIdx}
                  initial={{ opacity: 0, y: 14, scale: 0.88 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -14, scale: 0.88 }}
                  transition={{ duration: 0.2 }}
                  className="absolute flex items-center gap-3"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-lg flex-shrink-0"
                    style={{
                      background: ADMINS[adminIdx].cor,
                      color: (ADMINS[adminIdx] as { textDark?: boolean }).textDark ? '#111' : '#fff'
                    }}
                  >
                    {ADMINS[adminIdx].nome[0]}
                  </div>
                  <span className="text-white text-base font-semibold whitespace-nowrap">{ADMINS[adminIdx].nome}</span>
                  <motion.span
                    animate={{ opacity: [0.2, 0.8, 0.2] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-white/40 text-sm"
                  >
                    analisando…
                  </motion.span>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="w-72 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <motion.div className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D98A)', width: `${progress}%` }} />
            </div>
            <p className="text-white/25 text-xs mt-2">{Math.round(progress)}% concluído</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PHASE 2 — REVEAL ──────────────────────────────────── */}
      <AnimatePresence>
        {phase === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="fixed inset-0 flex flex-col items-center justify-center"
            style={{ background: '#E52D27' }}
          >
            {/* Flash branco */}
            <motion.div className="absolute inset-0" initial={{ opacity: 1 }} animate={{ opacity: 0 }}
              transition={{ duration: 0.35 }} style={{ background: '#fff' }} />

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
              className="mb-6"
            >
              <div className="bg-white rounded-3xl p-5 shadow-2xl">
                <AdemIconSVG size={80} />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 }}
              className="px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.95)' }}>
              ✓ Administradora selecionada
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
              className="text-center">
              <div className="text-white font-black text-5xl md:text-6xl tracking-tight">ADEMICON</div>
              <div className="text-white/70 text-sm tracking-widest mt-1">consórcio e investimento</div>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
              className="mt-6 text-white/80 text-lg text-center px-8 max-w-sm italic">
              "O consórcio que mais cresce no Brasil."
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PHASE 3 — CONTENT ─────────────────────────────────── */}
      <AnimatePresence>
        {phase === 'content' && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ background: '#fff', minHeight: '100vh' }}
          >

            {/* ── HERO BANNER ──────────────────────────────── */}
            <div style={{ background: 'linear-gradient(135deg, #E52D27 0%, #B01E1E 100%)' }}>

              {/* Navbar interna */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 max-w-4xl mx-auto">
                <div className="flex items-center gap-2.5">
                  <AdemIconSVG size={40} />
                  <div>
                    <div className="font-black text-white text-base leading-none tracking-tight">ADEMICON</div>
                    <div className="text-white/60 text-[10px] tracking-wide">consórcio e investimento</div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-bold text-white/90 tracking-wide"
                  style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
                  ✓ Administradora Indicada
                </div>
              </div>

              {/* Hero content */}
              <div className="px-6 pt-6 pb-12 max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <p className="text-white/70 text-sm font-medium mb-2">
                    Sua simulação foi concluída com sucesso
                  </p>
                  <h1 className="text-white font-black text-3xl md:text-4xl lg:text-5xl leading-tight mb-3">
                    {primeiroNome ? `${primeiroNome}, você está perto` : 'Você está perto'}<br />
                    <span style={{ color: '#FFD0D0' }}>de realizar seu projeto de vida.</span>
                  </h1>
                  <p className="text-white/80 text-lg mb-6">
                    Consórcio de <strong className="text-white">{produtoLabel}</strong>
                    {credito > 0 && <> · Carta <strong className="text-white">{fmt(credito)}</strong></>}
                    {parcela > 0 && <> · Parcela <strong className="text-white">{fmt(parcela)}/mês</strong></>}
                  </p>
                </motion.div>

                {/* CTAs */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                  className="flex flex-col sm:flex-row gap-3 max-w-lg">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-xl font-black text-base transition-all hover:brightness-95 active:scale-[0.98] shadow-lg"
                    style={{ background: '#25D366', color: '#fff' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.522 5.853L0 24l6.303-1.493A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.816 9.816 0 01-5.007-1.369l-.359-.214-3.741.98.999-3.648-.233-.374A9.817 9.817 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                    </svg>
                    Falar com especialista agora
                  </a>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                  className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                  <p className="text-white/70 text-sm">
                    Um especialista Ademicon vai entrar em contato
                    {whatsapp ? <strong className="text-white"> no WhatsApp ({whatsapp})</strong> : ' no seu WhatsApp'}
                  </p>
                </motion.div>
              </div>
            </div>

            {/* ── STATS ────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="px-6 py-12 max-w-4xl mx-auto">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 text-center mb-8">
                Por que a Ademicon é a número 1 do Brasil?
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {STATS.map((s, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.06 }}
                    className="text-center p-5 rounded-2xl border border-gray-100 bg-gray-50">
                    <div className="font-black text-2xl md:text-3xl mb-1" style={{ color: '#E52D27' }}>{s.valor}</div>
                    <div className="text-xs text-gray-500 leading-snug">{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ── DIFERENCIAIS ─────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              style={{ background: '#FFF5F5' }}
              className="px-6 py-12">
              <div className="max-w-4xl mx-auto">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">
                  Diferenciais da Ademicon
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {DIFERENCIAIS.map((d, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.75 + i * 0.05 }}
                      className="flex items-center gap-3 p-4 rounded-xl bg-white border border-red-100 shadow-sm">
                      <span className="text-xl flex-shrink-0">{d.icon}</span>
                      <span className="text-sm font-semibold text-gray-800">{d.texto}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── PATROCINADORES ───────────────────────────── */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }}
              className="px-6 py-10 max-w-4xl mx-auto text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-5">
                Patrocinadora oficial de
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {PATROCINADORES.map((p, i) => (
                  <span key={i} className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
                    {p}
                  </span>
                ))}
                <span className="px-4 py-2 rounded-full text-sm text-gray-400 bg-gray-50">+ muito mais</span>
              </div>
            </motion.div>

            {/* ── BOTTOM CTA ───────────────────────────────── */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
              style={{ background: 'linear-gradient(135deg, #E52D27 0%, #B01E1E 100%)' }}
              className="px-6 py-14 text-center">
              <div className="max-w-lg mx-auto">
                <p className="text-white/70 text-sm mb-2">Pronto para dar o próximo passo?</p>
                <h2 className="text-white font-black text-2xl md:text-3xl mb-6">
                  Lógico que dá. <span className="text-white/70">Fale agora com um especialista.</span>
                </h2>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-black text-lg transition-all hover:brightness-95 active:scale-[0.98] shadow-xl"
                  style={{ background: '#25D366', color: '#fff' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.522 5.853L0 24l6.303-1.493A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.816 9.816 0 01-5.007-1.369l-.359-.214-3.741.98.999-3.648-.233-.374A9.817 9.817 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                  </svg>
                  Falar com especialista Ademicon
                </a>
                <p className="text-white/40 text-xs mt-6">
                  Indica Consórcio · Conectando você à melhor administradora
                </p>
              </div>
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0F1E' }}>
        <div className="text-white/40 text-sm">Carregando...</div>
      </div>
    }>
      <DirecionamentoContent />
    </Suspense>
  )
}
