'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Calculadora from '@/components/calculator/Calculadora'
import AdemIconLogo from '@/components/AdemIconLogo'
import { Star, ArrowRight, Home, Car, Building2, Wrench, TrendingUp, CheckCircle, XCircle, Hammer, Plane, Briefcase, type LucideIcon } from 'lucide-react'
import { trackEvent } from '@/lib/gtag'

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)
}

interface Produto { label: string; Icon: LucideIcon; img: string; tag: string }
const PRODUTOS: Produto[] = [
  { label: 'Imóvel',       Icon: Home,        img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1400&q=85',  tag: 'A partir de R$500/mês' },
  { label: 'Automóvel',    Icon: Car,         img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&q=85',  tag: 'A partir de R$400/mês' },
  { label: 'Investimento', Icon: TrendingUp,  img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1400&q=85',  tag: 'Rentabilidade real' },
  { label: 'Construção',   Icon: Hammer,      img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=85',  tag: 'Construa sem banco' },
  { label: 'Reforma',      Icon: Wrench,      img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1400&q=85',     tag: 'Valorize seu imóvel' },
  { label: 'Negócio',      Icon: Building2,   img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=85',  tag: 'Expansão sem juros' },
  { label: 'Viagens',      Icon: Plane,       img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1400&q=85',  tag: 'Explore o mundo' },
  { label: 'Serviços',     Icon: Briefcase,   img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1400&q=85',  tag: 'Soluções para seu negócio' },
]

const FAQ = [
  { pergunta: 'Quanto tempo leva para ser contemplado?',   resposta: 'O tempo médio varia entre 12 e 36 meses para imóveis e 6 a 24 meses para veículos. Você pode antecipar com um lance — quanto maior o lance, maior a chance de ser contemplado mais rápido.' },
  { pergunta: 'Tem taxa de adesão ou juros?',              resposta: 'Não existe taxa de adesão e zero juros. Você paga apenas uma taxa administrativa incluída na parcela mensal. É exatamente essa diferença que gera a economia de centenas de milhares de reais comparado ao financiamento.' },
  { pergunta: 'E se eu precisar do bem com urgência?',     resposta: 'Se a necessidade for imediata, o consórcio pode não ser a melhor escolha. Mas para quem planeja — e o planejamento começa hoje — é o instrumento mais inteligente: você paga até 50% menos no total.' },
  { pergunta: 'O consórcio é seguro? É regulamentado?',   resposta: 'Sim. As administradoras de consórcio são regulamentadas e fiscalizadas pelo Banco Central do Brasil. Nossa parceira é a maior administradora privada do país, com mais de 35 anos de mercado e mais de 641 mil clientes atendidos.' },
  { pergunta: 'Posso usar o FGTS no consórcio de imóvel?', resposta: 'Sim. Para consórcios de imóveis, você pode usar o FGTS tanto para dar um lance quanto para abater o saldo devedor após ser contemplado.' },
]

const DEPOIMENTOS = [
  { nome: 'Mariana C.',  cidade: 'São Paulo, SP',      texto: 'Fiz a simulação, vi que economizaria R$87.000 e fechei em uma semana. Melhor decisão da minha vida.',                                         bem: 'Imóvel',  economia: 'R$87.000'  },
  { nome: 'Ricardo A.',  cidade: 'Campinas, SP',       texto: 'Tinha financiamento ativo e pagava juros absurdos. Migrei pro consórcio e reduzi minha parcela em R$800 por mês.',                            bem: 'Veículo', economia: 'R$800/mês' },
  { nome: 'Fernanda L.', cidade: 'Ribeirão Preto, SP', texto: 'Fui contemplada em 14 meses com um lance. Hoje tenho meu apartamento sem ter pago fortuna em juros.',                                          bem: 'Imóvel',  economia: 'R$124.000' },
]

const EXEMPLOS = {
  imovel: { label: 'Imóvel R$300k',    parcelaFin: 3087, totalFin: 1111320, prazoFin: 360, entradaFin: 90000, parcelaCons: 1011, totalCons: 372000, prazoCons: 220, entradaCons: 0 },
  carro:  { label: 'Automóvel R$80k',  parcelaFin: 2027, totalFin: 121620,  prazoFin: 60,  entradaFin: 24000, parcelaCons: 1048, totalCons: 92800,  prazoCons: 80,  entradaCons: 0 },
}

/* Paleta */
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
              <img src={p.img} alt={p.label} className="hero-img w-full h-full object-cover" />
            </motion.div>
          </AnimatePresence>

          {/* Overlay azul royal — não preto */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(110deg, rgba(13,61,114,0.88) 0%, rgba(13,61,114,0.60) 55%, rgba(13,61,114,0.25) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,61,114,0.75) 0%, transparent 50%)' }} />

          <div className="relative z-10 h-full flex flex-col justify-between pt-28 pb-10 px-6 max-w-7xl mx-auto">

            {/* Headline */}
            <div className="max-w-2xl">

              {/* Badge */}
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
                className="text-5xl md:text-6xl lg:text-[72px] font-black leading-[0.92] mb-5 tracking-tight text-white drop-shadow-2xl"
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
                    {p.label} próprio.
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
                <button
                  onClick={() => abrirModal('hero')}
                  className="gold-btn inline-flex items-center gap-2 text-white font-black px-8 py-4 rounded-full text-base transition-all"
                >
                  Simular minha economia
                  <ArrowRight className="w-5 h-5" />
                </button>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-full text-base transition-all text-white"
                  style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}
                >
                  Como funciona
                </a>
              </motion.div>

            </div>

            {/* Tabs de produto */}
            <div>
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

        {/* ── COMPARATIVO DETALHADO ───────────────────────────────── */}
        <section style={{ background: C.bgSoft, borderBottom: `1px solid ${C.border}` }} className="py-14 px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-widest font-semibold text-center mb-6" style={{ color: C.muted }}>Compare antes de simular</p>

            <div className="flex gap-2 justify-center mb-8">
              {(['imovel', 'carro'] as const).map((b) => {
                const Icon = b === 'imovel' ? Home : Car
                const ativo = bemPreview === b
                return (
                  <button
                    key={b}
                    onClick={() => setBemPreview(b)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all"
                    style={ativo
                      ? { background: C.blue, color: '#fff' }
                      : { background: '#fff', color: C.muted, border: `1px solid ${C.border}` }
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {b === 'imovel' ? 'Imóvel R$300k' : 'Automóvel R$80k'}
                  </button>
                )
              })}
            </div>

            {/* Tabela lado a lado */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Financiamento */}
              <div className="bg-white rounded-2xl p-5 card-hover" style={{ border: '1px solid #FECACA' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#DC2626' }}>Financiamento</p>
                <div className="space-y-2.5">
                  {([
                    { label: 'Entrada exigida',  val: fmt(ex.entradaFin),         bad: true  },
                    { label: 'Prazo',             val: `${ex.prazoFin} meses`,     bad: false },
                    { label: 'Juros',             val: '~12% ao ano',              bad: true  },
                    { label: 'Parcela mensal',    val: `${fmt(ex.parcelaFin)}/mês`, bad: false, big: true },
                    { label: 'Total que você paga', val: fmt(ex.totalFin),         bad: true,  big: true },
                  ] as { label: string; val: string; bad?: boolean; big?: boolean }[]).map((row) => (
                    <div key={row.label}
                      className="flex items-center justify-between"
                      style={row.big ? { borderTop: '1px solid #FEE2E2', paddingTop: '8px', marginTop: '4px' } : {}}
                    >
                      <span className="text-xs" style={{ color: C.muted }}>{row.label}</span>
                      <span className={`font-bold ${row.big ? 'text-base' : 'text-sm'}`} style={{ color: row.bad ? '#DC2626' : C.text }}>{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consórcio */}
              <div className="bg-white rounded-2xl p-5 card-hover" style={{ border: '1px solid #BBF7D0' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#16A34A' }}>Consórcio</p>
                <div className="space-y-2.5">
                  {([
                    { label: 'Entrada',           val: 'R$0 — sem entrada',        good: true  },
                    { label: 'Prazo',             val: `${ex.prazoCons} meses`,    good: false },
                    { label: 'Juros',             val: 'Zero — sem juros',         good: true  },
                    { label: 'Taxa administrativa', val: 'apenas 1,2% ao ano',     good: false },
                    { label: 'Parcela mensal',    val: `${fmt(ex.parcelaCons)}/mês`, good: false, big: true },
                    { label: 'Total que você paga', val: fmt(ex.totalCons),        good: true,  big: true },
                  ] as { label: string; val: string; good?: boolean; big?: boolean }[]).map((row) => (
                    <div key={row.label}
                      className="flex items-center justify-between"
                      style={row.big ? { borderTop: '1px solid #BBF7D0', paddingTop: '8px', marginTop: '4px' } : {}}
                    >
                      <span className="text-xs" style={{ color: C.muted }}>{row.label}</span>
                      <span className={`font-bold ${row.big ? 'text-base' : 'text-sm'}`} style={{ color: row.good ? '#16A34A' : C.text }}>{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Economia */}
            <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{ background: 'linear-gradient(135deg, #FFF8E7 0%, #FFF3CC 100%)', border: '1px solid rgba(201,168,76,0.35)' }}
            >
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: C.goldDark }}>Você economiza no total</p>
                <p className="font-black text-4xl" style={{ color: C.gold }}>{fmt(economiaTotal)}</p>
                <p className="text-sm mt-1" style={{ color: C.goldDark }}>{fmt(economiaMes)}/mês no bolso até a contemplação</p>
              </div>
              <button
                onClick={() => abrirModal('comparativo')}
                className="gold-btn text-white font-bold py-3.5 px-7 rounded-xl transition-all text-sm flex-shrink-0"
              >
                Calcular o meu →
              </button>
            </div>
          </div>
        </section>

        {/* ── COMO FUNCIONA ────────────────────────────────────────── */}
        <section id="como-funciona" style={{ background: C.bg }} className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: C.blue }}>A solução inteligente</p>
              <h2 className="text-4xl md:text-5xl font-black mb-5" style={{ color: C.text }}>Como funciona o consórcio</h2>
              <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: C.muted }}>
                Você paga uma parcela mensal sem juros e sem taxa de adesão.
                Quando contemplado, compra o bem à vista com poder de negociação real.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                { num: '01', cor: C.blue, titulo: 'Contrata a carta de crédito', desc: 'Você escolhe o valor da carta — igual ao valor do bem que quer comprar. Sem entrada, sem aprovação de banco, sem score mínimo exigido.' },
                { num: '02', cor: C.gold, titulo: 'Paga mensalmente, sem juros',  desc: 'Todo mês você paga uma parcela com apenas taxa administrativa (1,2% ao ano). Nada de juros. Mensalmente há contemplações por sorteio — e você pode acelerar dando um lance.' },
                { num: '03', cor: C.blue, titulo: 'Compra à vista, fica com o bem', desc: 'Ao ser contemplado, usa a carta para comprar à vista. Com esse poder de negociação, consegue descontos que nenhum financiado conseguiria.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.12 }}
                  className="bg-white rounded-2xl p-7 card-hover"
                  style={{ border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(28,95,168,0.06)' }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white mb-5" style={{ background: item.cor }}>
                    {item.num}
                  </div>
                  <h3 className="font-bold text-lg mb-3" style={{ color: C.text }}>{item.titulo}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{item.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Resumo do resultado */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              className="rounded-2xl p-6 mb-8 text-center"
              style={{ background: C.bgSoft, border: `1px solid ${C.border}` }}
            >
              <p className="font-bold text-lg mb-2" style={{ color: C.text }}>O resultado:</p>
              <p className="text-base leading-relaxed max-w-2xl mx-auto" style={{ color: C.muted }}>
                Você fica com o bem pagando parcelas muito menores do que no banco —
                sem ter dado entrada, sem ter pago um centavo de juros.
                Enquanto o financiado entrega metade do dinheiro pro banco em juros,
                <strong style={{ color: C.text }}> você cria patrimônio pagando o preço real do bem.</strong>
              </p>
            </motion.div>

            {/* Checklist rápido */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              className="rounded-3xl p-8"
              style={{ background: C.bgSoft, border: `1px solid ${C.border}` }}
            >
              <p className="text-xs uppercase tracking-widest font-semibold mb-7 text-center" style={{ color: C.muted }}>Financiamento vs Consórcio</p>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#DC2626' }}>❌ Financiamento</p>
                  <ul className="space-y-3.5">
                    {['30% de entrada obrigatória no ato', 'Juros de 12% a 18% ao ano', 'IOF e tarifas ocultas no contrato', 'Score alto exigido para aprovação', 'Você paga quase o dobro do preço do bem'].map((t) => (
                      <li key={t} className="flex items-start gap-3 text-sm" style={{ color: C.muted }}>
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />{t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#16A34A' }}>✓ Consórcio</p>
                  <ul className="space-y-3.5">
                    {['Sem entrada — começa do zero', 'Zero juros — só 1,2% de taxa ao ano', 'Sem IOF, sem taxas ocultas', 'Processo simples de adesão', 'Você paga o preço real do bem'].map((t) => (
                      <li key={t} className="flex items-start gap-3 text-sm font-medium" style={{ color: C.text }}>
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />{t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── DOR — QUANTO VAI AO BANCO ───────────────────────────── */}
        <section style={{ background: C.bgSoft, borderTop: `1px solid ${C.border}` }} className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: C.blue }}>A verdade que o banco não te conta</p>
              <h2 className="text-4xl md:text-5xl font-black leading-tight mb-4" style={{ color: C.text }}>
                Quanto você vai<br />
                <span style={{ color: '#DC2626' }}>dar de presente ao banco?</span>
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: C.muted }}>
                Em todo financiamento, a maior parte do que você paga vai direto para o banco — não para o bem.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5 mb-10">
              {[
                { titulo: 'Imóvel R$300.000', fin: 1111320, cons: 372000, img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80' },
                { titulo: 'Imóvel R$500.000', fin: 1852200, cons: 620000, img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80' },
                { titulo: 'Veículo R$80.000',  fin: 121620,  cons: 92800,  img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl overflow-hidden card-hover"
                  style={{ border: `1px solid ${C.border}` }}
                >
                  <div className="relative h-36 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.img} alt={item.titulo} className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: 'rgba(13,61,114,0.55)' }} />
                    <p className="absolute bottom-3 left-4 text-white font-bold text-sm drop-shadow">{item.titulo}</p>
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase mb-1" style={{ color: C.muted }}>Com financiamento</p>
                      <p className="font-black text-2xl" style={{ color: C.text }}>{fmt(item.fin)}</p>
                    </div>
                    <div className="h-px" style={{ background: C.border }} />
                    <div>
                      <p className="text-[10px] font-bold uppercase mb-1" style={{ color: C.blue }}>Com consórcio</p>
                      <p className="font-black text-2xl" style={{ color: C.text }}>{fmt(item.cons)}</p>
                    </div>
                    <div className="rounded-xl px-4 py-3" style={{ background: '#FFF8E7', border: '1px solid rgba(201,168,76,0.3)' }}>
                      <p className="font-black text-xl" style={{ color: C.gold }}>{fmt(item.fin - item.cons)}</p>
                      <p className="text-xs" style={{ color: C.goldDark }}>entregues ao banco desnecessariamente</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-white rounded-3xl p-8 text-center" style={{ border: `1px solid ${C.border}` }}>
              <p className="text-sm mb-5 max-w-xl mx-auto" style={{ color: C.muted }}>
                Esses números são calculados com as taxas médias praticadas pelos bancos brasileiros.
                A diferença existe porque o consórcio não tem juros — só taxa administrativa.
              </p>
              <button
                onClick={() => abrirModal('dor')}
                className="gold-btn inline-flex items-center gap-2 text-white font-bold px-7 py-3.5 rounded-full transition-all"
              >
                Ver meu cálculo personalizado
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ── CTA SIMULADOR ────────────────────────────────────────── */}
        <section className="py-20 px-6 relative overflow-hidden" style={{ background: C.blue }}>
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>Calcule o seu agora</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">Quanto você economiza?</h2>
            <p className="text-lg mb-8 text-white/80">
              Informe o bem e o valor. Em 2 minutos você vê a diferença exata — personalizada para o seu caso.
            </p>
            <button
              onClick={() => abrirModal('cta-meio')}
              className="gold-btn inline-flex items-center gap-3 text-white font-black px-10 py-5 rounded-2xl text-xl transition-all"
            >
              Simular minha economia
              <ArrowRight className="w-6 h-6" />
            </button>
            <p className="text-sm mt-4" style={{ color: 'rgba(255,255,255,0.5)' }}>Gratuito · Sem compromisso · Sem cadastro inicial</p>
          </div>
        </section>

        {/* ── CREDIBILIDADE ────────────────────────────────────────── */}
        <section style={{ background: C.bg }} className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.muted }}>Quem está por trás</p>
              <h2 className="text-3xl font-black" style={{ color: C.text }}>A maior administradora privada do Brasil</h2>
              <p className="text-sm mt-2" style={{ color: C.muted }}>Regulada pelo Banco Central · +35 anos no mercado · presente em todo o território nacional</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { num: '+292',     label: 'lojas no Brasil e exterior',  destaque: false },
                { num: 'R$140bi',  label: 'em créditos comercializados', destaque: false },
                { num: '+641mil',  label: 'clientes atendidos',          destaque: true  },
                { num: '+906mil',  label: 'cotas comercializadas',       destaque: false },
                { num: '+35 anos', label: 'de experiência no mercado',   destaque: false },
                { num: 'Bacen',    label: 'Regulada pelo Banco Central', destaque: false },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.05 }}
                  className="col-span-2 md:col-span-1 lg:col-span-2 rounded-2xl p-6 text-center card-hover"
                  style={item.destaque
                    ? { background: C.gold, border: 'none' }
                    : { background: C.bgSoft, border: `1px solid ${C.border}` }
                  }
                >
                  <p className="text-3xl font-black mb-1" style={{ color: item.destaque ? '#fff' : C.text }}>{item.num}</p>
                  <p className="text-sm" style={{ color: item.destaque ? 'rgba(255,255,255,0.85)' : C.muted }}>{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DEPOIMENTOS ──────────────────────────────────────────── */}
        <section style={{ background: C.bgSoft, borderTop: `1px solid ${C.border}` }} className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.blue }}>Resultados reais</p>
              <h2 className="text-3xl font-black" style={{ color: C.text }}>Quem já saiu na frente</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {DEPOIMENTOS.map((d, i) => (
                <motion.div
                  key={d.nome}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 card-hover"
                  style={{ border: `1px solid ${C.border}` }}
                >
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-[#C9A84C]" style={{ color: C.gold }} />)}
                  </div>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: C.muted }}>&quot;{d.texto}&quot;</p>
                  <div className="pt-4 flex items-center justify-between" style={{ borderTop: `1px solid ${C.border}` }}>
                    <div>
                      <p className="font-bold text-sm" style={{ color: C.text }}>{d.nome}</p>
                      <p className="text-xs" style={{ color: C.muted }}>{d.cidade}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: C.muted }}>{d.bem}</p>
                      <p className="font-bold text-sm" style={{ color: '#16A34A' }}>Economizou {d.economia}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        <section id="faq" style={{ background: C.bg }} className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.muted }}>Dúvidas</p>
              <h2 className="text-3xl font-black" style={{ color: C.text }}>Perguntas frequentes</h2>
            </div>
            <div className="space-y-2">
              {FAQ.map((item, i) => (
                <div key={i} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.border}`, background: C.bgSoft }}>
                  <button
                    onClick={() => setFaqAberto(faqAberto === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm transition-colors hover:opacity-80"
                    style={{ color: C.text }}
                  >
                    {item.pergunta}
                    <span className="ml-3 flex-shrink-0 text-2xl leading-none font-black" style={{ color: C.blue }}>
                      {faqAberto === i ? '−' : '+'}
                    </span>
                  </button>
                  <AnimatePresence>
                    {faqAberto === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-sm leading-relaxed pt-4" style={{ color: C.muted, borderTop: `1px solid ${C.border}` }}>
                          {item.resposta}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────────────── */}
        <section className="py-24 px-6 relative overflow-hidden" style={{ background: C.bgSoft, borderTop: `1px solid ${C.border}` }}>
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight" style={{ color: C.text }}>
              Cada mês que passa,<br />dinheiro indo
              <span style={{ color: '#DC2626' }}> direto pro banco.</span>
            </h2>
            <p className="text-lg mb-8" style={{ color: C.muted }}>
              Simule agora. Gratuito, leva 2 minutos, e você vê exatamente quanto pode economizar.
            </p>
            <button
              onClick={() => abrirModal('cta-final')}
              className="gold-btn inline-flex items-center gap-3 text-white font-black px-10 py-5 rounded-2xl text-xl transition-all"
            >
              Simular gratuitamente
              <ArrowRight className="w-6 h-6" />
            </button>
            <p className="text-sm mt-4" style={{ color: C.muted }}>Sem compromisso · Sem cadastro · Resposta em até 2 horas</p>
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
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
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
