'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
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

const FAQ_ITEMS = [
  { pergunta: 'Vários participantes são contemplados todo mês?', resposta: 'Sim. Todo mês são realizados sorteios e lances dentro do grupo. Vários participantes recebem a carta de crédito por mês — não apenas um. Quanto maior o lance que você oferecer, maior a chance de ser contemplado antes do sorteio.' },
  { pergunta: 'Quanto tempo leva para ser contemplado?', resposta: 'O tempo médio varia entre 12 e 36 meses para imóveis e 6 a 24 meses para veículos. Você pode antecipar com um lance — quanto maior, maior a chance de ser contemplado mais rápido.' },
  { pergunta: 'Tem taxa de adesão ou juros?', resposta: 'Não. Zero juros e sem taxa de adesão. Você paga apenas uma taxa administrativa incluída na parcela mensal — em torno de 1,2% ao ano. É essa diferença que gera a economia de centenas de milhares de reais comparado ao financiamento.' },
  { pergunta: 'O consórcio é seguro? É regulamentado?', resposta: 'Sim. Todas as administradoras de consórcio são regulamentadas e fiscalizadas pelo Banco Central do Brasil. Nossa parceira Ademicon é a maior administradora privada do país, com +35 anos de mercado e +641 mil clientes.' },
  { pergunta: 'Posso usar o FGTS no consórcio de imóvel?', resposta: 'Sim. Para consórcios de imóveis, você pode usar o FGTS tanto para dar um lance e ser contemplado mais rápido, quanto para abater o saldo devedor após ser contemplado.' },
  { pergunta: 'E se eu precisar do bem com urgência?', resposta: 'Se a necessidade for imediata, o consórcio pode não ser a melhor escolha. Mas para quem planeja comprar nos próximos 1 a 3 anos, é o instrumento mais inteligente — você paga até 50% menos no total.' },
]

const DEPOIMENTOS = [
  { nome: 'Mariana C.',  cidade: 'São Paulo, SP',      texto: 'Fiz a simulação, vi que economizaria R$87.000 e fechei em uma semana. Melhor decisão da minha vida.',                                     bem: 'Imóvel',  economia: 'R$87.000',  stars: 5 },
  { nome: 'Ricardo A.',  cidade: 'Campinas, SP',        texto: 'Tinha financiamento ativo e pagava juros absurdos. Migrei pro consórcio e reduzi minha parcela em R$800 por mês.',                        bem: 'Veículo', economia: 'R$800/mês', stars: 5 },
  { nome: 'Fernanda L.', cidade: 'Ribeirão Preto, SP',  texto: 'Fui contemplada em 14 meses com um lance. Hoje tenho meu apartamento sem ter pago fortuna em juros.',                                      bem: 'Imóvel',  economia: 'R$124.000', stars: 5 },
]

const EXEMPLOS = {
  imovel: { label: 'Imóvel R$300k', parcelaFin: 3087, totalFin: 1111320, prazoFin: 360, entradaFin: 90000, parcelaCons: 1011, totalCons: 372000, prazoCons: 220, juros: 739320 },
  carro:  { label: 'Auto R$80k',    parcelaFin: 2027, totalFin: 121620,  prazoFin: 60,  entradaFin: 24000, parcelaCons: 1048, totalCons: 92800,  prazoCons: 80,  juros: 41620  },
}

const C = { blue: '#1C5FA8', blueDark: '#0D3D72', gold: '#C9A84C', goldDark: '#A8883A', goldLight: '#F0D98A', bg: '#FFFFFF', bgSoft: '#F0F6FF', text: '#0D1B3E', muted: '#5E6F8A', border: '#D6E4F5' }

/* ── Animated counter ──────────────────────────────────────────── */
function Counter({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const dur = 1600
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(ease * to))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, to])
  return <span ref={ref}>{prefix}{val.toLocaleString('pt-BR')}{suffix}</span>
}

/* ── Magnetic button effect ────────────────────────────────────── */
function MagneticBtn({ children, onClick, className, style }: { children: React.ReactNode; onClick?: () => void; className?: string; style?: React.CSSProperties }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 300, damping: 25 })
  const sy = useSpring(y, { stiffness: 300, damping: 25 })
  const ref = useRef<HTMLButtonElement>(null)

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    x.set((e.clientX - cx) * 0.25)
    y.set((e.clientY - cy) * 0.25)
  }

  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy, ...style }}
      onMouseMove={handleMove}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  )
}

