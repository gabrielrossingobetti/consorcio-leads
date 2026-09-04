'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
import Calculadora from '@/components/calculator/Calculadora'
import PalcoSonho from '@/components/landing/PalcoSonho'
import { calcular, formatCurrency, type BemType } from '@/lib/calculos'
import { faixaPara } from '@/lib/sonhos'
import { credenciais } from '@/lib/marca'
import { trackEvent } from '@/lib/gtag'
import { Home, Car, Building2, ArrowRight, ArrowDown, Check, ChevronDown, ShieldCheck } from 'lucide-react'

/* ══════════════════════════════════════════════════════════════
   DADOS
   ══════════════════════════════════════════════════════════════ */

const PRODUTOS = [
  {
    id: 'imovel' as BemType,
    label: 'Imóvel',
    verbo: 'morar',
    frase: 'O endereço que você quer chamar de seu.',
    Icon: Home,
    presets: [200_000, 400_000, 800_000],
    min: 80_000,
    max: 1_500_000,
    passo: 10_000,
    inicial: 400_000,
  },
  {
    id: 'carro' as BemType,
    label: 'Automóvel',
    verbo: 'dirigir',
    frase: 'A chave na sua mão, sem dever nada ao banco.',
    Icon: Car,
    presets: [60_000, 100_000, 180_000],
    min: 30_000,
    max: 400_000,
    passo: 5_000,
    inicial: 100_000,
  },
  {
    id: 'negocio' as BemType,
    label: 'Negócio',
    verbo: 'construir',
    frase: 'A estrutura que faz o seu negócio crescer.',
    Icon: Building2,
    presets: [100_000, 250_000, 500_000],
    min: 50_000,
    max: 1_000_000,
    passo: 10_000,
    inicial: 250_000,
  },
]

const ETAPAS = [
  {
    n: '01',
    titulo: 'Você contrata uma carta de crédito',
    desc: 'Pelo valor exato do que quer comprar. Sem entrada obrigatória e sem aprovação bancária.',
  },
  {
    n: '02',
    titulo: 'Paga parcelas mensais sem juros',
    desc: 'Só a taxa administrativa, já embutida na parcela. Sem IOF, sem seguro obrigatório, sem tarifa escondida.',
  },
  {
    n: '03',
    titulo: 'Contemplado, compra à vista',
    desc: 'Por sorteio mensal ou por lance. Com a carta na mão você negocia como comprador à vista — e consegue desconto.',
  },
]

const DEPOIMENTOS = [
  {
    nome: 'Fernanda L.',
    cidade: 'Ribeirão Preto, SP',
    bem: 'Apartamento de R$ 280 mil',
    tempo: 'contemplada em 14 meses',
    economia: 124_000,
    texto: 'Dei um lance no oitavo mês e fui contemplada no décimo quarto. Comprei à vista e ainda negociei desconto com a construtora.',
  },
  {
    nome: 'Ricardo A.',
    cidade: 'Campinas, SP',
    bem: 'Caminhonete de R$ 190 mil',
    tempo: 'contemplado em 9 meses',
    economia: 71_000,
    texto: 'Eu tinha financiamento e pagava juros absurdos. Migrei pro consórcio e a parcela caiu quase pela metade.',
  },
  {
    nome: 'Mariana C.',
    cidade: 'São Paulo, SP',
    bem: 'Casa de R$ 450 mil',
    tempo: 'contemplada em 22 meses',
    economia: 198_000,
    texto: 'Fiz a simulação, vi quanto economizaria e fechei na mesma semana. Foi a melhor decisão financeira que já tomei.',
  },
]

const FAQ = [
  {
    q: 'Posso ser contemplado logo no início?',
    a: 'Sim. Se você tem capital disponível para dar um lance, é totalmente possível ser contemplado já nos primeiros meses — inclusive no primeiro. O consultor monta a estratégia de lance de acordo com o seu caso. E mesmo sem capital para lance, você já concorre aos sorteios mensais desde a primeira parcela.',
  },
  {
    q: 'E se eu quiser sair depois de entrar?',
    a: 'Você pode desistir a qualquer momento. O valor pago é devolvido conforme as regras do contrato e do grupo — normalmente após o encerramento do grupo ou por sorteio de desistentes. Explicamos exatamente como funciona na reunião, sem letra miúda.',
  },
  {
    q: 'É seguro? Tem regulação oficial?',
    a: 'Sim. Todas as administradoras de consórcio são autorizadas, reguladas e fiscalizadas pelo Banco Central do Brasil. O dinheiro do grupo fica em conta separada e é auditado — o mesmo nível de fiscalização de um banco.',
  },
  {
    q: 'Posso usar o FGTS?',
    a: 'Sim, para consórcio de imóvel. O FGTS pode ser usado tanto para dar lance e antecipar sua contemplação quanto para abater o saldo devedor depois de contemplado.',
  },
]

