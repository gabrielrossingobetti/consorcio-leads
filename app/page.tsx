'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Calculadora from '@/components/calculator/Calculadora'
import AdemIconLogo from '@/components/AdemIconLogo'
import { Star, CheckCircle, ArrowRight } from 'lucide-react'

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)
}

const PRODUTOS = [
  {
    label: 'Imóvel',
    emoji: '🏠',
    img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80',
    tag: 'A partir de R$500/mês',
  },
  {
    label: 'Veículo',
    emoji: '🚗',
    img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80',
    tag: 'A partir de R$400/mês',
  },
  {
    label: 'Negócio',
    emoji: '🏢',
    img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80',
    tag: 'Expansão sem juros',
  },
  {
    label: 'Reforma',
    emoji: '🔨',
    img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80',
    tag: 'Valorize seu imóvel',
  },
  {
    label: 'Investimento',
    emoji: '📈',
    img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80',
    tag: 'Rentabilidade real',
  },
]

const FAQ = [
  { pergunta: 'Quanto tempo leva para ser contemplado?', resposta: 'O tempo médio varia entre 12 e 36 meses para imóveis e 6 a 24 meses para veículos. Você pode antecipar com um lance — quanto maior o lance, maior a chance de ser contemplado mais rápido.' },
  { pergunta: 'Tem taxa de adesão ou juros?', resposta: 'Não existe taxa de adesão e zero juros. Você paga apenas uma taxa administrativa incluída na parcela mensal. É exatamente essa diferença que gera a economia de centenas de milhares de reais comparado ao financiamento.' },
  { pergunta: 'E se eu precisar do bem com urgência?', resposta: 'Se a necessidade for imediata, o consórcio pode não ser a melhor escolha. Mas para quem planeja — e o planejamento começa hoje — é o instrumento mais inteligente: você paga até 50% menos no total.' },
  { pergunta: 'O consórcio é seguro? É regulamentado?', resposta: 'Sim. As administradoras de consórcio são regulamentadas e fiscalizadas pelo Banco Central do Brasil. A Ademicon é a maior administradora privada do país, com mais de 35 anos de mercado.' },
  { pergunta: 'Posso usar o FGTS no consórcio de imóvel?', resposta: 'Sim. Para consórcios de imóveis, você pode usar o FGTS tanto para dar um lance quanto para abater o saldo devedor após ser contemplado.' },
]

const DEPOIMENTOS = [
  { nome: 'Mariana C.', cidade: 'São Paulo, SP', texto: 'Fiz a simulação, vi que economizaria R$87.000 e fechei em uma semana. Melhor decisão da minha vida.', bem: 'Imóvel', economia: 'R$87.000' },
  { nome: 'Ricardo A.', cidade: 'Campinas, SP', texto: 'Tinha financiamento ativo e pagava juros absurdos. Migrei pro consórcio e reduzi minha parcela em R$800 por mês.', bem: 'Veículo', economia: 'R$800/mês' },
  { nome: 'Fernanda L.', cidade: 'Ribeirão Preto, SP', texto: 'Fui contemplada em 14 meses com um lance. Hoje tenho meu apartamento sem ter pago fortuna em juros.', bem: 'Imóvel', economia: 'R$124.000' },
]