/* ── Parallax wrapper ──────────────────────────────────────────── */
function ParallaxSection({ children, offset = 40 }: { children: React.ReactNode; offset?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset])
  return (
    <div ref={ref} style={{ overflow: 'hidden' }}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  )
}

export default function LandingPage() {
  const [modalOpen, setModalOpen]       = useState(false)
  const [faqAberto, setFaqAberto]       = useState<number | null>(null)
  const [bemPreview, setBemPreview]     = useState<'imovel' | 'carro'>('imovel')
  const [produtoAtivo, setProdutoAtivo] = useState(0)
  const [stepAtivo, setStepAtivo]       = useState(0)

  function abrirModal(origem: string) { trackEvent('simulador_aberto', { origem }); setModalOpen(true) }

  const ex            = EXEMPLOS[bemPreview]
  const economiaTotal = ex.totalFin - ex.totalCons

  useEffect(() => {
    const t = setInterval(() => setProdutoAtivo((p) => (p + 1) % PRODUTOS.length), 4500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modalOpen])

  const p = PRODUTOS[produtoAtivo]

  const STEPS = [
    {
      num: '01', emoji: '📋', cor: C.blue,
      titulo: 'Você contrata uma carta de crédito',
      desc: 'Escolha o valor que precisa — equivalente ao bem que quer comprar. Não há entrada, não há aprovação de crédito bancário, não há score mínimo exigido.',
      detalhe: 'A carta funciona como dinheiro em espécie na hora da compra.',
    },
    {
      num: '02', emoji: '💳', cor: C.gold,
      titulo: 'Paga parcelas mensais sem juros',
      desc: 'Todo mês você paga uma parcela com apenas a taxa administrativa (~1,2% ao ano). Nada de juros. O grupo é formado por pessoas com o mesmo objetivo.',
      detalhe: 'Sem IOF, sem seguros obrigatórios, sem tarifas ocultas.',
    },
    {
      num: '03', emoji: '🎯', cor: '#16A34A',
      titulo: 'Vários são contemplados todo mês',
      desc: 'Todo mês, múltiplos participantes recebem a carta de crédito — por sorteio ou por lance. O lance embutido já vem incluído na sua parcela mensal, sem precisar de dinheiro extra. Quem quiser antecipar ainda mais pode ofertar um lance adicional.',
      detalhe: 'Você pode ser contemplado no 1º mês ou em qualquer mês até o fim do prazo — com ou sem dinheiro extra.',
    },
    {
      num: '04', emoji: '🏆', cor: '#7C3AED',
      titulo: 'Compra à vista e cria patrimônio',
      desc: 'Com a carta em mãos, você compra o bem à vista. O vendedor trata você como comprador à vista — e você ainda consegue negociar descontos que nenhum financiado conseguiria.',
      detalhe: 'Você paga o preço real do bem. Sem dar um centavo a mais para o banco.',
    },
  ]

  return (
    <>
      <style>{`
        :root { font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; }
        @keyframes heroFloat { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
        @keyframes gradientPulse {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float1 { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-18px) rotate(3deg); } }
        @keyframes float2 { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-12px) rotate(-2deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .hero-img { animation: heroFloat 14s ease-in-out infinite; }
        .gold-btn {
          background: linear-gradient(135deg, #C9A84C 0%, #E2C06A 50%, #C9A84C 100%);
          background-size: 200% 200%;
          box-shadow: 0 4px 24px rgba(201,168,76,0.35);
          transition: all 0.3s ease;
        }
        .gold-btn:hover { animation: gradientPulse 2s ease infinite; box-shadow: 0 8px 40px rgba(201,168,76,0.5); transform: translateY(-2px); }
        .gold-btn:active { transform: translateY(0); }
        .glow-blue { box-shadow: 0 0 0 0 rgba(28,95,168,0); transition: box-shadow 0.3s ease; }
        .glow-blue:hover { box-shadow: 0 0 30px rgba(28,95,168,0.25), 0 8px 32px rgba(28,95,168,0.15); }
        .glow-gold:hover { box-shadow: 0 0 30px rgba(201,168,76,0.3), 0 8px 32px rgba(201,168,76,0.15); }
        .card-lift { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease; }
        .card-lift:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(28,95,168,0.15); }
        .step-btn-active { background: linear-gradient(135deg, #1C5FA8, #0D3D72) !important; color: white !important; box-shadow: 0 8px 32px rgba(28,95,168,0.3) !important; }
        .glass { background: rgba(255,255,255,0.65); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.8); }
        .shimmer-text {
          background: linear-gradient(90deg, #0D3D72 0%, #1C5FA8 30%, #C9A84C 50%, #1C5FA8 70%, #0D3D72 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      <div style={{ background: C.bg, color: C.text }} className="min-h-screen">

        {/* ── NAVBAR ──────────────────────────────────────────────── */}
        <nav style={{ background: 'rgba(255,255,255,0.92)', borderBottom: `1px solid ${C.border}` }}
          className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md"
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <AdemIconLogo size="md" />
            <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: C.muted }}>
              <a href="#como-funciona" className="hover:text-[#1C5FA8] transition-colors">Como funciona</a>
              <a href="#comparativo"   className="hover:text-[#1C5FA8] transition-colors">Comparativo</a>
              <a href="#faq"           className="hover:text-[#1C5FA8] transition-colors">Dúvidas</a>
            </div>
            <button onClick={() => abrirModal('navbar')} className="gold-btn text-white font-bold px-5 py-2.5 rounded-full text-sm">
              Simular grátis
            </button>
          </div>
        </nav>

        {/* ── HERO FULL-SCREEN ─────────────────────────────────────── */}
        <section className="relative h-screen min-h-[640px] max-h-[960px] overflow-hidden" id="produtos">
          <AnimatePresence mode="sync">
            <motion.div key={produtoAtivo} initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.1 }} className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.img} alt={p.label} className="hero-img w-full h-full object-cover" style={{ objectPosition: p.imgPosition ?? 'center' }} />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(110deg, rgba(13,61,114,0.88) 0%, rgba(13,61,114,0.60) 55%, rgba(13,61,114,0.25) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,61,114,0.75) 0%, transparent 50%)' }} />

          <div className="relative z-10 h-full flex flex-col pt-28 pb-40 px-6 max-w-7xl mx-auto">
            <div className="max-w-2xl">
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
                style={{ background: 'rgba(201,168,76,0.18)', border: '1px solid rgba(201,168,76,0.45)', color: '#F0D98A' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
                Parceria com a maior administradora privada do Brasil
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.05 }}
                className="text-4xl md:text-5xl lg:text-[60px] font-black leading-[0.92] mb-5 tracking-tight text-white drop-shadow-2xl">
                Compre o que<br />
                <span style={{ color: '#F0D98A' }}>você quer.</span><br />
                <AnimatePresence mode="wait">
                  <motion.span key={produtoAtivo} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }} className="text-white">
                    {p.headline}
                  </motion.span>
                </AnimatePresence>
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.15 }}
                className="text-white/85 text-lg leading-relaxed mb-7 max-w-md drop-shadow">
                Sem juros. Sem taxa de adesão. Você contrata uma carta de crédito, paga parcelas mensais e compra à vista quando for contemplado.
              </motion.p>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }} className="flex flex-wrap gap-3">
                <a href="#como-funciona" className="inline-flex items-center gap-2 font-semibold px-6 py-4 rounded-full text-base transition-all text-white"
                  style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
                  Como funciona
                </a>
                <button onClick={() => abrirModal('hero')} className="gold-btn inline-flex items-center gap-2 text-white font-black px-8 py-4 rounded-full text-base">
                  Quero fazer meu consórcio <ArrowRight className="w-5 h-5" />
                </button>
                <a href="https://wa.me/5511993929660?text=Ol%C3%A1%2C%20quero%20agendar%20uma%20reuni%C3%A3o%20com%20um%20especialista%20em%20cons%C3%B3rcio." target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold px-6 py-4 rounded-full text-base transition-all text-white"
                  style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
                  Agendar reunião com especialista
                </a>
              </motion.div>
            </div>

            <div className="absolute bottom-8 left-6 right-6 max-w-7xl">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>Escolha o produto</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {PRODUTOS.map((prod, i) => {
                  const Icon = prod.Icon
                  const ativo = produtoAtivo === i
                  return (
                    <button key={prod.label} onClick={() => setProdutoAtivo(i)}
                      className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300"
                      style={ativo ? { background: C.gold, color: '#fff', boxShadow: '0 4px 16px rgba(201,168,76,0.4)' } : { background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.15)' }}>
                      <Icon className="w-4 h-4 flex-shrink-0" />{prod.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── COMO FUNCIONA — stepper interativo ──────────────────── */}
        <section id="como-funciona" className="py-24 px-6" style={{ background: C.bg }}>
          <div className="max-w-6xl mx-auto">

            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }} className="text-center mb-16">
              <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3" style={{ color: C.blue }}>Entenda de uma vez</p>
              <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: C.text }}>
                Como funciona o consórcio
              </h2>
              <p className="text-lg max-w-xl mx-auto" style={{ color: C.muted }}>
                Simples como deveria ser. Clique em cada etapa para entender.
              </p>
            </motion.div>

            {/* Botões de etapa */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {STEPS.map((s, i) => (
                <motion.button key={i} onClick={() => setStepAtivo(i)}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold border-2 transition-all duration-300 ${stepAtivo === i ? 'step-btn-active' : ''}`}
                  style={stepAtivo !== i ? { background: C.bgSoft, color: C.muted, borderColor: C.border } : { borderColor: 'transparent' }}>
                  <span className="text-lg">{s.emoji}</span>
                  <span className="hidden sm:inline">{s.titulo.split(' ').slice(0, 3).join(' ')}…</span>
                  <span className="sm:hidden">{s.num}</span>
                </motion.button>
              ))}
            </div>

            {/* Painel de etapa ativo */}
            <AnimatePresence mode="wait">
              <motion.div key={stepAtivo}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.98 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="rounded-3xl p-8 md:p-12 relative overflow-hidden glow-blue"
                style={{ background: `linear-gradient(135deg, ${C.bgSoft} 0%, #fff 100%)`, border: `2px solid ${C.border}` }}>

                {/* Número decorativo de fundo */}
                <div className="absolute right-8 top-4 font-black text-[120px] leading-none select-none pointer-events-none"
                  style={{ color: STEPS[stepAtivo].cor, opacity: 0.06 }}>
                  {STEPS[stepAtivo].num}
                </div>

                <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
                  <div>
                    <div className="inline-flex items-center gap-3 mb-6">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${STEPS[stepAtivo].cor}22, ${STEPS[stepAtivo].cor}44)`, border: `2px solid ${STEPS[stepAtivo].cor}44` }}>
                        {STEPS[stepAtivo].emoji}
                      </div>
                      <span className="text-xs font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full"
                        style={{ background: `${STEPS[stepAtivo].cor}18`, color: STEPS[stepAtivo].cor }}>
                        Etapa {STEPS[stepAtivo].num}
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black mb-4" style={{ color: C.text }}>
                      {STEPS[stepAtivo].titulo}
                    </h3>
                    <p className="text-base leading-relaxed mb-4" style={{ color: C.muted }}>
                      {STEPS[stepAtivo].desc}
                    </p>
                    <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: `${STEPS[stepAtivo].cor}0D`, border: `1px solid ${STEPS[stepAtivo].cor}30` }}>
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: STEPS[stepAtivo].cor }} />
                      <p className="text-sm font-semibold" style={{ color: C.text }}>{STEPS[stepAtivo].detalhe}</p>
                    </div>
                  </div>

                  {/* Indicador visual de progresso */}
                  <div className="flex flex-col gap-3">
                    {STEPS.map((s, i) => (
                      <motion.button key={i} onClick={() => setStepAtivo(i)}
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200"
                        style={stepAtivo === i
                          ? { background: '#fff', border: `2px solid ${s.cor}`, boxShadow: `0 4px 20px ${s.cor}25` }
                          : { background: 'transparent', border: '2px solid transparent', opacity: 0.5 }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: stepAtivo === i ? `${s.cor}20` : C.bgSoft }}>
                          {s.emoji}
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: stepAtivo === i ? s.cor : C.muted }}>{s.num}</p>
                          <p className="text-sm font-semibold" style={{ color: C.text }}>{s.titulo}</p>
                        </div>
                        {stepAtivo === i && (
                          <motion.div layoutId="step-indicator" className="ml-auto w-2 h-2 rounded-full" style={{ background: s.cor }} />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* ── COMPARATIVO ─────────────────────────────────────────── */}
        <section id="comparativo" className="py-24 px-6" style={{ background: C.bgSoft }}>
          <div className="max-w-5xl mx-auto">

            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }} className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3" style={{ color: C.blue }}>A verdade dos números</p>
              <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: C.text }}>
                O que você <span className="shimmer-text">realmente paga</span>
              </h2>
              <p className="text-lg" style={{ color: C.muted }}>Selecione o bem e compare.</p>
            </motion.div>

            {/* Toggle */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex p-1.5 rounded-2xl gap-1" style={{ background: '#fff', border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(28,95,168,0.08)' }}>
                {(['imovel', 'carro'] as const).map((b) => {
                  const Icon = b === 'imovel' ? Home : Car
                  const ativo = bemPreview === b
                  return (
                    <motion.button key={b} onClick={() => setBemPreview(b)} whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300"
                      style={ativo ? { background: C.blue, color: '#fff', boxShadow: '0 4px 16px rgba(28,95,168,0.3)' } : { color: C.muted }}>
                      <Icon className="w-4 h-4" />
                      {b === 'imovel' ? 'Imóvel R$300k' : 'Automóvel R$80k'}
                    </motion.button>
                  )
                })}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={bemPreview} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <div className="grid md:grid-cols-2 gap-5 mb-5">

                  {/* Financiamento */}
                  <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}
                    className="bg-white rounded-3xl p-7" style={{ border: '2px solid #FECACA', boxShadow: '0 4px 24px rgba(220,38,38,0.08)' }}>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-red-500" />
                      </div>
                      <p className="font-black text-sm uppercase tracking-wide text-red-600">Financiamento bancário</p>
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: 'Entrada obrigatória', val: fmt(ex.entradaFin), bad: true },
                        { label: 'Prazo',                val: `${ex.prazoFin} meses` },
                        { label: 'Taxa de juros',        val: '~12% ao ano', bad: true },
                        { label: 'Parcela mensal',       val: `${fmt(ex.parcelaFin)}/mês` },
                        { label: 'Juros que você paga',  val: fmt(ex.juros), bad: true },
                      ].map(row => (
                        <div key={row.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #FEF2F2' }}>
                          <span className="text-sm" style={{ color: C.muted }}>{row.label}</span>
                          <span className="text-sm font-bold" style={{ color: (row as { bad?: boolean }).bad ? '#DC2626' : C.text }}>{row.val}</span>
                        </div>
                      ))}
                      <div className="pt-3">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-bold text-red-500">Total pago</span>
                          <span className="text-3xl font-black text-red-600">{fmt(ex.totalFin)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Consórcio */}
                  <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}
                    className="bg-white rounded-3xl p-7 relative overflow-hidden" style={{ border: '2px solid #86EFAC', boxShadow: '0 4px 24px rgba(22,163,74,0.12)' }}>
                    <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-black px-3 py-1 rounded-full">
                      RECOMENDADO
                    </div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="font-black text-sm uppercase tracking-wide text-green-700">Consórcio</p>
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: 'Entrada',              val: 'R$0 — sem entrada', good: true },
                        { label: 'Prazo',                val: `${ex.prazoCons} meses` },
                        { label: 'Taxa de juros',        val: 'Zero ✓', good: true },
                        { label: 'Parcela mensal',       val: `${fmt(ex.parcelaCons)}/mês` },
                        { label: 'Juros que você paga',  val: 'R$0,00', good: true },
                      ].map(row => (
                        <div key={row.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #F0FDF4' }}>
                          <span className="text-sm" style={{ color: C.muted }}>{row.label}</span>
                          <span className="text-sm font-bold" style={{ color: (row as { good?: boolean }).good ? '#16A34A' : C.text }}>{row.val}</span>
                        </div>
                      ))}
                      <div className="pt-3">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-bold text-green-600">Total pago</span>
                          <span className="text-3xl font-black text-green-700">{fmt(ex.totalCons)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Economia em destaque */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
                  className="rounded-3xl p-7 flex flex-col sm:flex-row items-center justify-between gap-5"
                  style={{ background: `linear-gradient(135deg, ${C.blueDark} 0%, ${C.blue} 100%)`, boxShadow: `0 16px 48px rgba(13,61,114,0.3)` }}>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Sua economia com consórcio</p>
                    <p className="font-black text-white mb-1" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', lineHeight: 1 }}>{fmt(economiaTotal)}</p>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>que você não vai dar de presente para o banco</p>
                  </div>
                  <MagneticBtn onClick={() => abrirModal('comparativo')} className="gold-btn text-white font-black py-4 px-8 rounded-2xl text-base flex-shrink-0">
                    Ver meu cálculo personalizado →
                  </MagneticBtn>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* ── NÚMEROS DE CREDIBILIDADE ────────────────────────────── */}
        <ParallaxSection offset={20}>
          <section className="py-24 px-6" style={{ background: C.bg }}>
            <div className="max-w-5xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }} className="text-center mb-14">
                <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3" style={{ color: C.muted }}>Quem está por trás</p>
                <h2 className="text-3xl md:text-4xl font-black mb-2" style={{ color: C.text }}>Maior administradora privada do Brasil</h2>
                <p className="text-sm" style={{ color: C.muted }}>Regulada pelo Banco Central · +35 anos no mercado</p>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { n: 641, pre: '+', suf: 'mil', label: 'clientes atendidos', destaque: true },
                  { n: 906, pre: '+', suf: 'mil', label: 'cotas comercializadas', destaque: false },
                  { n: 35,  pre: '+', suf: ' anos', label: 'de mercado', destaque: false },
                  { n: 292, pre: '+', suf: '',    label: 'lojas no Brasil', destaque: false },
                  { n: 140, pre: 'R$', suf: 'bi', label: 'em créditos ativos', destaque: false },
                  { fixed: 'BACEN', label: 'fiscalizada pelo Banco Central', destaque: false },
                ].map((item, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ delay: i * 0.08, duration: 0.45 }}
                    whileHover={{ y: -4, boxShadow: '0 12px 36px rgba(28,95,168,0.18)' }}
                    className="rounded-2xl p-6 text-center transition-all duration-300 cursor-default"
                    style={(item as { destaque: boolean }).destaque
                      ? { background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, border: 'none' }
                      : { background: C.bgSoft, border: `1px solid ${C.border}` }}>
                    <p className="text-3xl md:text-4xl font-black mb-2 leading-none" style={{ color: (item as { destaque: boolean }).destaque ? '#fff' : C.text }}>
                      {(item as { fixed?: string }).fixed ? (item as { fixed: string }).fixed : <Counter to={(item as { n: number }).n} prefix={(item as { pre: string }).pre} suffix={(item as { suf: string }).suf} />}
                    </p>
                    <p className="text-xs leading-snug" style={{ color: (item as { destaque: boolean }).destaque ? 'rgba(255,255,255,0.7)' : C.muted }}>{item.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </ParallaxSection>

        {/* ── DEPOIMENTOS ──────────────────────────────────────────── */}
        <section className="py-24 px-6" style={{ background: C.bgSoft }}>
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }} className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3" style={{ color: C.blue }}>Resultados reais</p>
              <h2 className="text-3xl md:text-4xl font-black" style={{ color: C.text }}>Quem já saiu na frente</h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-5">
              {DEPOIMENTOS.map((d, i) => (
                <motion.div key={d.nome}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  whileHover={{ y: -8, boxShadow: '0 24px 60px rgba(28,95,168,0.18)' }}
                  className="bg-white rounded-3xl overflow-hidden transition-all duration-300"
                  style={{ border: `1px solid ${C.border}` }}>
                  {/* Barra colorida topo */}
                  <div className="h-1.5" style={{ background: i === 0 ? C.blue : i === 1 ? C.gold : C.blueDark }} />
                  <div className="p-7">
                    <div className="flex gap-1 mb-5">
                      {[...Array(d.stars)].map((_, j) => <Star key={j} className="w-4 h-4 fill-[#C9A84C]" style={{ color: C.gold }} />)}
                    </div>
                    <p className="text-sm leading-relaxed mb-6" style={{ color: C.muted }}>"{d.texto}"</p>
                    <div className="flex items-center justify-between pt-5" style={{ borderTop: `1px solid ${C.border}` }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black"
                          style={{ background: i === 0 ? C.blue : i === 1 ? C.gold : C.blueDark }}>
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
        <section id="faq" className="py-24 px-6" style={{ background: C.bg }}>
          <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }} className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3" style={{ color: C.muted }}>Sem mistério</p>
              <h2 className="text-3xl md:text-4xl font-black" style={{ color: C.text }}>Perguntas frequentes</h2>
            </motion.div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    border: `1.5px solid ${faqAberto === i ? C.blue : C.border}`,
                    background: faqAberto === i ? C.bgSoft : C.bg,
                    boxShadow: faqAberto === i ? `0 4px 24px rgba(28,95,168,0.1)` : 'none',
                    transition: 'all 0.25s ease',
                  }}>
                  <button onClick={() => setFaqAberto(faqAberto === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm transition-colors"
                    style={{ color: faqAberto === i ? C.blue : C.text }}>
                    <span>{item.pergunta}</span>
                    <motion.div animate={{ rotate: faqAberto === i ? 180 : 0 }} transition={{ duration: 0.25 }} className="flex-shrink-0 ml-4">
                      <ChevronDown className="w-5 h-5" style={{ color: C.blue }} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {faqAberto === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                        <p className="px-5 pb-6 text-sm leading-relaxed" style={{ color: C.muted, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
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
        <section className="py-28 px-6 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${C.blueDark} 0%, ${C.blue} 60%, #2A7BD8 100%)` }}>
          {/* Orbs de glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute" style={{ width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.25) 0%, transparent 70%)', top: '-100px', right: '-100px' }} />
            <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="absolute" style={{ width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', bottom: '-80px', left: '-80px' }} />
          </div>

          <div className="max-w-2xl mx-auto text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6 }}>
              <p className="text-xs font-bold uppercase tracking-[0.3em] mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>A decisão é agora</p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
                Cada mês que passa,<br />
                <motion.span animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 2.5, repeat: Infinity }} style={{ color: C.goldLight }}>
                  dinheiro indo pro banco.
                </motion.span>
              </h2>
              <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Simule agora. Gratuito, leva 2 minutos, e você vê exatamente quanto pode economizar.
              </p>
              <MagneticBtn onClick={() => abrirModal('cta-final')} className="gold-btn inline-flex items-center gap-3 text-white font-black px-10 py-5 rounded-2xl text-xl">
                Simular gratuitamente <ArrowRight className="w-6 h-6" />
              </MagneticBtn>
              <p className="text-sm mt-5" style={{ color: 'rgba(255,255,255,0.3)' }}>Sem compromisso · Sem cadastro · Resposta em até 2 horas</p>
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
            <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.2)' }}>
              <p>© {new Date().getFullYear()} Indica Consórcio. Todos os direitos reservados.</p>
              <p className="text-center">As simulações são estimativas com base em taxas médias de mercado e não constituem proposta formal de contrato.</p>
            </div>
          </div>
        </footer>

        {/* ── WHATSAPP FIXO ────────────────────────────────────────── */}
        <motion.a
          href="https://wa.me/5511993929660?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20quero%20saber%20mais%20sobre%20o%20cons%C3%B3rcio."
          target="_blank" rel="noopener noreferrer"
          onClick={() => trackEvent('whatsapp_fixo_click', { label: 'home' })}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 text-white font-bold px-5 py-3.5 rounded-full shadow-2xl"
          style={{ background: '#25d366' }}
          whileHover={{ scale: 1.07, boxShadow: '0 8px 40px rgba(37,211,102,0.5)' }}
          whileTap={{ scale: 0.95 }}
          aria-label="Tire suas dúvidas pelo WhatsApp"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.522 5.853L0 24l6.303-1.493A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.816 9.816 0 01-5.007-1.369l-.359-.214-3.741.98.999-3.648-.233-.374A9.817 9.817 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
          </svg>
          <span className="text-sm">Falar com consultor</span>
        </motion.a>

        {/* ── MODAL SIMULADOR ──────────────────────────────────────── */}
        <AnimatePresence>
          {modalOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setModalOpen(false)} className="fixed inset-0 z-50 backdrop-blur-sm"
                style={{ background: 'rgba(13,27,62,0.75)' }} />
              <motion.div
                initial={{ opacity: 0, scale: 0.93, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 24 }}
                transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg px-4">
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