/* ══════════════════════════════════════════════════════════════
   PRIMITIVAS
   ══════════════════════════════════════════════════════════════ */

function Reveal({
  children,
  delay = 0,
  y = 26,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function CountUp({ to, duration = 1400, className = '' }: { to: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const emTela = useInView(ref, { once: true, margin: '-40px' })
  const [valor, setValor] = useState(0)

  useEffect(() => {
    if (!emTela) return
    let raf = 0
    const inicio = performance.now()
    const tick = (agora: number) => {
      const t = Math.min((agora - inicio) / duration, 1)
      setValor(Math.round((1 - Math.pow(1 - t, 3)) * to))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [emTela, to, duration])

  return (
    <span ref={ref} className={className}>
      {formatCurrency(valor)}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════
   PÁGINA
   ══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [produtoIdx, setProdutoIdx] = useState(0)
  const [valorSim, setValorSim] = useState(400_000)
  const [modalAberto, setModalAberto] = useState(false)
  const [faqAberta, setFaqAberta] = useState<number | null>(0)

  const produto = PRODUTOS[produtoIdx]
  const resultado = useMemo(() => calcular(produto.id, valorSim), [produto.id, valorSim])
  const faixa = useMemo(() => faixaPara(produto.id, valorSim), [produto.id, valorSim])

  // A cena responde ao mouse — camadas em profundidades diferentes dão sensação de espaço
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const suaveX = useSpring(mouseX, { stiffness: 60, damping: 22 })
  const suaveY = useSpring(mouseY, { stiffness: 60, damping: 22 })
  const fundoX = useTransform(suaveX, [-0.5, 0.5], [22, -22])
  const fundoY = useTransform(suaveY, [-0.5, 0.5], [16, -16])
  const frenteX = useTransform(suaveX, [-0.5, 0.5], [-9, 9])
  const frenteY = useTransform(suaveY, [-0.5, 0.5], [-6, 6])

  function moverCena(e: React.MouseEvent<HTMLElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - r.left) / r.width - 0.5)
    mouseY.set((e.clientY - r.top) / r.height - 0.5)
  }

  function selecionarProduto(idx: number) {
    setProdutoIdx(idx)
    setValorSim(PRODUTOS[idx].inicial)
    trackEvent('simulador_produto_trocado', { produto: PRODUTOS[idx].id })
  }

  function abrirAgendamento(origem: string) {
    trackEvent('agendamento_aberto', {
      origem,
      produto: produto.id,
      valor: valorSim,
      economia: resultado.economiaTotal,
    })
    setModalAberto(true)
  }

  function irParaSimulador() {
    trackEvent('cta_hero_clicado', { produto: produto.id })
    document.getElementById('simulador')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    document.body.style.overflow = modalAberto ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [modalAberto])

  // Quem chega de /direcionamento com ?agendar=1 já cai no agendamento,
  // com o produto e o valor que ele simulou antes — sem repetir nada.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    if (p.get('agendar') !== '1') return

    const idx = PRODUTOS.findIndex((x) => x.id === p.get('produto'))
    if (idx >= 0) setProdutoIdx(idx)

    const credito = Number(p.get('credito'))
    if (credito > 0) setValorSim(credito)

    setModalAberto(true)
    trackEvent('agendamento_aberto', { origem: 'retorno-direcionamento' })
  }, [])

  const palavrasTitulo = ['Compre', 'o', 'que', 'você', 'quer.']

  return (
    <div className="min-h-screen bg-[var(--c-abyssal)]">
      {/* ══ NAV ══════════════════════════════════════════════ */}
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-white/8 bg-[#070C18]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <span className="font-display text-[15px] font-extrabold tracking-tight text-white">
            Consórcio<span className="text-[var(--c-electric)]"> Lidera</span>
          </span>
          <button onClick={irParaSimulador} className="cta-primary rounded-full px-5 py-2.5 text-[13px] font-semibold">
            Simular agora
          </button>
        </div>
      </nav>

      {/* ══ 1. HERO — o sonho em movimento ═══════════════════ */}
      <section
        onMouseMove={moverCena}
        onMouseLeave={() => {
          mouseX.set(0)
          mouseY.set(0)
        }}
        className="relative flex min-h-[92vh] items-end overflow-hidden pt-20"
      >
        <PalcoSonho
          tour={faixa.tour}
          chave={`hero-${produto.id}-${faixa.etiqueta}`}
          parallaxX={fundoX}
          parallaxY={fundoY}
        />

        {/* Profundidade — o texto precisa ganhar da cena sempre */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(100deg, rgba(7,12,24,0.97) 0%, rgba(7,12,24,0.86) 42%, rgba(7,12,24,0.30) 100%)',
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #070C18 1%, transparent 42%)' }} />
        <div className="grade-tec pointer-events-none absolute inset-0 opacity-40" />

        <motion.div
          style={{ x: frenteX, y: frenteY }}
          className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 md:px-8 md:pb-24"
        >
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eyebrow mb-6 flex items-center gap-2 text-[var(--c-gold-lt)]"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Regulado pelo Banco Central
          </motion.p>

          {/* Entrada palavra por palavra — cinematográfica, não decorativa */}
          <h1 className="font-display max-w-3xl text-[2.7rem] font-extrabold leading-[0.97] text-white sm:text-5xl md:text-[4.4rem]">
            <span className="flex flex-wrap gap-x-[0.28em]">
              {palavrasTitulo.map((palavra, i) => (
                <motion.span
                  key={palavra + i}
                  initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.7, delay: 0.1 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                >
                  {palavra}
                </motion.span>
              ))}
            </span>
            <motion.span
              initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.52, ease: [0.22, 1, 0.36, 1] }}
              className="mt-1 block text-[var(--c-gold-lt)]"
            >
              Sem dar um centavo de juros.
            </motion.span>
          </h1>

          {/* A frase muda com o produto — o contexto inteiro reage à escolha */}
          <div className="mt-6 min-h-[3.4rem] max-w-lg">
            <AnimatePresence mode="wait">
              <motion.p
                key={produto.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="text-[15px] leading-relaxed text-white/75 md:text-[17px]"
              >
                {produto.frase} Parcelas mensais sem juros e carta de crédito para comprar à vista.
              </motion.p>
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.68 }}
            className="mt-9"
          >
            <button
              onClick={irParaSimulador}
              className="cta-primary group inline-flex items-center gap-3 rounded-full px-8 py-4 text-[15px] font-bold md:text-base"
            >
              Ver quanto eu economizo
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </button>
            <p className="mt-4 text-[12.5px] text-white/45">
              Simulação gratuita · Leva 30 segundos · Sem cadastro para ver o resultado
            </p>
          </motion.div>

          {/* Trocar de produto transforma a cena inteira */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-12"
          >
            <p className="eyebrow mb-3 text-white/35">O que você quer {produto.verbo}</p>
            <div className="flex flex-wrap gap-2.5">
              {PRODUTOS.map((p, i) => {
                const ativo = produtoIdx === i
                const Icone = p.Icon
                return (
                  <button
                    key={p.id}
                    onClick={() => selecionarProduto(i)}
                    aria-pressed={ativo}
                    className={`relative flex items-center gap-2 overflow-hidden rounded-full border px-5 py-2.5 text-[13px] font-semibold transition-all duration-300 ${
                      ativo
                        ? 'varredura border-[var(--c-electric)] bg-[var(--c-electric)]/18 text-white'
                        : 'border-white/15 bg-white/5 text-white/60 hover:border-white/35 hover:text-white'
                    }`}
                  >
                    <Icone className="h-4 w-4" />
                    {p.label}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ══ 2. ÂNCORA — a tensão, ainda no escuro ════════════ */}
      <section className="relative overflow-hidden border-t border-white/8 bg-[var(--c-abyssal)] px-5 py-20 md:px-8 md:py-28">
        <div className="grade-tec pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-5xl">
          <Reveal>
            <p className="eyebrow mb-4 text-[var(--c-electric)]">A conta que o banco não mostra</p>
            <h2 className="font-display max-w-2xl text-[1.9rem] font-extrabold leading-[1.1] text-white md:text-[2.7rem]">
              A cada R$ 100 mil, essa é a diferença
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/60 md:text-base">
              Mesmo pagando a parcela cheia do consórcio, sem nenhuma redução, a diferença mensal é
              quase o dobro.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <Reveal delay={0.05}>
              <div className="h-full rounded-lg border border-[var(--c-red)]/25 bg-white/[0.03] p-7 md:p-8">
                <p className="eyebrow mb-6 text-[var(--c-red)]">Financiamento bancário</p>
                <div className="flex flex-col gap-5">
                  <div>
                    <p className="text-[12.5px] text-white/40">Imóvel · 360 meses</p>
                    <p className="num-hero mt-1 text-[2.4rem] leading-none text-[var(--c-red)] md:text-[2.9rem]">
                      R$ 1.100<span className="text-base font-normal text-white/35">/mês</span>
                    </p>
                  </div>
                  <div className="h-px bg-white/8" />
                  <div>
                    <p className="text-[12.5px] text-white/40">Automóvel · 60 meses</p>
                    <p className="num-hero mt-1 text-[2.4rem] leading-none text-[var(--c-red)] md:text-[2.9rem]">
                      R$ 2.877<span className="text-base font-normal text-white/35">/mês</span>
                    </p>
                  </div>
                </div>
                <p className="mt-7 text-[13px] leading-relaxed text-white/35">
                  Juros de 1,1% a.m. no imóvel e 2% a.m. no veículo, mais entrada, seguros
                  obrigatórios e taxa de administração.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="relative h-full overflow-hidden rounded-lg border border-[var(--c-gold)]/40 bg-white/[0.03] p-7 md:p-8">
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(200,147,42,0.16), transparent 70%)' }}
                />
                <p className="eyebrow relative mb-6 text-[var(--c-gold-lt)]">Consórcio · parcela cheia</p>
                <div className="relative flex flex-col gap-5">
                  <div>
                    <p className="text-[12.5px] text-white/40">Imóvel · 225 meses</p>
                    <p className="num-hero mt-1 text-[2.4rem] leading-none text-[var(--c-gold-lt)] md:text-[2.9rem]">
                      R$ 560<span className="text-base font-normal text-white/35">/mês</span>
                    </p>
                  </div>
                  <div className="h-px bg-white/8" />
                  <div>
                    <p className="text-[12.5px] text-white/40">Automóvel · 90 meses</p>
                    <p className="num-hero mt-1 text-[2.4rem] leading-none text-[var(--c-gold-lt)] md:text-[2.9rem]">
                      R$ 1.290<span className="text-base font-normal text-white/35">/mês</span>
                    </p>
                  </div>
                </div>
                <p className="mt-7 text-[13px] leading-relaxed text-white/35">
                  Zero juros. Sem entrada obrigatória, sem IOF, sem seguro obrigatório. Só a taxa
                  administrativa, já embutida.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.18}>
            <div className="mt-10 flex flex-col items-center gap-3 text-center">
              <p className="text-[13px] text-white/40">Agora veja no valor que é o seu</p>
              <motion.button
                onClick={irParaSimulador}
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-[var(--c-electric)] hover:text-[var(--c-electric)]"
                aria-label="Ir para o simulador"
              >
                <ArrowDown className="h-5 w-5" />
              </motion.button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ 3. SIMULADOR — a luz acende para a decisão ═══════ */}
      <section id="simulador" className="zona-clara scroll-mt-16 px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <p className="eyebrow mb-4 text-[var(--c-gold)]">Simulação gratuita</p>
            <h2 className="font-display max-w-2xl text-[2rem] font-extrabold leading-[1.1] text-[var(--c-ink)] md:text-[2.9rem]">
              Quanto você economiza no seu caso
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--c-ink-mid)] md:text-base">
              Escolha o que quer comprar e o valor. O resultado aparece na hora, sem preencher nada.
            </p>
          </Reveal>

          {/* Passo 1 */}
          <Reveal delay={0.05}>
            <div className="mt-11">
              <p className="eyebrow mb-4 text-[var(--c-ink-faint)]">Passo 1 · O que você quer comprar</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {PRODUTOS.map((p, i) => {
                  const ativo = produtoIdx === i
                  const Icone = p.Icon
                  return (
                    <button
                      key={p.id}
                      onClick={() => selecionarProduto(i)}
                      aria-pressed={ativo}
                      className={`relative overflow-hidden rounded-xl border-2 p-5 text-left transition-all duration-300 ${
                        ativo
                          ? 'border-[var(--c-electric)] bg-[var(--c-electric)]/6 shadow-[0_6px_24px_rgba(29,99,216,0.14)]'
                          : 'border-[var(--c-rule)] bg-white hover:border-[var(--c-ink-faint)]'
                      }`}
                    >
                      <Icone
                        className={`mb-3 h-6 w-6 ${ativo ? 'text-[var(--c-electric)]' : 'text-[var(--c-ink-faint)]'}`}
                      />
                      <p className="font-display text-[16px] font-bold text-[var(--c-ink)]">{p.label}</p>
                      <p className="mt-0.5 text-[12.5px] text-[var(--c-ink-faint)]">Para {p.verbo}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </Reveal>

          {/* Passo 2 — o valor com o sonho ao lado */}
          <Reveal delay={0.08}>
            <div className="mt-9 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
              {/* Controle */}
              <div className="rounded-xl border-2 border-[var(--c-rule)] bg-white p-7 md:p-8">
                <p className="eyebrow mb-6 text-[var(--c-ink-faint)]">Passo 2 · Valor do bem</p>

                <p className="text-[13px] text-[var(--c-ink-mid)]">Você quer uma carta de crédito de</p>
                <p className="num-hero mt-2 text-[2.8rem] leading-none text-[var(--c-ink)] md:text-[3.4rem]">
                  {formatCurrency(valorSim)}
                </p>

                <input
                  type="range"
                  className="slider-gold mt-7 w-full"
                  min={produto.min}
                  max={produto.max}
                  step={produto.passo}
                  value={valorSim}
                  onChange={(e) => setValorSim(Number(e.target.value))}
                  aria-label={`Valor do ${produto.label.toLowerCase()}`}
                />
                <div className="mt-2 flex justify-between text-[11.5px] text-[var(--c-ink-faint)]">
                  <span>{formatCurrency(produto.min)}</span>
                  <span>{formatCurrency(produto.max)}</span>
                </div>

                <p className="mt-6 text-[12.5px] text-[var(--c-ink-faint)]">Ou escolha um valor comum</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {produto.presets.map((v) => (
                    <button
                      key={v}
                      onClick={() => setValorSim(v)}
                      className={`rounded-full border-2 px-4 py-2 text-[13px] font-semibold transition-colors ${
                        valorSim === v
                          ? 'border-[var(--c-electric)] bg-[var(--c-electric)]/8 text-[var(--c-electric)]'
                          : 'border-[var(--c-rule)] text-[var(--c-ink-mid)] hover:border-[var(--c-ink-faint)]'
                      }`}
                    >
                      {formatCurrency(v)}
                    </button>
                  ))}
                </div>
              </div>

              {/* O que esse valor compra — o sonho responde ao slider */}
              <div className="relative min-h-[280px] overflow-hidden rounded-xl border-2 border-[var(--c-rule)] lg:min-h-0">
                <PalcoSonho
                  tour={faixa.tour}
                  chave={`sim-${produto.id}-${faixa.etiqueta}`}
                  intervalo={4200}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(7,12,24,0.88) 12%, transparent 62%)' }}
                />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="eyebrow mb-1.5 text-white/55">O que esse valor compra</p>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={faixa.etiqueta}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="font-display text-[22px] font-extrabold leading-tight text-white md:text-[26px]"
                    >
                      {faixa.etiqueta}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Resultado */}
          <Reveal delay={0.1}>
            <div className="mt-6 overflow-hidden rounded-xl border-2 border-[var(--c-rule)] bg-white">
              <div className="grid md:grid-cols-2">
                <div className="border-b-2 border-[var(--c-rule)] p-7 md:border-b-0 md:border-r-2 md:p-9">
                  <p className="eyebrow mb-5 text-[var(--c-red)]">No financiamento</p>
                  <p className="text-[12.5px] text-[var(--c-ink-faint)]">Parcela mensal</p>
                  <p className="num-hero mt-1 text-[2.5rem] leading-none text-[var(--c-red)] md:text-[3rem]">
                    {formatCurrency(resultado.parcelaFinanciamento)}
                  </p>
                  <div className="mt-6 flex flex-col gap-2.5 text-[13.5px]">
                    <div className="flex justify-between">
                      <span className="text-[var(--c-ink-faint)]">Prazo</span>
                      <span className="font-numeric text-[var(--c-ink-mid)]">{resultado.prazoFinanciamentoMeses} meses</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--c-ink-faint)]">Total pago</span>
                      <span className="font-numeric text-[var(--c-ink-mid)]">{formatCurrency(resultado.totalFinanciamento)}</span>
                    </div>
                    <div className="flex justify-between border-t border-[var(--c-rule)] pt-2.5">
                      <span className="text-[var(--c-ink-faint)]">Só de juros</span>
                      <span className="font-numeric font-bold text-[var(--c-red)]">{formatCurrency(resultado.jurosFinanciamento)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-7 md:p-9">
                  <p className="eyebrow mb-5 text-[var(--c-gold)]">No consórcio</p>
                  <p className="text-[12.5px] text-[var(--c-ink-faint)]">Parcela mensal</p>
                  <p className="num-hero mt-1 text-[2.5rem] leading-none text-[var(--c-gold-lt)] md:text-[3rem]">
                    {formatCurrency(resultado.parcelaConsorcio)}
                  </p>
                  <div className="mt-6 flex flex-col gap-2.5 text-[13.5px]">
                    <div className="flex justify-between">
                      <span className="text-[var(--c-ink-faint)]">Prazo</span>
                      <span className="font-numeric text-[var(--c-ink-mid)]">{resultado.prazoConsorcioMeses} meses</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--c-ink-faint)]">Total pago</span>
                      <span className="font-numeric text-[var(--c-ink-mid)]">{formatCurrency(resultado.totalConsorcio)}</span>
                    </div>
                    <div className="flex justify-between border-t border-[var(--c-rule)] pt-2.5">
                      <span className="text-[var(--c-ink-faint)]">Só de juros</span>
                      <span className="font-numeric font-bold text-[var(--c-green)]">R$ 0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Economia mensal — brasileiro decide por parcela */}
              <div className="border-t-2 border-[var(--c-rule)] bg-[var(--c-lift)] p-7 md:p-9">
                <p className="eyebrow mb-2.5 text-[var(--c-ink-faint)]">Sobra no seu bolso todo mês</p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={resultado.economiaMensal}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="num-hero text-[3.2rem] leading-none text-[var(--c-gold)] md:text-[4.2rem]"
                  >
                    {formatCurrency(resultado.economiaMensal)}
                  </motion.p>
                </AnimatePresence>
                <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-[var(--c-ink-mid)]">
                  Todo mês, comparado à parcela do financiamento do mesmo {produto.label.toLowerCase()}. Ao
                  longo de todo o contrato, são{' '}
                  <strong className="font-numeric text-[var(--c-gold-lt)]">{formatCurrency(resultado.economiaTotal)}</strong>{' '}
                  que ficariam com o banco.
                </p>
              </div>

              {/* O que só a reunião responde */}
              <div className="border-t-2 border-[var(--c-rule)] bg-white p-7 md:p-9">
                <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-md">
                    <h3 className="font-display text-[17px] font-bold leading-snug text-[var(--c-ink)] md:text-[19px]">
                      Falta a parte que só um consultor calcula
                    </h3>
                    <ul className="mt-4 flex flex-col gap-2.5">
                      {[
                        'Em quantos meses você pode ser contemplado',
                        'Qual lance dá pra fazer com o que você tem hoje',
                        'Quanto a parcela ainda pode baixar no seu caso',
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-[var(--c-ink-mid)]">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--c-electric)]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="w-full shrink-0 lg:w-auto">
                    <button
                      onClick={() => abrirAgendamento('simulador')}
                      className="cta-primary w-full rounded-full px-8 py-4 text-[15px] font-bold lg:w-auto"
                    >
                      Agendar minha reunião gratuita
                    </button>
                    <p className="mt-3 text-center text-[12px] text-[var(--c-ink-faint)] lg:text-right">
                      Chamada de vídeo de 15 min · Sem compromisso
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-5 text-[12.5px] leading-relaxed text-[var(--c-ink-faint)]">
              Valores de parcela cheia, calculados sobre taxas reais de mercado. Taxa administrativa
              de 24% no imóvel e 16% no veículo. A simulação é uma estimativa e não constitui
              proposta formal de contrato.
            </p>
          </Reveal>

          {/* Porta para o investidor — outro comprador, outra página, outra conversa */}
          <Reveal delay={0.14}>
            <a
              href="/consorcio-investimento"
              className="mt-6 flex items-center justify-between gap-4 rounded-xl border-2 border-dashed border-[var(--c-rule)] p-5 transition-colors hover:border-[var(--c-electric)]"
            >
              <div>
                <p className="text-[14px] font-semibold text-[var(--c-ink)]">
                  Você quer usar consórcio como investimento?
                </p>
                <p className="mt-0.5 text-[13px] text-[var(--c-ink-mid)]">
                  Existe a estratégia de contemplação com retorno na venda da cota. É outra conta.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-[var(--c-electric)]" />
            </a>
          </Reveal>
        </div>
      </section>

      {/* ══ 4. COMO FUNCIONA — claro ═════════════════════════ */}
      <section className="zona-clara border-t border-[var(--c-rule)] px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <p className="eyebrow mb-4 text-[var(--c-electric)]">Sem mistério</p>
            <h2 className="font-display max-w-2xl text-[2rem] font-extrabold leading-[1.1] text-[var(--c-ink)] md:text-[2.9rem]">
              Como funciona, em três passos
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {ETAPAS.map((etapa, i) => (
              <Reveal key={etapa.n} delay={i * 0.08}>
                <div className="h-full rounded-xl border-2 border-[var(--c-rule)] bg-white p-7">
                  <span className="font-numeric text-[12px] font-bold text-[var(--c-electric)]">{etapa.n}</span>
                  <h3 className="font-display mt-4 text-[17px] font-bold leading-snug text-[var(--c-ink)]">{etapa.titulo}</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-[var(--c-ink-mid)]">{etapa.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 5. PROVA SOCIAL — claro ══════════════════════════ */}
      <section className="zona-clara border-t border-[var(--c-rule)] px-5 py-20 md:px-8 md:py-28" style={{ background: '#F4F7FB' }}>
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <p className="eyebrow mb-4 text-[var(--c-gold)]">Quem já fez</p>
            <h2 className="font-display max-w-2xl text-[2rem] font-extrabold leading-[1.1] text-[var(--c-ink)] md:text-[2.9rem]">
              Pessoas que pararam de pagar juros
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {DEPOIMENTOS.map((d, i) => (
              <Reveal key={d.nome} delay={i * 0.08}>
                <div className="flex h-full flex-col rounded-xl border-2 border-[var(--c-rule)] bg-white p-7">
                  <p className="flex-1 text-[14px] leading-relaxed text-[var(--c-ink-mid)]">&ldquo;{d.texto}&rdquo;</p>
                  <div className="mt-6 border-t-2 border-[var(--c-rule)] pt-5">
                    <p className="font-display text-[15px] font-bold text-[var(--c-ink)]">{d.nome}</p>
                    <p className="mt-0.5 text-[12.5px] text-[var(--c-ink-faint)]">{d.cidade}</p>
                    <p className="mt-3 text-[12.5px] text-[var(--c-ink-mid)]">{d.bem}</p>
                    <p className="text-[12.5px] text-[var(--c-ink-faint)]">{d.tempo}</p>
                    <p className="mt-3 text-[12px] text-[var(--c-ink-faint)]">Economia vs financiamento</p>
                    <CountUp to={d.economia} className="num-hero text-[1.5rem] text-[var(--c-gold)]" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15}>
            <div className="mt-6 rounded-xl border-2 border-[var(--c-rule)] bg-white p-7 md:p-8">
              <p className="eyebrow mb-5 text-[var(--c-ink-faint)]">Quem administra</p>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {[
                  { n: '+641 mil', l: 'clientes atendidos' },
                  { n: '+35 anos', l: 'de mercado' },
                  { n: '+292', l: 'lojas no Brasil' },
                  { n: 'BACEN', l: 'fiscalização oficial' },
                ].map((item) => (
                  <div key={item.l}>
                    <p className="num-hero text-[1.5rem] leading-none text-[var(--c-ink)]">{item.n}</p>
                    <p className="mt-1.5 text-[12.5px] leading-snug text-[var(--c-ink-faint)]">{item.l}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 border-t-2 border-[var(--c-rule)] pt-5 text-[13px] leading-relaxed text-[var(--c-ink-mid)]">
                Operamos em parceria com {credenciais('landing')}.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ 6. FAQ — claro ═══════════════════════════════════ */}
      <section className="zona-clara border-t border-[var(--c-rule)] px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="eyebrow mb-4 text-[var(--c-electric)]">Perguntas diretas</p>
            <h2 className="font-display text-[2rem] font-extrabold leading-[1.1] text-[var(--c-ink)] md:text-[2.9rem]">
              O que todo mundo pergunta
            </h2>
          </Reveal>

          <div className="mt-11 flex flex-col gap-2.5">
            {FAQ.map((item, i) => {
              const aberta = faqAberta === i
              return (
                <Reveal key={item.q} delay={i * 0.05}>
                  <div
                    className={`overflow-hidden rounded-xl border-2 transition-colors ${
                      aberta ? 'border-[var(--c-electric)]/45 bg-white' : 'border-[var(--c-rule)] bg-white'
                    }`}
                  >
                    <button
                      onClick={() => setFaqAberta(aberta ? null : i)}
                      aria-expanded={aberta}
                      className="flex w-full items-center justify-between gap-5 p-5 text-left md:p-6"
                    >
                      <span
                        className={`font-display text-[15px] font-bold leading-snug md:text-[16.5px] ${
                          aberta ? 'text-[var(--c-electric)]' : 'text-[var(--c-ink)]'
                        }`}
                      >
                        {item.q}
                      </span>
                      <motion.span animate={{ rotate: aberta ? 180 : 0 }} transition={{ duration: 0.25 }} className="shrink-0">
                        <ChevronDown className="h-5 w-5 text-[var(--c-electric)]" />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {aberta && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-6 text-[14px] leading-relaxed text-[var(--c-ink-mid)] md:px-6">{item.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══ 7. FECHAMENTO — de volta ao escuro, a conquista ══ */}
      <section className="relative overflow-hidden">
        <PalcoSonho tour={faixa.tour} chave={`fim-${produto.id}-${faixa.etiqueta}`} intervalo={6000} />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, #070C18 0%, rgba(7,12,24,0.90) 28%, rgba(7,12,24,0.86) 100%)' }}
        />
        <div className="grade-tec pointer-events-none absolute inset-0 opacity-30" />

        <div className="relative mx-auto max-w-2xl px-5 py-24 text-center md:px-8 md:py-32">
          <Reveal>
            <p className="eyebrow mb-5 text-[var(--c-gold-lt)]">
              {faixa.etiqueta} · {formatCurrency(valorSim)}
            </p>
            <h2 className="font-display text-[2.1rem] font-extrabold leading-[1.08] text-white md:text-[3.1rem]">
              Ele pode ser seu sem
              <br />
              <span className="text-[var(--c-gold-lt)]">um centavo de juros.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-white/70 md:text-base">
              Numa chamada de vídeo de 15 minutos o consultor calcula sua estratégia de lance e mostra
              em quanto tempo você pode ser contemplado. Sem pressão, sem compromisso.
            </p>
            <div className="mt-10">
              <button
                onClick={() => abrirAgendamento('cta-final')}
                className="cta-primary cta-breathe inline-flex items-center gap-3 rounded-full px-10 py-5 text-[16px] font-bold md:text-lg"
              >
                Agendar minha reunião gratuita
                <ArrowRight className="h-5 w-5" />
              </button>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] text-white/45">
                {['Sem compromisso', 'Pode cancelar quando quiser', 'Tudo explicado na reunião'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[var(--c-green)]" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════ */}
      <footer className="border-t border-white/8 bg-[var(--c-abyssal)] px-5 py-12 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-8 md:flex-row md:justify-between">
            <div className="max-w-xs">
              <span className="font-display text-[15px] font-extrabold text-white">
                Consórcio<span className="text-[var(--c-electric)]"> Lidera</span>
              </span>
              <p className="mt-3 text-[12.5px] leading-relaxed text-white/40">
                Consórcio de imóvel, veículo e negócio com atendimento consultivo. Sem juros, sem
                burocracia bancária.
              </p>
            </div>
            <div className="text-[12.5px] text-white/40">
              <p className="eyebrow mb-3 text-white/55">Atendimento</p>
              <p>Chamada de vídeo de 15 minutos</p>
              <p className="mt-1">Resposta em até 2 horas úteis</p>
              <button onClick={() => abrirAgendamento('footer')} className="mt-4 font-semibold text-[var(--c-electric)] hover:underline">
                Agendar reunião →
              </button>
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-3 border-t border-white/8 pt-6 text-[11.5px] text-white/25 md:flex-row md:justify-between">
            <p>© {new Date().getFullYear()} Consórcio Lidera. Todos os direitos reservados.</p>
            <p>Simulações são estimativas e não constituem proposta formal de contrato.</p>
          </div>
        </div>
      </footer>

      {/* ══ WHATSAPP — secundário ════════════════════════════ */}
      <a
        href="https://wa.me/5511993929660?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20quero%20tirar%20uma%20d%C3%BAvida%20sobre%20o%20cons%C3%B3rcio."
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('whatsapp_click', { label: 'flutuante' })}
        aria-label="Tirar dúvida pelo WhatsApp"
        className="fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-[#131F35] text-white/60 shadow-xl transition-all hover:border-[var(--c-green)]/60 hover:text-[var(--c-green)]"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.522 5.853L0 24l6.303-1.493A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.816 9.816 0 01-5.007-1.369l-.359-.214-3.741.98.999-3.648-.233-.374A9.817 9.817 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
        </svg>
      </a>

      {/* ══ MODAL ════════════════════════════════════════════ */}
      <AnimatePresence>
        {modalAberto && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalAberto(false)}
              className="fixed inset-0 z-50 backdrop-blur-sm"
              style={{ background: 'rgba(7,12,24,0.86)' }}
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full md:inset-0 md:flex md:items-center md:justify-center md:p-6"
            >
              <div className="max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white md:w-full md:max-w-lg md:rounded-2xl">
                <div className="flex justify-center pt-3 md:hidden">
                  <div className="h-1 w-10 rounded-full bg-gray-200" />
                </div>

                {/* Continuidade: prova que o valor é a simulação DELE, não um exemplo genérico */}
                <div className="flex items-center gap-3 border-b border-gray-100 bg-[#F4F7FB] px-6 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1D63D8]/10">
                    <produto.Icon className="h-4.5 w-4.5 text-[#1D63D8]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Sua simulação
                    </p>
                    <p className="truncate text-[14px] font-bold text-gray-900">
                      {produto.label} de {formatCurrency(valorSim)} ·{' '}
                      <span className="text-[#9A6E12]">{formatCurrency(resultado.parcelaConsorcio)}/mês</span>
                    </p>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <Calculadora bemInicial={produto.id} valorInicial={valorSim} onClose={() => setModalAberto(false)} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
