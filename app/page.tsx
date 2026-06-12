'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Calculadora from '@/components/calculator/Calculadora'
import AdemIconLogo from '@/components/AdemIconLogo'
import {
  Star, Users, Shield, ChevronRight, Award, X,
  Home, Car, Briefcase, Wrench, TrendingUp, Building2
} from 'lucide-react'

const PRODUTOS = [
  {
    id: 'imovel',
    titulo: 'Conquiste seu imóvel',
    subtitulo: 'sem juros,',
    descricao: 'sem burocracia.',
    cta: 'Simular Consórcio de Imóveis',
    img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80&auto=format&fit=crop',
    icon: Home,
  },
  {
    id: 'veiculo',
    titulo: 'Seu carro novo,',
    subtitulo: 'sem juros,',
    descricao: 'sem burocracia.',
    cta: 'Simular Consórcio de Veículos',
    img: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1920&q=80&auto=format&fit=crop',
    icon: Car,
  },
  {
    id: 'negocio',
    titulo: 'Expanda seu negócio,',
    subtitulo: 'sem juros,',
    descricao: 'sem burocracia.',
    cta: 'Simular Consórcio de Negócios',
    img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&q=80&auto=format&fit=crop',
    icon: Briefcase,
  },
  {
    id: 'reforma',
    titulo: 'Transforme seu espaço,',
    subtitulo: 'sem juros,',
    descricao: 'sem burocracia.',
    cta: 'Simular Consórcio de Reforma',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80&auto=format&fit=crop',
    icon: Wrench,
  },
  {
    id: 'investimento',
    titulo: 'Invista com inteligência,',
    subtitulo: 'sem juros,',
    descricao: 'sem burocracia.',
    cta: 'Simular Carta de Investimento',
    img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1920&q=80&auto=format&fit=crop',
    icon: TrendingUp,
  },
]

const CARDS_PRODUTOS = [
  {
    titulo: 'Consórcio de Imóveis',
    subtitulo: 'Elevando sonhos, construindo lares',
    descricao: 'Comece agora a jornada para o lar dos seus sonhos',
    img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&auto=format&fit=crop',
    icon: Home,
  },
  {
    titulo: 'Consórcio de Veículos',
    subtitulo: 'Dirija o futuro, hoje',
    descricao: 'O melhor investimento para o carro da sua vida',
    img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80&auto=format&fit=crop',
    icon: Car,
  },
  {
    titulo: 'Consórcio de Negócios',
    subtitulo: 'Grandes sonhos, muitas possibilidades',
    descricao: 'Invista no futuro do seu negócio',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80&auto=format&fit=crop',
    icon: Building2,
  },
  {
    titulo: 'Consórcio de Reforma',
    subtitulo: 'Transforme seus ambientes',
    descricao: 'Construção ou reforma sem comprometer seu orçamento',
    img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80&auto=format&fit=crop',
    icon: Wrench,
  },
  {
    titulo: 'Carta de Investimento',
    subtitulo: 'Invista com inteligência',
    descricao: 'Use o consórcio como instrumento de investimento',
    img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80&auto=format&fit=crop',
    icon: TrendingUp,
  },
]

const DEPOIMENTOS = [
  { nome: 'Mariana Costa', cidade: 'São Paulo, SP', texto: 'Sempre achei que consórcio era complicado. Fiz a simulação, vi que economizaria R$ 87.000 no financiamento e fechei em uma semana. Melhor decisão da minha vida.', bem: 'Imóvel', economia: 'R$ 87.000' },
  { nome: 'Ricardo Alves', cidade: 'Campinas, SP', texto: 'Tinha financiamento ativo e estava pagando juros absurdos. Migrei para o consórcio e reduzi minha parcela em R$ 800 por mês. Dinheiro que fica no meu bolso.', bem: 'Veículo', economia: 'R$ 800/mês' },
  { nome: 'Fernanda Lima', cidade: 'Ribeirão Preto, SP', texto: 'O especialista me explicou tudo com clareza. Fui contemplada em 14 meses com um lance. Hoje tenho meu apartamento próprio sem ter pago uma fortuna em juros.', bem: 'Imóvel', economia: 'R$ 124.000' },
]

