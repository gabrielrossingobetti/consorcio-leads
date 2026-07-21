'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Calculadora from '@/components/calculator/Calculadora'
import AdemIconLogo from '@/components/AdemIconLogo'
import { ChevronRight, Home, Shield, Users, Star, CheckCircle2, XCircle, Building2, Award } from 'lucide-react'

const FAQ = [
  { pergunta: 'Posso usar o FGTS no consórcio de imóvel?', resposta: 'Sim! Você pode usar o FGTS para dar um lance e antecipar sua contemplação, ou para abater o saldo devedor após ser contemplado. É uma das grandes vantagens do consórcio de imóveis.' },
  { pergunta: 'Quanto tempo leva para ser contemplado?', resposta: 'O tempo médio é de 12 a 36 meses. Você pode antecipar oferecendo um lance — quanto maior o lance percentual, maiores as chances de contemplação mais rápida.' },
  { pergunta: 'Posso comprar qualquer imóvel com a carta de crédito?', resposta: 'Sim. Imóvel residencial, comercial, terreno ou imóvel na planta — a carta de crédito é flexível. Você escolhe o bem que quiser dentro do valor contemplado.' },
  { pergunta: 'O consórcio é regulamentado?', resposta: 'Sim. A Ademicon é regulada e fiscalizada pelo Banco Central do Brasil. Seu dinheiro está 100% protegido e os grupos são auditados mensalmente.' },
  { pergunta: 'Tenho score baixo, posso fazer consórcio?', resposta: 'O consórcio não exige score de crédito para entrar no grupo. A análise de crédito acontece somente no momento da contemplação, dando tempo para você organizar suas finanças.' },
]

const VANTAGENS_CONSORCIO = [
  'Sem juros — apenas taxa administrativa',
  'Sem entrada obrigatória',
  'Usa FGTS como lance',
  'Score não é barreira para entrar',
  'Carta de crédito equivale a dinheiro à vista',
  'Regulado pelo Banco Central',
]

const DESVANTAGENS_FINANCIAMENTO = [
  'Juros de ~12% ao ano (1% ao mês)',
  'Entrada mínima de 20% exigida',
  'Análise de crédito rígida',
  'Score alto obrigatório',
  'Você paga juros sobre juros',
  'Valor total pode triplicar ao final',
]

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function calcFinanciamento(valor: number, meses: number) {
  const entradaPct = 0.20
  const r = 0.01
  const entrada = valor * entradaPct
  const financiado = valor * (1 - entradaPct)
  // Tabela Price
  const parcela = financiado * r / (1 - Math.pow(1 + r, -meses))
  const totalJuros = parcela * meses + entrada
  return { entrada, financiado, parcela, totalJuros }
}

function calcConsorcio(valor: number) {
  const taxa = 0.24
  const meses = 200
  const total = valor * (1 + taxa)
  const parcela = total / meses
  const economia = 0 // calculated against financiamento
  return { total, parcela, taxa, meses, economia }
}

