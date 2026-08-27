'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import Calculadora from '@/components/calculator/Calculadora'
import AdemIconLogo from '@/components/AdemIconLogo'
import { Star, ArrowRight, Home, Car, Building2, Wrench, TrendingUp, CheckCircle, XCircle, Hammer, Plane, Briefcase, ChevronDown, type LucideIcon } from 'lucide-react'
import { trackEvent } from '@/lib/gtag'

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)
}

interface Produto { label: string; headline: string; Icon: LucideIcon; img: string; imgPosition?: string }
const PRODUTOS: Produto[] = [
  { label: 'Imóvel',       headline: 'Imóvel próprio.',        Icon: Home,       img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1400&q=85',  imgPosition: 'center' },
  { label: 'Automóvel',    headline: 'Carro próprio.',         Icon: Car,        img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&q=85',  imgPosition: 'center 60%' },
  { label: 'Investimento', headline: 'Patrimônio crescendo.',  Icon: TrendingUp, img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=85',  imgPosition: 'center' },
  { label: 'Construção',   headline: 'Construa do zero.',      Icon: Hammer,     img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=85',  imgPosition: 'center 40%' },
  { label: 'Reforma',      headline: 'Reforma sem dívida.',    Icon: Wrench,     img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1400&q=85',     imgPosition: 'center' },
  { label: 'Negócio',      headline: 'Negócio próprio.',       Icon: Building2,  img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=85',  imgPosition: 'center' },
  { label: 'Viagens',      headline: 'Viaje pelo mundo.',      Icon: Plane,      img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1400&q=85',  imgPosition: 'center 40%' },
  { label: 'Serviços',     headline: 'Serviços sem juros.',    Icon: Briefcase,  img: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1400&q=85',  imgPosition: 'center' },
]

const FAQ = [
  { pergunta: 'Quanto tempo leva para ser contemplado?',   resposta: 'O tempo médio varia entre 12 e 36 meses para imóveis e 6 a 24 meses para veículos. Você pode antecipar com um lance — quanto maior o lance, maior a chance de ser contemplado mais rápido.' },
  { pergunta: 'Tem taxa de adesão ou juros?',              resposta: 'Não existe taxa de adesão e zero juros. Você paga apenas uma taxa administrativa incluída na parcela mensal. É exatamente essa diferença que gera a economia de centenas de milhares de reais comparado ao financiamento.' },
  { pergunta: 'E se eu precisar do bem com urgência?',     resposta: 'Se a necessidade for imediata, o consórcio pode não ser a melhor escolha. Mas para quem planeja — e o planejamento começa hoje — é o instrumento mais inteligente: você paga até 50% menos no total.' },
  { pergunta: 'O consórcio é seguro? É regulamentado?',   resposta: 'Sim. As administradoras de consórcio são regulamentadas e fiscalizadas pelo Banco Central do Brasil. Nossa parceira é a maior administradora privada do país, com mais de 35 anos de mercado e mais de 641 mil clientes atendidos.' },
  { pergunta: 'Posso usar o FGTS no consórcio de imóvel?', resposta: 'Sim. Para consórcios de imóveis, você pode usar o FGTS tanto para dar um lance quanto para abater o saldo devedor após ser contemplado.' },
]

const DEPOIMENTOS = [
  { nome: 'Mariana C.',  cidade: 'São Paulo, SP',      texto: 'Fiz a simulação, vi que economizaria R$87.000 e fechei em uma semana. Melhor decisão da minha vida.',                                         bem: 'Imóvel',  economia: 'R$87.000',  cor: '#1C5FA8' },
  { nome: 'Ricardo A.',  cidade: 'Campinas, SP',       texto: 'Tinha financiamento ativo e pagava juros absurdos. Migrei pro consórcio e reduzi minha parcela em R$800 por mês.',                            bem: 'Veículo', economia: 'R$800/mês', cor: '#C9A84C' },
  { nome: 'Fernanda L.', cidade: 'Ribeirão Preto, SP', texto: 'Fui contemplada em 14 meses com um lance. Hoje tenho meu apartamento sem ter pago fortuna em juros.',                                          bem: 'Imóvel',  economia: 'R$124.000', cor: '#0D3D72' },
]

const EXEMPLOS = {
  imovel: { label: 'Imóvel R$300k',    parcelaFin: 3087, totalFin: 1111320, prazoFin: 360, entradaFin: 90000, parcelaCons: 1011, totalCons: 372000, prazoCons: 220, entradaCons: 0, juros: 739320 },
  carro:  { label: 'Automóvel R$80k',  parcelaFin: 2027, totalFin: 121620,  prazoFin: 60,  entradaFin: 24000, parcelaCons: 1048, totalCons: 92800,  prazoCons: 80,  entradaCons: 0, juros: 41620  },
}

const C = {
  blue:     '#1C5FA8',
  blueDark: '#0D3D72',
  gold:     '#C9A84C',
  goldDark: '#A8883A',
  bg:       '#FFFFFF',
  bgSoft:   '#EEF5FF',
  text:     '#0D1B3E',
  muted:    '#5E6F8A',
  border:   '#D6E4F5',
}

/* ── Animated counter ─────────────────────────────────────────── */
function AnimatedNumber({ to, prefix = '', suffix = '', duration = 1800 }: { to: number; prefix?: string; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(ease * to))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, to, duration])

  return <span ref={ref}>{prefix}{val.toLocaleString('pt-BR')}{suffix}</span>
}

/* ── Loss bar visual ──────────────────────────────────────────── */
function LossBar({ fin, cons, label }: { fin: number; cons: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const pct = Math.round(((fin - cons) / fin) * 100)

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }} className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,168,76,0.2)', color: '#F0D98A' }}>
          -{pct}% com consórcio
        </span>
      </div>
      <div className="relative h-12 rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        {/* Financiamento — barra vermelha */}
        <div className="absolute inset-0 rounded-xl flex items-center px-4 justify-between" style={{ background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.3)' }}>
          <span className="text-xs font-bold text-red-300">Financiamento</span>
          <span className="text-sm font-black text-red-300">{fmt(fin)}</span>
        </div>
        {/* Consórcio — barra verde animada por cima */}
        <motion.div
          initial={{ width: '0%' }}
          animate={inView ? { width: `${(cons / fin) * 100}%` } : { width: '0%' }}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 rounded-xl flex items-center px-4 justify-between overflow-hidden"
          style={{ background: 'linear-gradient(90deg, #16A34A, #22C55E)', minWidth: 120 }}
        >
          <span className="text-xs font-bold text-white whitespace-nowrap">Consórcio</span>
          <span className="text-sm font-black text-white whitespace-nowrap">{fmt(cons)}</span>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function LandingPage() {
  const [modalOpen, setModalOpen]       = useState(false)
  const [faqAberto, setFaqAberto]       = useState<number | null>(null)
  const [bemPreview, setBemPreview]     = useState<'imovel' | 'carro'>('imovel')
  const [produtoAtivo, setProdutoAtivo] = useState(0)

  function abrirModal(origem: string) { trackEvent('simulador_aberto', { origem }); setModalOpen(true) }

  const ex            = EXEMPLOS[bemPreview]
  const economiaTotal = ex.totalFin - ex.totalCons
  const economiaMes   = ex.parcelaFin - ex.parcelaCons

  useEffect(() => {
    const t = setInterval(() => setProdutoAtivo((p) => (p + 1) % PRODUTOS.length), 4500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modalOpen])

  const p = PRODUTOS[produtoAtivo]

  return (
    <>
      <style>{`
        :root { font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; }
        @keyframes heroFloat {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.04); }
        }
        .hero-img { animation: heroFloat 14s ease-in-out infinite; }
        .gold-btn {
          background: linear-gradient(135deg, #C9A84C 0%, #E2C06A 50%, #C9A84C 100%);
          box-shadow: 0 4px 24px rgba(201,168,76,0.35);
        }
        .gold-btn:hover { filter: brightness(1.08); transform: translateY(-1px); box-shadow: 0 8px 32px rgba(201,168,76,0.45); }
        .gold-btn:active { transform: translateY(0); }
        .card-hover { transition: box-shadow .2s, transform .2s; }
        .card-hover:hover { box-shadow: 0 8px 32px rgba(28,95,168,0.12); transform: translateY(-2px); }
      `}</style>

      <div style={{ background: C.bg, color: C.text }} className="min-h-screen">

        {/* ── NAVBAR ──────────────────────────────────────────────── */}
        <nav style={{ background: 'rgba(255,255,255,0.95)', borderBottom: `1px solid ${C.border}` }}
          className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md"
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <AdemIconLogo size="md" />
            <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: C.muted }}>
              <a href="#como-funciona" className="hover:text-[#1C5FA8] transition-colors">Como funciona</a>
              <a href="#produtos"      className="hover:text-[#1C5FA8] transition-colors">Produtos</a>
              <a href="#faq"           className="hover:text-[#1C5FA8] transition-colors">Dúvidas</a>
            </div>
            <button
              onClick={() => abrirModal('navbar')}
              className="gold-btn text-white font-bold px-5 py-2.5 rounded-full text-sm transition-all"
            >
              Simular grátis
            </button>
          </div>
        </nav>

        {/* ── HERO FULL-SCREEN ─────────────────────────────────────── */}
        <section className="relative h-screen min-h-[640px] max-h-[960px] overflow-hidden" id="produtos">

          <AnimatePresence mode="sync">
            <motion.div
              key={produtoAtivo}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1 }}
              className="absolute inset-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.img} alt={p.label} className="hero-img w-full h-full object-cover" style={{ objectPosition: p.imgPosition ?? 'center' }} />
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0" style={{ background: 'linear-gradient(110deg, rgba(13,61,114,0.88) 0%, rgba(13,61,114,0.60) 55%, rgba(13,61,114,0.25) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,61,114,0.75) 0%, transparent 50%)' }} />

          <div className="relative z-10 h-full flex flex-col pt-28 pb-40 px-6 max-w-7xl mx-auto">

            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
                style={{ background: 'rgba(201,168,76,0.18)', border: '1px solid rgba(201,168,76,0.45)', color: '#F0D98A' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
                Parceria com a maior administradora privada do Brasil
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.05 }}
                className="text-4xl md:text-5xl lg:text-[60px] font-black leading-[0.92] mb-5 tracking-tight text-white drop-shadow-2xl"
              >
                Compre o que<br />
                <span style={{ color: '#F0D98A' }}>você quer.</span><br />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={produtoAtivo}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35 }}
                    className="text-white"
                  >
                    {p.headline}
                  </motion.span>
                </AnimatePresence>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="text-white/85 text-lg leading-relaxed mb-7 max-w-md drop-shadow"
              >
                Sem juros. Sem taxa de adesão. Você contrata uma carta de crédito,
                paga parcelas mensais e compra à vista quando for contemplado.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex flex-wrap gap-3"
              >
                <a
                  href="#como-funciona"
                  className="inline-flex items-center gap-2 font-semibold px-6 py-4 rounded-full text-base transition-all text-white"
                  style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}
                >
                  Como funciona
                </a>
                <button
                  onClick={() => abrirModal('hero')}
                  className="gold-btn inline-flex items-center gap-2 text-white font-black px-8 py-4 rounded-full text-base transition-all"
                >
                  Quero fazer meu consórcio
                  <ArrowRight className="w-5 h-5" />
                </button>
                <a
                  href="https://wa.me/5511993929660?text=Ol%C3%A1%2C%20quero%20agendar%20uma%20reuni%C3%A3o%20com%20um%20especialista%20em%20cons%C3%B3rcio."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold px-6 py-4 rounded-full text-base transition-all text-white"
                  style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}
                >
                  Agendar reunião com especialista
                </a>
              </motion.div>
            </div>

            {/* Tabs de produto */}
            <div className="absolute bottom-8 left-6 right-6 max-w-7xl">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>Escolha o produto</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {PRODUTOS.map((prod, i) => {
                  const Icon = prod.Icon
                  const ativo = produtoAtivo === i
                  return (
                    <button
                      key={prod.label}
                      onClick={() => setProdutoAtivo(i)}
                      className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300"
                      style={ativo
                        ? { background: C.gold, color: '#fff', boxShadow: '0 4px 16px rgba(201,168,76,0.4)' }
                        : { background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.15)' }
                      }
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {prod.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── COMPARATIVO INTERATIVO ──────────────────────────────── */}
        <section style={{ background: C.bg }} className="py-20 px-6">
          <div className="max-w-4xl mx-auto">

            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.blue }}>Compare antes de decidir</p>
              <h2 className="text-3xl md:text-4xl font-black mb-2" style={{ color: C.text }}>
                O que você paga no total.
              </h2>
              <p className="text-base" style={{ color: C.muted }}>Selecione o bem e veja a diferença real.</p>
            </div>

            {/* Toggle */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex p-1 rounded-2xl gap-1" style={{ background: C.bgSoft, border: `1px solid ${C.border}` }}>
                {(['imovel', 'carro'] as const).map((b) => {
                  const Icon = b === 'imovel' ? Home : Car
                  const ativo = bemPreview === b
                  return (
                    <button
                      key={b}
                      onClick={() => setBemPreview(b)}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200"
                      style={ativo
                        ? { background: C.blue, color: '#fff', boxShadow: '0 4px 12px rgba(28,95,168,0.25)' }
                        : { color: C.muted }
                      }
                    >
                      <Icon className="w-4 h-4" />
                      {b === 'imovel' ? 'Imóvel R$300k' : 'Automóvel R$80k'}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Cards lado a lado */}
            <AnimatePresence mode="wait">
              <motion.div
                key={bemPreview}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 gap-4 mb-4"
              >
                {/* Financiamento */}
                <div className="rounded-2xl p-6" style={{ background: '#FFF5F5', border: '1.5px solid #FECACA' }}>
                  <div className="flex items-center gap-2 mb-5">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <p className="text-sm font-black uppercase tracking-wide text-red-600">Financiamento</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Entrada obrigatória', val: fmt(ex.entradaFin), bad: true },
                      { label: 'Prazo',               val: `${ex.prazoFin} meses` },
                      { label: 'Juros anuais',        val: '~12% ao ano', bad: true },
                      { label: 'Parcela mensal',      val: `${fmt(ex.parcelaFin)}/mês` },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: C.muted }}>{row.label}</span>
                        <span className="text-sm font-bold" style={{ color: row.bad ? '#DC2626' : C.text }}>{row.val}</span>
                      </div>
                    ))}
                    <div className="pt-3 mt-2" style={{ borderTop: '1.5px solid #FECACA' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wide text-red-500">Total pago</span>
                        <span className="text-xl font-black text-red-600">{fmt(ex.totalFin)}</span>
                      </div>
                      <p className="text-xs text-red-400 text-right mt-0.5">{fmt(ex.juros)} só em juros</p>
                    </div>
                  </div>
                </div>

                {/* Consórcio */}
                <div className="rounded-2xl p-6" style={{ background: '#F0FDF4', border: '2px solid #86EFAC' }}>
                  <div className="flex items-center gap-2 mb-5">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-black uppercase tracking-wide text-green-700">Consórcio</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Entrada',             val: 'R$0 — sem entrada', good: true },
                      { label: 'Prazo',               val: `${ex.prazoCons} meses` },
                      { label: 'Juros',               val: 'Zero', good: true },
                      { label: 'Parcela mensal',      val: `${fmt(ex.parcelaCons)}/mês` },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: C.muted }}>{row.label}</span>
                        <span className="text-sm font-bold" style={{ color: (row as {good?: boolean}).good ? '#16A34A' : C.text }}>{row.val}</span>
                      </div>
                    ))}
                    <div className="pt-3 mt-2" style={{ borderTop: '1.5px solid #86EFAC' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wide text-green-600">Total pago</span>
                        <span className="text-xl font-black text-green-700">{fmt(ex.totalCons)}</span>
                      </div>
                      <p className="text-xs text-green-500 text-right mt-0.5">zero juros — taxa admin apenas</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Economia em destaque */}
            <AnimatePresence mode="wait">
              <motion.div
                key={bemPreview + '-eco'}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5"
                style={{ background: 'linear-gradient(135deg, #0D3D72, #1C5FA8)', boxShadow: '0 12px 40px rgba(13,61,114,0.25)' }}
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>Você economiza no total</p>
                  <p className="font-black text-5xl text-white">{fmt(economiaTotal)}</p>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>+ {fmt(economiaMes)}/mês no bolso até ser contemplado</p>
                </div>
                <button
                  onClick={() => abrirModal('comparativo')}
                  className="gold-btn text-white font-black py-4 px-8 rounded-2xl transition-all text-base flex-shrink-0"
                >
                  Calcular o meu →
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* ── COMO FUNCIONA ────────────────────────────────────────── */}
        <section id="como-funciona" style={{ background: '#0A0F1E' }} className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: C.gold }}>A solução inteligente</p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Como funciona o consórcio</h2>
              <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Três passos. Sem burocracia de banco, sem juros, sem entrada.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-px" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 24, overflow: 'hidden' }}>
              {[
                {
                  num: '01', cor: C.gold,
                  titulo: 'Contrata a carta',
                  desc: 'Você escolhe o valor da carta — equivalente ao bem que quer. Sem aprovação de banco, sem score mínimo, sem entrada.',
                  icon: '📋',
                },
                {
                  num: '02', cor: '#22C55E',
                  titulo: 'Paga sem juros',
                  desc: 'Parcelas mensais com apenas taxa administrativa (1,2% ao ano). Todo mês há contemplações por sorteio — e você pode acelerar com um lance.',
                  icon: '💸',
                },
                {
                  num: '03', cor: '#60A5FA',
                  titulo: 'Compra à vista',
                  desc: 'Com a carta em mãos, compra à vista e ainda negocia desconto que financiado nenhum consegue. Você paga o preço real do bem.',
                  icon: '🏆',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.12 }}
                  className="p-8 flex flex-col gap-5"
                  style={{ background: '#0D1220' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-4xl font-black" style={{ color: item.cor, opacity: 0.25 }}>{item.num}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white mb-3">{item.titulo}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.desc}</p>
                  </div>
                  <div className="mt-auto h-0.5 rounded-full" style={{ background: item.cor, opacity: 0.4 }} />
                </motion.div>
              ))}
            </div>

            {/* Financiamento vs Consórcio — checklist no dark */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              className="mt-10 rounded-3xl p-8 grid md:grid-cols-2 gap-8"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-5 text-red-400">❌ Financiamento</p>
                <ul className="space-y-3.5">
                  {['30% de entrada obrigatória', 'Juros de 12% a 18% ao ano', 'IOF e tarifas ocultas', 'Score alto exigido', 'Paga quase o dobro do preço'].map((t) => (
                    <li key={t} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />{t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-5 text-green-400">✓ Consórcio</p>
                <ul className="space-y-3.5">
                  {['Sem entrada — começa do zero', 'Zero juros — só 1,2% de taxa ao ano', 'Sem IOF, sem taxas ocultas', 'Processo simples de adesão', 'Você paga o preço real do bem'].map((t) => (
                    <li key={t} className="flex items-start gap-3 text-sm text-white/70">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />{t}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── O DINHEIRO QUE O BANCO LEVA ─────────────────────────── */}
        <section style={{ background: '#0D1220' }} className="py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              className="text-center mb-14"
            >
              <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#F87171' }}>A verdade que o banco não te conta</p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                Quanto você vai dar<br />
                <span style={{ color: '#F87171' }}>de presente ao banco?</span>
              </h2>
              <p className="text-lg" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Veja a diferença real — barra a barra.
              </p>
            </motion.div>

            <div className="rounded-3xl p-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <LossBar fin={1111320} cons={372000} label="Imóvel R$300.000" />
              <LossBar fin={1852200} cons={620000} label="Imóvel R$500.000" />
              <LossBar fin={121620}  cons={92800}  label="Veículo R$80.000" />

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                className="mt-8 pt-6 text-center"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Calculado com taxas médias praticadas pelos bancos brasileiros.
                </p>
                <button
                  onClick={() => abrirModal('dor')}
                  className="gold-btn inline-flex items-center gap-2 text-white font-black px-8 py-4 rounded-2xl transition-all"
                >
                  Ver meu cálculo personalizado
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── CTA SIMULADOR ────────────────────────────────────────── */}
        <section className="py-20 px-6" style={{ background: C.blue }}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>Calcule o seu agora</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">Quanto você economiza?</h2>
            <p className="text-lg mb-8 text-white/70">
              Informe o bem e o valor. Em 2 minutos você vê a diferença exata — personalizada para o seu caso.
            </p>
            <button
              onClick={() => abrirModal('cta-meio')}
              className="gold-btn inline-flex items-center gap-3 text-white font-black px-10 py-5 rounded-2xl text-xl transition-all"
            >
              Simular minha economia
              <ArrowRight className="w-6 h-6" />
            </button>
            <p className="text-sm mt-4" style={{ color: 'rgba(255,255,255,0.4)' }}>Gratuito · Sem compromisso · Sem cadastro inicial</p>
          </div>
        </section>

        {/* ── CREDIBILIDADE ────────────────────────────────────────── */}
        <section style={{ background: C.bg }} className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.muted }}>Quem está por trás</p>
              <h2 className="text-3xl md:text-4xl font-black" style={{ color: C.text }}>A maior administradora privada do Brasil</h2>
              <p className="text-sm mt-2" style={{ color: C.muted }}>Regulada pelo Banco Central · +35 anos no mercado</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { num: 292,    prefix: '+',  suffix: '',    label: 'lojas no Brasil e exterior',  destaque: false },
                { num: 641,    prefix: '+',  suffix: 'mil', label: 'clientes atendidos',          destaque: true  },
                { num: 35,     prefix: '+',  suffix: ' anos',label: 'de experiência',             destaque: false },
                { num: 906,    prefix: '+',  suffix: 'mil', label: 'cotas comercializadas',       destaque: false },
                { num: 140,    prefix: 'R$', suffix: 'bi',  label: 'em créditos comercializados', destaque: false },
                { num: 0,      prefix: '',   suffix: '',    label: 'Regulada pelo Banco Central', destaque: false, fixed: 'BACEN' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.07 }}
                  className="rounded-2xl p-6 text-center card-hover"
                  style={item.destaque
                    ? { background: C.blue, border: 'none' }
                    : { background: C.bgSoft, border: `1px solid ${C.border}` }
                  }
                >
                  <p className="text-3xl md:text-4xl font-black mb-2 leading-none" style={{ color: item.destaque ? '#fff' : C.text }}>
                    {item.fixed ? item.fixed : <AnimatedNumber to={item.num} prefix={item.prefix} suffix={item.suffix} />}
                  </p>
                  <p className="text-xs leading-snug" style={{ color: item.destaque ? 'rgba(255,255,255,0.75)' : C.muted }}>{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DEPOIMENTOS ──────────────────────────────────────────── */}
        <section style={{ background: C.bgSoft, borderTop: `1px solid ${C.border}` }} className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.blue }}>Resultados reais</p>
              <h2 className="text-3xl md:text-4xl font-black" style={{ color: C.text }}>Quem já saiu na frente</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {DEPOIMENTOS.map((d, i) => (
                <motion.div
                  key={d.nome}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden card-hover"
                  style={{ border: `1px solid ${C.border}` }}
                >
                  {/* Topo colorido */}
                  <div className="h-2" style={{ background: d.cor }} />
                  <div className="p-6">
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-[#C9A84C]" style={{ color: C.gold }} />)}
                    </div>
                    <p className="text-2xl font-black mb-1" style={{ color: d.cor, opacity: 0.15, lineHeight: 1 }}>"</p>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: C.muted }}>{d.texto}</p>
                    <div className="pt-4 flex items-center justify-between" style={{ borderTop: `1px solid ${C.border}` }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0" style={{ background: d.cor }}>
                          {d.nome[0]}
                        </div>
                        <div>
                          <p className="font-bold text-sm" style={{ color: C.text }}>{d.nome}</p>
                          <p className="text-xs" style={{ color: C.muted }}>{d.cidade}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs" style={{ color: C.muted }}>{d.bem}</p>
                        <p className="font-black text-sm" style={{ color: C.goldDark }}>+{d.economia}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        <section id="faq" style={{ background: C.bg }} className="py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.muted }}>Dúvidas</p>
              <h2 className="text-3xl md:text-4xl font-black" style={{ color: C.text }}>Perguntas frequentes</h2>
            </div>
            <div className="space-y-3">
              {FAQ.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ border: `1px solid ${faqAberto === i ? C.blue : C.border}`, background: faqAberto === i ? C.bgSoft : C.bg, transition: 'border-color 0.2s, background 0.2s' }}
                >
                  <button
                    onClick={() => setFaqAberto(faqAberto === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm transition-colors"
                    style={{ color: faqAberto === i ? C.blue : C.text }}
                  >
                    <span>{item.pergunta}</span>
                    <motion.div animate={{ rotate: faqAberto === i ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0 ml-3">
                      <ChevronDown className="w-5 h-5" style={{ color: C.blue }} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {faqAberto === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: C.muted, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                          {item.resposta}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────────────── */}
        <section className="py-28 px-6 relative overflow-hidden" style={{ background: '#0A0F1E' }}>
          {/* Glow de fundo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div style={{ width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(201,168,76,0.12) 0%, transparent 70%)' }} />
          </div>
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.3em] mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
                A decisão é agora
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                Cada mês que passa,<br />
                <span style={{ color: '#F87171' }}>dinheiro indo pro banco.</span>
              </h2>
              <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Simule agora. Gratuito, leva 2 minutos, e você vê exatamente quanto pode economizar.
              </p>
              <button
                onClick={() => abrirModal('cta-final')}
                className="gold-btn inline-flex items-center gap-3 text-white font-black px-10 py-5 rounded-2xl text-xl transition-all"
              >
                Simular gratuitamente
                <ArrowRight className="w-6 h-6" />
              </button>
              <p className="text-sm mt-5" style={{ color: 'rgba(255,255,255,0.25)' }}>Sem compromisso · Sem cadastro · Resposta em até 2 horas</p>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────── */}
        <footer className="py-12 px-6" style={{ background: C.blueDark, borderTop: `1px solid rgba(255,255,255,0.08)` }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
              <div>
                <AdemIconLogo size="sm" dark />
                <p className="text-xs mt-3 max-w-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Indicação de consórcio com as melhores condições do mercado. Atendimento personalizado e sem burocracia.
                </p>
              </div>
              <div className="text-xs space-y-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <p className="font-semibold uppercase tracking-wide text-xs mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Produtos</p>
                {PRODUTOS.map((prod) => (
                  <button key={prod.label} onClick={() => abrirModal('footer')} className="block hover:text-white transition-colors">
                    Consórcio de {prod.label}
                  </button>
                ))}
              </div>
              <div className="text-xs space-y-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <p className="font-semibold uppercase tracking-wide text-xs mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Contato</p>
                <p>Simulação e atendimento via WhatsApp</p>
                <p>Resposta em até 2 horas úteis</p>
                <button onClick={() => abrirModal('footer')} className="mt-3 block font-semibold transition-colors" style={{ color: C.gold }}>
                  Fazer simulação gratuita →
                </button>
              </div>
            </div>
            <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs" style={{ borderTop: 'rgba(255,255,255,0.08) 1px solid', color: 'rgba(255,255,255,0.2)' }}>
              <p>© {new Date().getFullYear()} Indica Consórcio. Todos os direitos reservados.</p>
              <p className="text-center">As simulações são estimativas com base em taxas médias de mercado e não constituem proposta formal de contrato.</p>
            </div>
          </div>
        </footer>

        {/* ── WHATSAPP FIXO ────────────────────────────────────────── */}
        <a
          href="https://wa.me/5511993929660?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20quero%20saber%20mais%20sobre%20o%20cons%C3%B3rcio."
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('whatsapp_fixo_click', { label: 'home' })}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 text-white font-bold px-5 py-3.5 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95"
          style={{ background: '#25d366' }}
          aria-label="Tire suas dúvidas pelo WhatsApp"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.522 5.853L0 24l6.303-1.493A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.816 9.816 0 01-5.007-1.369l-.359-.214-3.741.98.999-3.648-.233-.374A9.817 9.817 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
          </svg>
          <span className="text-sm">Falar com consultor</span>
        </a>

        {/* ── MODAL SIMULADOR ──────────────────────────────────────── */}
        <AnimatePresence>
          {modalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModalOpen(false)}
                className="fixed inset-0 z-50 backdrop-blur-sm"
                style={{ background: 'rgba(13,27,62,0.75)' }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg px-4"
              >
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                  <Calculadora onClose={() => setModalOpen(false)} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </>
  )
}