const FAQ = [
  { pergunta: 'Quanto tempo leva para ser contemplado?', resposta: 'O tempo médio de contemplação varia entre 12 e 36 meses para imóveis e 6 a 24 meses para veículos. Você pode antecipar oferecendo um lance — quanto maior o lance, maior a chance de ser contemplado mais rápido.' },
  { pergunta: 'E se eu precisar do bem com urgência?', resposta: 'Se a necessidade for imediata, o consórcio pode não ser a melhor escolha. Mas para quem planeja, é o instrumento mais inteligente: você paga até 50% menos no total.' },
  { pergunta: 'O consórcio é regulamentado pelo governo?', resposta: 'Sim. As administradoras de consórcio são regulamentadas e fiscalizadas pelo Banco Central do Brasil, garantindo total segurança para os consorciados.' },
  { pergunta: 'Posso usar o FGTS no consórcio?', resposta: 'Sim! Para consórcios de imóveis, você pode usar o FGTS tanto para dar um lance quanto para reduzir o saldo devedor após ser contemplado.' },
  { pergunta: 'O que acontece se eu não conseguir pagar uma parcela?', resposta: 'O consorciado inadimplente fica suspenso das assembleias, mas o grupo continua. É possível regularizar a situação e voltar a participar normalmente.' },
]