const EXEMPLOS = {
  imovel: { label: 'Imóvel · R$300.000', parcelaFin: 3087, totalFin: 1111320, parcelaCons: 1011, totalCons: 372000 },
  carro:  { label: 'Veículo · R$80.000',  parcelaFin: 2027, totalFin: 121620,  parcelaCons: 1048, totalCons: 92800  },
}

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [faqAberto, setFaqAberto] = useState<number | null>(null)
  const [bemPreview, setBemPreview] = useState<'imovel' | 'carro'>('imovel')
  const [produtoAtivo, setProdutoAtivo] = useState(0)

  const ex = EXEMPLOS[bemPreview]
  const economiaTotal = ex.totalFin - ex.totalCons
  const economiaMensal = ex.parcelaFin - ex.parcelaCons

  // Auto-rotate product cards
  useEffect(() => {
    const t = setInterval(() => setProdutoAtivo((p) => (p + 1) % PRODUTOS.length), 3500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modalOpen])

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans">

      {/* ── NAVBAR ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#080808]/95 backdrop-blur-md border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <AdemIconLogo size="md" />
          <div className="hidden md:flex items-center gap-8 text-sm text-white/70 font-medium">
            <a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a>
            <a href="#produtos" className="hover:text-white transition-colors">Produtos</a>
            <a href="#faq" className="hover:text-white transition-colors">Dúvidas</a>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-all hover:scale-105"
          >
            Simular grátis
          </button>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="min-h-screen pt-20 pb-0 relative overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Red ambient glow */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[600px] bg-red-700/8 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 grid lg:grid-cols-2 gap-10 lg:gap-16 items-start relative z-10">

          {/* LEFT: copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-red-600/15 border border-red-500/25 text-red-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Indica Consórcio · Administrado pela Ademicon
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.92] mb-6 tracking-tight"
            >
              Compre o que<br />
              <span className="text-red-500">você quer.</span><br />
              Não o que o<br />
              banco deixa.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-white/80 text-lg leading-relaxed mb-8 max-w-lg"
            >
              Parcela mensal que cabe no seu bolso.
              Sem juros. Sem taxa de adesão.
              Contemplado, você compra o bem à vista — com poder de negociação que o financiado nunca terá.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3 mb-10"
            >
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-4 rounded-full text-base transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-950/50"
              >
                Simular minha economia
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-semibold px-8 py-4 rounded-full text-base transition-all"
              >
                Como funciona
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="flex items-center gap-5 text-sm text-white/60 mb-10"
            >
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /> Sem juros</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /> Sem taxa de adesão</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /> 100% gratuito</span>
            </motion.div>

            {/* Produtos carrossel */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              id="produtos"
            >
              <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-3">Consórcio de</p>
              <div className="flex gap-2">
                {PRODUTOS.map((p, i) => (
                  <button
                    key={p.label}
                    onClick={() => { setProdutoAtivo(i); setModalOpen(true) }}
                    className={`relative flex-1 min-w-0 rounded-2xl overflow-hidden transition-all duration-300 ${
                      produtoAtivo === i ? 'ring-2 ring-red-500 scale-[1.03]' : 'opacity-60 hover:opacity-80'
                    }`}
                    style={{ paddingTop: '90%' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.img}
                      alt={p.label}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white font-bold text-[11px] leading-tight">{p.label}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-white/50 text-xs">{PRODUTOS[produtoAtivo].emoji}</span>
                <span className="text-white/70 text-xs font-medium">{PRODUTOS[produtoAtivo].tag}</span>
                <button onClick={() => setModalOpen(true)} className="ml-auto text-red-400 text-xs font-bold hover:text-red-300 transition-colors">
                  Simular →
                </button>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Savings preview */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-[#111] border border-white/10 rounded-3xl p-7 shadow-2xl lg:sticky lg:top-24">
              <p className="text-white/50 text-xs uppercase tracking-widest font-semibold mb-5">Veja a diferença — sem simular</p>

              <div className="flex gap-1.5 mb-5 bg-white/5 p-1 rounded-2xl">
                {(['imovel', 'carro'] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBemPreview(b)}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${
                      bemPreview === b ? 'bg-red-600 text-white shadow-lg' : 'text-white/50 hover:text-white/80'
                    }`}
                  >
                    {b === 'imovel' ? '🏠 Imóvel' : '🚗 Veículo'}
                  </button>
                ))}
              </div>

              <p className="text-white/40 text-xs mb-4">{ex.label} · comparativo real</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-red-950/50 border border-red-900/40 rounded-2xl p-4">
                  <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider mb-2">Financiamento</p>
                  <p className="text-white font-black text-xl leading-none mb-1">
                    {fmt(ex.parcelaFin)}<span className="text-white/40 text-xs font-normal">/mês</span>
                  </p>
                  <p className="text-red-400/80 text-xs">Total: {fmt(ex.totalFin)}</p>
                </div>
                <div className="bg-green-950/50 border border-green-900/40 rounded-2xl p-4">
                  <p className="text-green-400 text-[10px] font-bold uppercase tracking-wider mb-2">Consórcio</p>
                  <p className="text-white font-black text-xl leading-none mb-1">
                    {fmt(ex.parcelaCons)}<span className="text-white/40 text-xs font-normal">/mês</span>
                  </p>
                  <p className="text-green-400/80 text-xs">Total: {fmt(ex.totalCons)}</p>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 mb-5 text-center">
                <p className="text-amber-400/70 text-xs uppercase tracking-widest mb-1">Você economiza</p>
                <p className="text-amber-400 font-black text-4xl mb-0.5">{fmt(economiaTotal)}</p>
                <p className="text-amber-400/50 text-xs">{fmt(economiaMensal)}/mês que ficam no seu bolso</p>
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Calcular o meu →
              </button>
              <p className="text-center text-white/30 text-xs mt-2">Gratuito · Sem compromisso · 2 minutos</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── DOR: MATEMÁTICA DO FINANCIAMENTO ──────────────────────── */}
      <section className="py-24 px-6 border-t border-white/8" style={{ background: 'linear-gradient(180deg, #0d0d0d 0%, #080808 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-4">A verdade que o banco não te conta</p>
            <h2 className="text-4xl md:text-5xl font-black leading-tight mb-4">
              Quanto você vai<br />
              <span className="text-red-500">dar de presente ao banco?</span>
            </h2>
            <p className="text-white/75 text-lg max-w-2xl mx-auto">
              Em todo financiamento, a maior parte do que você paga não vai para o bem — vai para os juros, direto para o bolso do banco.
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
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.08 }}
                className="bg-[#141414] border border-white/8 rounded-2xl overflow-hidden"
              >
                <div className="relative h-36 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.img} alt={item.titulo} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60" />
                  <p className="absolute bottom-3 left-4 text-white font-bold text-sm">{item.titulo}</p>
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <p className="text-red-400 text-[10px] font-bold uppercase mb-1">Financiamento — total pago</p>
                    <p className="text-white font-black text-2xl">{fmt(item.fin)}</p>
                  </div>
                  <div className="h-px bg-white/8" />
                  <div>
                    <p className="text-green-400 text-[10px] font-bold uppercase mb-1">Consórcio — total pago</p>
                    <p className="text-white font-black text-2xl">{fmt(item.cons)}</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                    <p className="text-amber-400 font-black text-xl">{fmt(item.fin - item.cons)}</p>
                    <p className="text-amber-400/60 text-xs">entregues ao banco desnecessariamente</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-[#141414] border border-white/8 rounded-3xl p-8 text-center">
            <p className="text-white/70 text-sm mb-5 max-w-xl mx-auto">
              Esses números são calculados com as taxas médias praticadas pelos bancos brasileiros.
              A diferença existe porque o consórcio não tem juros — só taxa administrativa.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-7 py-3.5 rounded-full transition-all hover:scale-105"
            >
              Ver meu cálculo personalizado
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ───────────────────────────────────────────── */}
      <section id="como-funciona" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">A solução inteligente</p>
            <h2 className="text-4xl md:text-5xl font-black mb-5">Como funciona o consórcio</h2>
            <p className="text-white/75 text-xl max-w-2xl mx-auto leading-relaxed">
              Você paga uma parcela mensal sem juros e sem taxa de adesão.
              Quando contemplado, compra o bem à vista — com poder de negociação real.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-14">
            {[
              { num: '01', cor: 'blue', titulo: 'Você escolhe sua parcela', desc: 'Escolhe o valor da carta de crédito e o prazo. A parcela é calculada sem juros — só a taxa administrativa, muito menor que qualquer financiamento.' },
              { num: '02', cor: 'purple', titulo: 'Entra em um grupo', desc: 'Todo mês, consorciados são contemplados por sorteio ou lance. Você pode dar um lance para ser contemplado mais rápido.' },
              { num: '03', cor: 'green', titulo: 'Compra à vista', desc: 'Ao ser contemplado, usa a carta de crédito para comprar o bem à vista. Poder de negociação que o financiado nunca tem.' },
            ].map((item, i) => {
              const colors: Record<string, string> = {
                blue: 'text-blue-400 border-blue-400/25 bg-blue-400/8',
                purple: 'text-purple-400 border-purple-400/25 bg-purple-400/8',
                green: 'text-green-400 border-green-400/25 bg-green-400/8',
              }
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.12 }}
                  className="bg-[#141414] border border-white/8 rounded-2xl p-7"
                >
                  <div className={`inline-flex w-12 h-12 rounded-xl border items-center justify-center font-black text-lg mb-5 ${colors[item.cor]}`}>
                    {item.num}
                  </div>
                  <h3 className="font-bold text-white text-lg mb-3">{item.titulo}</h3>
                  <p className="text-white/65 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              )
            })}
          </div>

          {/* Comparativo lado a lado */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            className="bg-[#141414] border border-white/8 rounded-3xl p-8"
          >
            <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-7 text-center">Financiamento vs Consórcio — a diferença real</p>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-red-400 font-bold text-xs mb-5 uppercase tracking-widest">Financiamento</p>
                <ul className="space-y-3.5">
                  {['Juros de 12% a 18% ao ano', 'IOF e tarifas ocultas no contrato', 'Score alto exigido para aprovação', 'Você paga até o dobro do preço do bem', 'Bem pode ser retomado em 3 parcelas atrasadas'].map((t) => (
                    <li key={t} className="flex items-start gap-3 text-white/65 text-sm">
                      <span className="text-red-500 mt-0.5 flex-shrink-0 font-bold">✕</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-green-400 font-bold text-xs mb-5 uppercase tracking-widest">Consórcio</p>
                <ul className="space-y-3.5">
                  {['Zero juros — só taxa administrativa', 'Sem taxa de adesão, sem IOF', 'Processo simplificado de adesão', 'Você paga o preço real do bem', 'Regulado e fiscalizado pelo Banco Central'].map((t) => (
                    <li key={t} className="flex items-start gap-3 text-white/80 text-sm">
                      <span className="text-green-400 mt-0.5 flex-shrink-0 font-bold">✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA SIMULADOR ───────────────────────────────────────────── */}
      <section className="py-20 px-6 border-y border-white/8" style={{ background: 'linear-gradient(180deg, #0d0d0d 0%, #080808 100%)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-4">Calcule o seu agora</p>
          <h2 className="text-4xl md:text-5xl font-black mb-4">Quanto você economiza?</h2>
          <p className="text-white/70 text-lg mb-8">
            Informe o bem e o valor que você quer. Em 2 minutos você vê a diferença exata — personalizada para o seu caso.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white font-black px-10 py-5 rounded-2xl text-xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-red-950/50"
          >
            Simular minha economia
            <ArrowRight className="w-6 h-6" />
          </button>
          <p className="text-white/35 text-sm mt-4">Gratuito · Sem compromisso · Sem cadastro inicial</p>
        </div>
      </section>

      {/* ── CREDIBILIDADE ───────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Quem está por trás</p>
            <h2 className="text-3xl font-black">Administrado pela Ademicon</h2>
            <p className="text-white/55 text-sm mt-2">A maior administradora de consórcios privada do Brasil</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { num: '+292', label: 'lojas no Brasil e exterior', destaque: false },
              { num: 'R$140bi', label: 'em créditos comercializados', destaque: false },
              { num: '+641mil', label: 'clientes atendidos', destaque: true },
              { num: '+906mil', label: 'cotas comercializadas', destaque: false },
              { num: '+35 anos', label: 'de experiência no mercado', destaque: false },
              { num: 'Bacen', label: 'Regulada pelo Banco Central', destaque: false },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.05 }}
                className={`col-span-2 md:col-span-1 lg:col-span-2 rounded-2xl p-6 text-center ${item.destaque ? 'bg-red-600' : 'bg-[#141414] border border-white/8'}`}
              >
                <p className="text-3xl font-black text-white mb-1">{item.num}</p>
                <p className={`text-sm ${item.destaque ? 'text-red-200' : 'text-white/55'}`}>{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-y border-white/8" style={{ background: 'linear-gradient(180deg, #0d0d0d 0%, #080808 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Resultados reais</p>
            <h2 className="text-3xl font-black">Quem já saiu na frente</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {DEPOIMENTOS.map((d, i) => (
              <motion.div
                key={d.nome}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#141414] border border-white/8 rounded-2xl p-6"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-white/75 text-sm leading-relaxed mb-5">&quot;{d.texto}&quot;</p>
                <div className="border-t border-white/8 pt-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-sm">{d.nome}</p>
                    <p className="text-white/40 text-xs">{d.cidade}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/35 text-xs">{d.bem}</p>
                    <p className="font-bold text-green-400 text-sm">Economizou {d.economia}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Dúvidas</p>
            <h2 className="text-3xl font-black">Perguntas frequentes</h2>
          </div>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <div key={i} className="border border-white/8 bg-[#141414] rounded-2xl overflow-hidden">
                <button
                  onClick={() => setFaqAberto(faqAberto === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-white/85 hover:text-white transition-colors text-sm"
                >
                  {item.pergunta}
                  <span className="text-white/35 ml-3 flex-shrink-0 text-2xl leading-none">{faqAberto === i ? '−' : '+'}</span>
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
                      <p className="px-5 pb-5 text-white/65 text-sm leading-relaxed border-t border-white/8 pt-4">
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

      {/* ── CTA FINAL ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/8" style={{ background: 'linear-gradient(180deg, #0d0d0d 0%, #080808 100%)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            Cada mês que passa, dinheiro indo
            <span className="text-red-500"> direto pro banco.</span>
          </h2>
          <p className="text-white/70 text-lg mb-8">
            Simule agora. Gratuito, leva 2 minutos, e você vê exatamente quanto pode economizar.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white font-black px-10 py-5 rounded-2xl text-xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-red-950/40"
          >
            Simular gratuitamente
            <ArrowRight className="w-6 h-6" />
          </button>
          <p className="text-white/30 text-sm mt-4">Sem compromisso · Sem cadastro · Resposta em até 2 horas</p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="bg-[#050505] py-12 px-6 border-t border-white/8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <AdemIconLogo size="sm" />
              <p className="text-white/40 text-xs mt-3 max-w-xs leading-relaxed">
                Indicação de consórcio com as melhores condições do mercado. Atendimento personalizado e sem burocracia.
              </p>
            </div>
            <div className="text-xs text-white/40 space-y-1.5">
              <p className="font-semibold text-white/50 uppercase tracking-wide text-xs mb-2">Produtos</p>
              {['Consórcio de Imóveis', 'Consórcio de Veículos', 'Consórcio de Negócios', 'Consórcio de Reforma', 'Carta de Investimento'].map((p) => (
                <button key={p} onClick={() => setModalOpen(true)} className="block hover:text-red-400 transition-colors">{p}</button>
              ))}
            </div>
            <div className="text-xs text-white/40 space-y-1.5">
              <p className="font-semibold text-white/50 uppercase tracking-wide text-xs mb-2">Contato</p>
              <p>Simulação e atendimento via WhatsApp</p>
              <p>Resposta em até 2 horas úteis</p>
              <button onClick={() => setModalOpen(true)} className="mt-3 block text-red-500 hover:text-red-400 font-semibold">
                Fazer simulação gratuita →
              </button>
            </div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/20">
            <p>© {new Date().getFullYear()} Indica Consórcio. Todos os direitos reservados.</p>
            <p className="text-center">As simulações são estimativas com base em taxas médias de mercado e não constituem proposta formal de contrato.</p>
          </div>
        </div>
      </footer>

      {/* ── WHATSAPP FIXO ───────────────────────────────────────────── */}
      <a
        href="https://wa.me/5511993929660?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20cons%C3%B3rcio."
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          if (typeof window !== 'undefined' && (window as any).gtag) {
            ;(window as any).gtag('event', 'whatsapp_click', { event_category: 'lead', event_label: 'home' })
          }
        }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#25d366] hover:bg-[#1ebe5d] text-white font-bold px-5 py-3.5 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95"
        aria-label="Tire suas dúvidas pelo WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span className="text-sm">Tire suas dúvidas</span>
      </a>

      {/* ── MODAL SIMULADOR ─────────────────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/85 z-50 backdrop-blur-sm"
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
  )
}