export default function ConsorcioImovelPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [faqAberto, setFaqAberto] = useState<number | null>(null)
  const [valorImovel, setValorImovel] = useState(400000)
  const [mesesFin, setMesesFin] = useState(360)

  const fin = useMemo(() => calcFinanciamento(valorImovel, mesesFin), [valorImovel, mesesFin])
  const con = useMemo(() => calcConsorcio(valorImovel), [valorImovel])
  const economia = fin.totalJuros - con.total

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/"><AdemIconLogo size="md" /></a>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600 font-medium">
            <a href="/#produtos" className="hover:text-red-600 transition-colors">Produtos</a>
            <a href="/#como-funciona" className="hover:text-red-600 transition-colors">Como funciona</a>
            <a href="/#comparativo" className="hover:text-red-600 transition-colors">Por que consórcio?</a>
            <a href="/#faq" className="hover:text-red-600 transition-colors">Dúvidas</a>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-full text-sm transition-all hover:shadow-lg"
          >
            Simular agora
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-[90vh] overflow-hidden bg-gray-900 flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80&auto=format&fit=crop"
          alt="Imóvel dos sonhos"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-24">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 rounded-full px-4 py-1.5 mb-6">
                <Home className="w-4 h-4 text-red-400" />
                <span className="text-red-300 text-sm font-semibold uppercase tracking-widest">Consórcio de Imóvel</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-4">
                Compre seu imóvel<br />
                <span className="text-red-400">sem pagar juros.</span>
              </h1>

              <p className="text-xl text-white/80 leading-relaxed mb-8">
                No financiamento de 30 anos, um imóvel de <strong className="text-white">R$ 400.000</strong> pode custar mais de{' '}
                <strong className="text-red-400">R$ 1.200.000</strong> no total. No consórcio, você paga{' '}
                <strong className="text-white">só R$ 496.000</strong> — sem juros, sem entrada obrigatória.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-full text-lg transition-all hover:shadow-2xl hover:scale-105 active:scale-95"
                >
                  Simular meu imóvel agora
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Simulação gratuita · Sem compromisso</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* NÚMEROS IMPACTANTES */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-400 text-sm uppercase tracking-widest font-semibold mb-10">
            Dados do mercado imobiliário brasileiro
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { numero: 'R$ 700mil+', label: 'economia no consórcio vs financiamento de 30 anos em R$ 400k', bg: 'bg-green-600', text: 'text-white', sub: 'text-green-100' },
              { numero: '24%', label: 'taxa administrativa total — sem juros, sem IOF, sem correção de banco', bg: 'bg-white', text: 'text-gray-900', sub: 'text-gray-500', border: true },
              { numero: 'FGTS', label: 'pode ser usado como lance para antecipar sua contemplação', bg: 'bg-white', text: 'text-gray-900', sub: 'text-gray-500', border: true },
              { numero: '200x', label: 'parcelas — plano de 200 meses com parcelas que cabem no bolso', bg: 'bg-red-600', text: 'text-white', sub: 'text-red-100' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`${item.bg} ${item.border ? 'border border-gray-100 shadow-sm' : ''} rounded-2xl p-8 flex flex-col justify-center min-h-[160px]`}
              >
                <p className={`text-4xl font-black ${item.text} mb-2`}>{item.numero}</p>
                <p className={`text-sm ${item.sub} leading-snug`}>{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARATIVO INTERATIVO */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-gray-900 mb-3">
              Consórcio ou Financiamento?<br />
              <span className="text-red-600">Simule você mesmo e veja o absurdo.</span>
            </h2>
            <p className="text-gray-500 text-lg">Ajuste o valor e os meses — os cálculos atualizam na hora</p>
          </div>

          {/* INPUTS */}
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 mb-8 grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Valor do imóvel</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={100000}
                  max={2000000}
                  step={10000}
                  value={valorImovel}
                  onChange={e => setValorImovel(Number(e.target.value))}
                  className="flex-1 accent-red-600"
                />
                <span className="font-black text-gray-900 text-lg min-w-[120px] text-right">{fmt(valorImovel)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>R$ 100k</span><span>R$ 2M</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Prazo do financiamento
                <span className="text-gray-400 font-normal ml-2">(meses)</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={60}
                  max={420}
                  step={12}
                  value={mesesFin}
                  onChange={e => setMesesFin(Number(e.target.value))}
                  className="flex-1 accent-red-600"
                />
                <input
                  type="number"
                  min={12}
                  max={420}
                  value={mesesFin}
                  onChange={e => setMesesFin(Math.max(12, Math.min(420, Number(e.target.value))))}
                  className="w-20 border border-gray-300 rounded-xl px-3 py-1.5 text-center font-bold text-gray-900 text-sm"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>60 meses</span><span>420 meses (35 anos)</span>
              </div>
            </div>
          </div>

          {/* CARDS COMPARATIVO */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* CONSÓRCIO */}
            <motion.div
              layout
              className="bg-gray-900 rounded-3xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                RECOMENDADO
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-xl font-black text-white">Consórcio</h3>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-gray-400 text-sm">Valor do imóvel</span>
                  <span className="text-white font-bold">{fmt(valorImovel)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-gray-400 text-sm">Taxa administrativa</span>
                  <span className="text-white font-bold">24% total</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-gray-400 text-sm">Entrada obrigatória</span>
                  <span className="text-green-400 font-bold">Não tem ✓</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-gray-400 text-sm">Parcela estimada (200x)</span>
                  <span className="text-white font-bold">{fmt(con.parcela)}/mês</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Total pago</span>
                  <span className="text-green-400 font-black text-xl">{fmt(con.total)}</span>
                </div>
              </div>
              <div className="space-y-2">
                {VANTAGENS_CONSORCIO.map((v, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* FINANCIAMENTO */}
            <motion.div
              layout
              className="bg-gray-50 border border-gray-200 rounded-3xl p-8 relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-xl font-black text-gray-700">Financiamento</h3>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-gray-500 text-sm">Valor do imóvel</span>
                  <span className="text-gray-700 font-bold">{fmt(valorImovel)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-gray-500 text-sm">Juros mensais</span>
                  <span className="text-red-600 font-bold">1% ao mês (~12,7% a.a.)</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-gray-500 text-sm">Entrada (20%)</span>
                  <span className="text-red-600 font-bold">{fmt(fin.entrada)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-gray-500 text-sm">Parcela em {mesesFin}x</span>
                  <span className="text-gray-700 font-bold">{fmt(fin.parcela)}/mês</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Total pago</span>
                  <span className="text-red-600 font-black text-xl">{fmt(fin.totalJuros)}</span>
                </div>
              </div>
              <div className="space-y-2">
                {DESVANTAGENS_FINANCIAMENTO.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="text-gray-500 text-sm">{d}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ECONOMIA */}
          <motion.div
            layout
            className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6 text-center"
          >
            <p className="text-2xl font-black text-green-800">
              Você economiza{' '}
              <span className="text-green-600">{fmt(Math.max(0, economia))}</span>{' '}
              escolhendo o consórcio
            </p>
            <p className="text-green-700 text-sm mt-1">
              Diferença entre o total pago no financiamento ({fmt(fin.totalJuros)}) e no consórcio ({fmt(con.total)})
            </p>
          </motion.div>

          <div className="text-center mt-8">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-full text-lg transition-all hover:shadow-xl"
            >
              Calcular minha economia agora
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* SEÇÃO DARK — CREDIBILIDADE */}
      <section className="bg-red-900 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: Building2, numero: '+292', label: 'lojas no Brasil e no exterior', sub: 'Presença nacional consolidada' },
              { icon: Users, numero: '+641mil', label: 'clientes atendidos', sub: 'Histórias de realizações reais' },
              { icon: Award, numero: '+35 anos', label: 'de experiência', sub: 'Solidez e confiança no mercado' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <item.icon className="w-8 h-8 text-red-300 mx-auto mb-3" />
                <p className="text-5xl font-black text-white mb-1">{item.numero}</p>
                <p className="text-red-200 font-semibold">{item.label}</p>
                <p className="text-red-400 text-sm mt-1">{item.sub}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-white/10 backdrop-blur rounded-3xl p-8 md:p-12 text-center">
            <Shield className="w-10 h-10 text-red-300 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-white mb-3">
              100% regulada pelo Banco Central do Brasil
            </h2>
            <p className="text-red-200 text-lg max-w-2xl mx-auto">
              A Ademicon é fiscalizada e auditada pelo Bacen. Seus recursos estão protegidos, os grupos são transparentes e você tem garantia legal sobre cada parcela paga.
            </p>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-3">Como funciona o consórcio de imóvel?</h2>
            <p className="text-gray-500 text-lg">Do primeiro pagamento à chave na mão</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: '01', cor: 'bg-blue-100 text-blue-600', titulo: 'Você escolhe o plano', desc: 'Defina o valor do imóvel e o prazo que cabe no seu orçamento. Sem entrada, sem burocracia inicial.' },
              { num: '02', cor: 'bg-purple-100 text-purple-600', titulo: 'Paga parcelas sem juros', desc: 'Mensalmente você contribui com o grupo. A parcela é muito menor que a de um financiamento.' },
              { num: '03', cor: 'bg-orange-100 text-orange-600', titulo: 'Participa dos sorteios', desc: 'Todo mês há contemplações por sorteio. Você também pode dar um lance com FGTS para antecipar.' },
              { num: '04', cor: 'bg-green-100 text-green-600', titulo: 'Recebe a carta de crédito', desc: 'Com a carta em mãos, compra o imóvel que quiser à vista — com poder de negociação total.' },
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
                <h3 className="font-bold text-gray-900 text-base mb-2">{item.titulo}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-20 px-6 bg-red-600">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-3">Quem já realizou o sonho da casa própria</h2>
            <p className="text-red-100 text-lg">Histórias reais de contemplados</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { nome: 'Fernanda Lima', cidade: 'Ribeirão Preto, SP', texto: 'Fui contemplada em 14 meses com um lance de FGTS. Hoje tenho meu apartamento próprio sem ter pago uma fortuna em juros.', economia: 'R$ 124.000 economizados' },
              { nome: 'Mariana Costa', cidade: 'São Paulo, SP', texto: 'Vi que economizaria R$ 87.000 comparando com o financiamento. Fechei em uma semana. Melhor decisão da minha vida.', economia: 'R$ 87.000 economizados' },
              { nome: 'Carlos Mendes', cidade: 'Belo Horizonte, MG', texto: 'Estava desanimado com os juros do banco. No consórcio a parcela coube no meu orçamento e fui contemplado por sorteio em 18 meses.', economia: 'R$ 98.000 economizados' },
            ].map((d) => (
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
                  <p className="font-bold text-green-600 text-xs text-right">{d.economia}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-3">Dúvidas sobre consórcio de imóvel</h2>
            <p className="text-gray-500">Respostas diretas para as perguntas mais comuns</p>
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

      {/* CTA FINAL */}
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-2xl mx-auto text-center">
          <Home className="w-12 h-12 text-red-500 mx-auto mb-6" />
          <h2 className="text-4xl font-black text-white mb-4">Seu imóvel, do jeito certo.</h2>
          <p className="text-gray-400 text-lg mb-8">
            Simule agora e veja quanto você economiza comparado ao financiamento. É grátis e leva menos de 2 minutos.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-10 py-5 rounded-full transition-all hover:shadow-2xl text-xl hover:scale-105"
          >
            Simular consórcio de imóvel
            <ChevronRight className="w-6 h-6" />
          </button>
          <p className="text-gray-500 text-sm mt-4">Sem compromisso · Resposta em até 2 horas · 100% gratuito</p>
        </div>
      </section>

      {/* FOOTER */}
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
              <p className="font-semibold text-gray-400 uppercase tracking-wide text-xs mb-2">Outros produtos</p>
              {[
                { label: 'Consórcio de Veículos', href: '/consorcio-veiculo' },
                { label: 'Consórcio de Imóveis', href: '/consorcio-imovel' },
                { label: 'Carta de Investimento', href: '/consorcio-investimento' },
              ].map((p) => (
                <a key={p.label} href={p.href} className="block hover:text-red-500 transition-colors">{p.label}</a>
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

      {/* WHATSAPP */}
      <a
        href="https://wa.me/5511993929660?text=Ol%C3%A1!%20Tenho%20interesse%20em%20cons%C3%B3rcio%20de%20im%C3%B3vel."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#25d366] hover:bg-[#1ebe5d] text-white font-bold px-5 py-3.5 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="text-sm">Tire suas dúvidas</span>
      </a>

      {/* MODAL */}
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
              <div className="bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
                <Calculadora onClose={() => setModalOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