const TEXTOS_ANIMADOS = [
  'Sem juros nem entrada.',
  'Você escolhe o plano e as parcelas.',
  'Sem burocracias e entraves.',
  'Diversas opções de produtos.',
  'Planos flexíveis e taxa competitiva.',
  'Excelência no atendimento ao cliente.',
  'Tradicional, segura e digital.',
]

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [produtoAtivo, setProdutoAtivo] = useState(0)
  const [textoAtivo, setTextoAtivo] = useState(0)
  const [faqAberto, setFaqAberto] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'consorcio' | 'financiamento'>('consorcio')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setProdutoAtivo((prev) => (prev + 1) % PRODUTOS.length)
    }, 5000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTextoAtivo((p) => (p + 1) % TEXTOS_ANIMADOS.length), 2500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modalOpen])

  function handleProduto(i: number) {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setProdutoAtivo(i)
    intervalRef.current = setInterval(() => setProdutoAtivo((prev) => (prev + 1) % PRODUTOS.length), 5000)
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ─────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <AdemIconLogo size="md" />
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600 font-medium">
            <a href="#produtos" className="hover:text-red-600 transition-colors">Produtos</a>
            <a href="#como-funciona" className="hover:text-red-600 transition-colors">Como funciona</a>
            <a href="#comparativo" className="hover:text-red-600 transition-colors">Por que consórcio?</a>
            <a href="#faq" className="hover:text-red-600 transition-colors">Dúvidas</a>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-full text-sm transition-all hover:shadow-lg"
          >
            Simular agora
          </button>
        </div>
      </nav>

      {/* ── HERO SLIDER ─────────────────────────────────────────────── */}
      <section className="relative h-[90vh] min-h-[600px] overflow-hidden bg-gray-900">
        {PRODUTOS.map((p, i) => (
          <AnimatePresence key={p.id}>
            {i === produtoAtivo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.img} alt={p.titulo} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>
        ))}

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={produtoAtivo}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl"
              >
                <p className="text-red-400 font-semibold text-sm uppercase tracking-widest mb-4">
                  Indica Consórcio
                </p>
                <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-2">
                  {PRODUTOS[produtoAtivo].titulo}
                </h1>
                <h1 className="text-5xl md:text-6xl font-black leading-tight mb-2">
                  <span className="text-red-400">{PRODUTOS[produtoAtivo].subtitulo}</span>
                </h1>
                <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-8">
                  {PRODUTOS[produtoAtivo].descricao}
                </h1>
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-full text-lg transition-all hover:shadow-2xl hover:scale-105 active:scale-95"
                >
                  {PRODUTOS[produtoAtivo].cta}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {PRODUTOS.map((_, i) => (
            <button
              key={i}
              onClick={() => handleProduto(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === produtoAtivo ? 'w-8 bg-red-500' : 'w-2 bg-white/50 hover:bg-white/80'}`}
            />
          ))}
        </div>
      </section>

      {/* ── STATS CARDS ─────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-400 text-sm uppercase tracking-widest font-semibold mb-10">Nossa administradora parceira tem décadas de experiência e solidez no mercado</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="col-span-2 md:col-span-1 lg:col-span-2 bg-white rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100 min-h-[160px]"
            >
              <Building2 className="w-8 h-8 text-red-500 mb-3" />
              <p className="text-4xl font-black text-gray-900">+292</p>
              <p className="text-gray-500 text-sm mt-1">lojas no Brasil e no exterior</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}
              className="col-span-2 md:col-span-1 lg:col-span-2 bg-white rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100 min-h-[160px]"
            >
              <TrendingUp className="w-8 h-8 text-red-500 mb-3" />
              <p className="text-4xl font-black text-gray-900">R$140bi</p>
              <p className="text-gray-500 text-sm mt-1">em créditos comercializados</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="col-span-2 md:col-span-1 lg:col-span-2 bg-red-600 rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[160px]"
            >
              <Users className="w-8 h-8 text-red-200 mb-3" />
              <p className="text-4xl font-black text-white">+641mil</p>
              <p className="text-red-200 text-sm mt-1">clientes atendidos</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
              className="col-span-2 md:col-span-1 lg:col-span-2 bg-white rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100 min-h-[160px]"
            >
              <Award className="w-8 h-8 text-red-500 mb-3" />
              <p className="text-4xl font-black text-gray-900">+906mil</p>
              <p className="text-gray-500 text-sm mt-1">cotas comercializadas</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="col-span-2 md:col-span-1 lg:col-span-2 bg-white rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100 min-h-[160px]"
            >
              <Shield className="w-8 h-8 text-red-500 mb-3" />
              <p className="text-4xl font-black text-gray-900">+35 anos</p>
              <p className="text-gray-500 text-sm mt-1">de experiência no mercado</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }}
              className="col-span-2 md:col-span-1 lg:col-span-2 bg-gray-900 rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[160px]"
            >
              <Star className="w-8 h-8 text-yellow-400 mb-3" />
              <p className="text-lg font-black text-white leading-tight">Regulada pelo<br/>Banco Central</p>
              <p className="text-gray-400 text-sm mt-1">100% segura e confiável</p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── PRODUTOS ────────────────────────────────────────────────── */}
      <section id="produtos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-3">
              A melhor escolha para <br />administração do seu consórcio
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Diversas opções de consórcios para todos os seus objetivos
            </p>
          </div>

          <div className="space-y-6">
            {CARDS_PRODUTOS.map((card, i) => (
              <motion.div
                key={card.titulo}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative rounded-3xl overflow-hidden h-80 group cursor-pointer"
                onClick={() => setModalOpen(true)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.img}
                  alt={card.titulo}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-red-300 text-sm font-semibold uppercase tracking-wide mb-1">{card.titulo}</p>
                      <h3 className="text-3xl font-black mb-1">{card.subtitulo}</h3>
                      <p className="text-white/70 text-sm">{card.descricao}</p>
                    </div>
                    <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-full text-sm transition-all whitespace-nowrap">
                      Simular
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEÇÃO ESCURA ────────────────────────────────────────────── */}
      <section className="bg-red-900 py-24 px-6 overflow-hidden relative">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black text-white mb-4">
                (Re)Descubra o<br />
                <span className="text-red-300">Consórcio</span>
              </h2>
              <p className="text-red-200 text-lg leading-relaxed">
                Consórcio continua uma das opções mais seguras e vantajosas para compra de bens e serviços.
                Uma modalidade sólida, confiável e transparente — regulada pelo Banco Central do Brasil.
              </p>
            </div>
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.p
                  key={textoAtivo}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="text-5xl font-black text-white leading-tight"
                >
                  {TEXTOS_ANIMADOS[textoAtivo]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARATIVO ─────────────────────────────────────────────── */}
      <section id="comparativo" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-3">
              Por que escolher consórcio e não financiamento?
            </h2>
            <p className="text-gray-500 text-lg">Veja como as opções se comparam</p>
          </div>

          <div className="flex justify-center gap-3 mb-10">
            {(['consorcio', 'financiamento'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${activeTab === tab ? 'bg-red-600 text-white' : 'border border-gray-300 text-gray-600 hover:border-red-400'}`}
              >
                {tab === 'consorcio' ? 'Consórcio' : 'Financiamento'}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { titulo: 'Juros', consorcio: 'Sem juros. Você paga só a taxa administrativa.', financiamento: 'Juros altos de 12% a 18% ao ano no total.', img: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=600&q=80&auto=format&fit=crop' },
              { titulo: 'Taxas', consorcio: 'Taxa de administração baixa e transparente.', financiamento: 'IOF, seguro, tarifas e custos escondidos.', img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80&auto=format&fit=crop' },
              { titulo: 'Garantia e confiança', consorcio: 'Regulado pelo Banco Central. 100% seguro.', financiamento: 'Banco pode rever condições a qualquer momento.', img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80&auto=format&fit=crop' },
              { titulo: 'Aprovação de crédito', consorcio: 'Sem análise de crédito rígida. Mais acessível.', financiamento: 'Score alto exigido. Muitas reprovações.', img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80&auto=format&fit=crop' },
            ].map((item) => (
              <motion.div
                key={item.titulo}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                viewport={{ once: true }}
                className="relative rounded-2xl overflow-hidden h-72 group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.img} alt={item.titulo} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className={`absolute inset-0 flex flex-col justify-end p-5 transition-all duration-300 ${activeTab === 'consorcio' ? 'bg-gradient-to-t from-green-950/95 via-green-900/70 to-transparent' : 'bg-gradient-to-t from-red-950/95 via-red-900/70 to-transparent'}`}>
                  <p className="text-white/60 text-xs uppercase tracking-widest mb-2 font-semibold">{item.titulo}</p>
                  <p className="text-white font-bold text-sm leading-snug">
                    {activeTab === 'consorcio' ? item.consorcio : item.financiamento}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-full text-lg transition-all hover:shadow-xl"
            >
              Simular minha economia
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ───────────────────────────────────────────── */}
      <section id="como-funciona" className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-3">Como funciona o consórcio?</h2>
            <p className="text-gray-500 text-lg">Simples, transparente e sem juros</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { num: '01', cor: 'bg-blue-100 text-blue-600', titulo: 'Você paga uma parcela mensal', desc: 'Sem juros, apenas uma taxa administrativa. Sua parcela é muito menor do que a de um financiamento.' },
              { num: '02', cor: 'bg-purple-100 text-purple-600', titulo: 'Participa de um grupo', desc: 'Todos os meses, um ou mais consorciados são contemplados por sorteio ou lance e recebem a carta de crédito.' },
              { num: '03', cor: 'bg-red-100 text-red-600', titulo: 'Recebe sua carta de crédito', desc: 'Ao ser contemplado, você usa o crédito para comprar seu bem à vista — o que garante poder de negociação.' },
            ].map((item) => (
              <motion.div
                key={item.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`w-16 h-16 ${item.cor} rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black`}>
                  {item.num}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.titulo}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-red-600">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-3">Histórias de quem sonhou e realizou</h2>
            <p className="text-red-100 text-lg">Histórias reais de quem realizou o sonho</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {DEPOIMENTOS.map((d) => (
              <motion.div
                key={d.nome}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6"
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">&quot;{d.texto}&quot;</p>
                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{d.nome}</p>
                    <p className="text-gray-400 text-xs">{d.cidade}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{d.bem}</p>
                    <p className="font-bold text-green-600 text-sm">Economizou {d.economia}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-3">Perguntas frequentes</h2>
            <p className="text-gray-500">Tire suas dúvidas antes de simular</p>
          </div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setFaqAberto(faqAberto === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  {item.pergunta}
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-3 ${faqAberto === i ? 'rotate-90' : ''}`} />
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
                      <p className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
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
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4">Pronto para parar de pagar juros?</h2>
          <p className="text-gray-400 text-lg mb-8">Faça sua simulação gratuita agora e descubra quanto você pode economizar.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-10 py-5 rounded-full transition-all hover:shadow-2xl text-xl hover:scale-105"
          >
            Simular gratuitamente
            <ChevronRight className="w-6 h-6" />
          </button>
          <p className="text-gray-500 text-sm mt-4">Sem compromisso • Resposta em até 2 horas • 100% gratuito</p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="bg-gray-950 py-12 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <AdemIconLogo size="sm" />
              <p className="text-gray-500 text-xs mt-3 max-w-xs leading-relaxed">
                Indicação de consórcio com as melhores condições do mercado. Atendimento personalizado e sem burocracia.
              </p>
            </div>
            <div className="text-xs text-gray-500 space-y-1.5">
              <p className="font-semibold text-gray-400 uppercase tracking-wide text-xs mb-2">Informações legais</p>
              <p>Serviço de indicação de consórcio</p>
              <p>Regulado pelo Banco Central do Brasil</p>
            </div>
            <div className="text-xs text-gray-500 space-y-1.5">
              <p className="font-semibold text-gray-400 uppercase tracking-wide text-xs mb-2">Produtos</p>
              {['Consórcio de Imóveis', 'Consórcio de Veículos', 'Consórcio de Negócios', 'Consórcio de Reforma', 'Carta de Investimento'].map((p) => (
                <button key={p} onClick={() => setModalOpen(true)} className="block hover:text-red-500 transition-colors">{p}</button>
              ))}
            </div>
            <div className="text-xs text-gray-500 space-y-1.5">
              <p className="font-semibold text-gray-400 uppercase tracking-wide text-xs mb-2">Contato</p>
              <p>Simulação e atendimento via WhatsApp</p>
              <p>Resposta em até 2 horas úteis</p>
              <button onClick={() => setModalOpen(true)} className="mt-3 block text-red-500 hover:text-red-400 font-semibold">
                Fazer simulação gratuita →
              </button>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <p>© {new Date().getFullYear()} Indica Consórcio. Todos os direitos reservados.</p>
            <p className="text-center">As simulações são estimativas com base em taxas médias de mercado e não constituem proposta formal de contrato.</p>
          </div>
        </div>
      </footer>

      {/* ── MODAL SIMULADOR ─────────────────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4"
            >
              <div className="bg-white rounded-3xl shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
                {/* Barra do X — fora do scroll */}
                <div className="flex justify-end px-4 pt-4 flex-shrink-0">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Conteúdo scrollável */}
                <div className="overflow-y-auto px-8 pb-8 pt-2">
                  <Calculadora />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
