'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { BemType, calcular, ResultadoCalculo, calcularInvestidor, ResultadoInvestidor } from '@/lib/calculos'
import { trackEvent } from '@/lib/gtag'
import { getUTMs } from '@/lib/utm'
import StepBem from './StepBem'
import StepValor from './StepValor'
import StepPerfil from './StepPerfil'
import StepResultado from './StepResultado'
import StepResultadoInvestidor from './StepResultadoInvestidor'
import StepMesesInvestidor from './StepMesesInvestidor'
import StepContatoSimples from './StepContatoSimples'
import StepAgendamento from './StepAgendamento'

type Step = 'bem' | 'contato' | 'valor' | 'perfil' | 'resultado' | 'agendamento' | 'meses_investidor' | 'resultado_investidor'

const STEPS_NORMAL: Step[] = ['bem', 'valor', 'perfil', 'contato', 'resultado', 'agendamento']
const STEPS_INVESTIDOR: Step[] = ['bem', 'valor', 'meses_investidor', 'contato', 'resultado_investidor']

interface CalculadoraProps {
  onClose?: () => void
  /** Bem já escolhido no simulador inline — pula a etapa de seleção */
  bemInicial?: BemType | null
  /** Valor já definido no simulador inline — pula a etapa de valor */
  valorInicial?: number | null
}

export default function Calculadora({ onClose, bemInicial, valorInicial }: CalculadoraProps = {}) {
  const router = useRouter()
  // Quando o lead já simulou inline, entra direto no perfil — não repete o que já respondeu
  const temPreSelecao = Boolean(bemInicial && valorInicial)
  // Quem já simulou na página e clicou em agendar vai DIRETO para a agenda.
  // As perguntas de qualificação e o formulário saíram do meio do caminho:
  // custavam quatro telas no pico de intenção e não devolviam nada que a
  // pessoa já não tivesse visto de graça.
  const [step, setStep] = useState<Step>(temPreSelecao ? 'agendamento' : 'bem')
  const [bem, setBem] = useState<BemType | null>(bemInicial ?? null)
  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [valor, setValor] = useState<number | null>(valorInicial ?? null)
  const [jaTentouFinanciar, setJaTentouFinanciar] = useState('')
  // Com pré-seleção o cálculo já existe (a pessoa viu na página) — entra pronto,
  // senão a agenda abriria sem resultado e o passo ficaria em branco.
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(
    bemInicial && valorInicial ? calcular(bemInicial, valorInicial) : null
  )
  const [resultadoInvestidor, setResultadoInvestidor] = useState<ResultadoInvestidor | null>(null)
  const [mesesInvestidor, setMesesInvestidor] = useState<number>(12)
  const [simulacaoId, setSimulacaoId] = useState<string | null>(null)
  const [leadId, setLeadId] = useState<string | null>(null)
  const [direction, setDirection] = useState(1)

  // Com pré-seleção, as etapas 'bem' e 'valor' não existem no fluxo
  const STEPS_BASE = bem === 'investidor' ? STEPS_INVESTIDOR : STEPS_NORMAL
  const STEPS = temPreSelecao
    ? STEPS_BASE.filter((s) => s !== 'bem' && s !== 'valor' && s !== 'perfil' && s !== 'contato' && s !== 'resultado')
    : STEPS_BASE
  const stepIndex = STEPS.indexOf(step)
  const progress = ((stepIndex + 1) / STEPS.length) * 100

  // Mantém o cálculo colado na simulação da página. Sem isso, mexer no valor
  // com o modal aberto congela o resultado antigo — o cabeçalho mostra um
  // número e a reserva é feita com outro.
  useEffect(() => {
    if (!bemInicial || !valorInicial) return
    setBem(bemInicial)
    setValor(valorInicial)
    setResultado(calcular(bemInicial, valorInicial))
  }, [bemInicial, valorInicial])

  function goNext(nextStep: Step) {
    setDirection(1)
    setStep(nextStep)
  }

  function goBack(prevStep: Step) {
    setDirection(-1)
    setStep(prevStep)
  }

  async function salvarLead(n: string, w: string, b: BemType): Promise<string | null> {
    const utms = getUTMs()
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: n, whatsapp: w, bem: b, ...utms }),
      })
      const data = await res.json()
      if (data.id) {
        setLeadId(data.id)
        // Registro de funil, não conversão. O nome é custom de propósito:
        // 'generate_lead' é evento recomendado do GA4 e o Ads o importa
        // sozinho como conversão — era isso que treinava o lance no passo errado.
        trackEvent('contato_preenchido', { bem: b })
        trackEvent('simulacao_contato_enviado', { bem: b })
        return data.id
      }
    } catch {
      // silencioso
    }
    return null
  }

  async function atualizarLeadComValor(id: string, v: number, perfil: string) {
    try {
      await fetch('/api/lead', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, valor: v, ja_tentou_financiar: perfil }),
      })
    } catch {
      // silencioso
    }
  }

  async function salvarSimulacao(r: ResultadoCalculo, nomeOverride?: string, wpOverride?: string) {
    const utms = getUTMs()
    try {
      const res = await fetch('/api/simulacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...r, nome: nomeOverride ?? nome, whatsapp: wpOverride ?? whatsapp, ...utms }),
      })
      const data = await res.json()
      if (data.id) setSimulacaoId(data.id)
    } catch {
      // silencioso
    }
  }

  /** Reunião marcada: a página seguinte só confirma e reduz no-show — não vende mais nada. */
  function redirectConfirmacao(r: ResultadoCalculo, slotIso: string, nomeFinal?: string) {
    router.push(
      `/reuniao-confirmada?nome=${encodeURIComponent(nomeFinal ?? nome)}` +
      `&produto=${bem}` +
      `&credito=${r.valor}` +
      `&parcela=${r.parcelaConsorcio}` +
      `&slot=${encodeURIComponent(slotIso)}`
    )
  }

  function redirectObrigadoInvestidor(r: ResultadoInvestidor) {
    router.push(
      `/direcionamento?nome=${encodeURIComponent(nome)}` +
      `&produto=investidor` +
      `&credito=${r.carta}` +
      `&parcela=${r.parcelaReduzida}` +
      `&whatsapp=${encodeURIComponent(whatsapp)}`
    )
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400 font-medium">Etapa {stepIndex + 1} de {STEPS.length}</span>
          <span className="text-xs text-red-600 font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-red-600 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {step === 'bem' && (
              <StepBem onSelect={(b) => { setBem(b); trackEvent('simulacao_bem_selecionado', { bem: b }); goNext('valor') }} />
            )}

            {step === 'valor' && bem && (
              <StepValor
                bem={bem}
                onConfirm={(v) => {
                  setValor(v)
                  trackEvent('simulacao_valor_confirmado', { bem, valor: v })
                  goNext(bem === 'investidor' ? 'meses_investidor' : 'perfil')
                }}
                onBack={() => goBack('bem')}
              />
            )}

            {step === 'meses_investidor' && bem === 'investidor' && valor && (
              <StepMesesInvestidor
                onConfirm={(meses) => {
                  setMesesInvestidor(meses)
                  const calc = calcularInvestidor(valor, meses)
                  setResultadoInvestidor(calc)
                  goNext('contato')
                }}
                onBack={() => goBack('valor')}
              />
            )}

            {step === 'resultado_investidor' && resultadoInvestidor && (
              <StepResultadoInvestidor
                resultado={resultadoInvestidor}
                onContinuar={() => redirectObrigadoInvestidor(resultadoInvestidor)}
                onBack={() => goBack('contato')}
              />
            )}

            {step === 'perfil' && bem && valor && (
              <StepPerfil
                onSelect={(r) => {
                  setJaTentouFinanciar(r)
                  const calc = calcular(bem, valor)
                  setResultado(calc)
                  goNext('contato')
                }}
                // Com pré-seleção não há etapa anterior: voltar fecha e devolve ao simulador da página
                onBack={temPreSelecao ? () => onClose?.() : () => goBack('valor')}
              />
            )}

            {step === 'contato' && (
              <StepContatoSimples
                onSubmit={async (n, w) => {
                  setNome(n)
                  setWhatsapp(w)
                  const leadIdNovo = bem ? await salvarLead(n, w, bem) : null
                  if (resultado) {
                    await Promise.all([
                      salvarSimulacao(resultado, n, w),
                      leadIdNovo ? atualizarLeadComValor(leadIdNovo, resultado.valor, jaTentouFinanciar) : Promise.resolve(),
                    ])
                    goNext('resultado')
                  } else if (resultadoInvestidor) {
                    await Promise.all([
                      salvarSimulacao({ ...resultadoInvestidor, bem: 'investidor', nome: n, whatsapp: w } as never, n, w),
                      leadIdNovo ? atualizarLeadComValor(leadIdNovo, resultadoInvestidor.carta, '') : Promise.resolve(),
                    ])
                    goNext('resultado_investidor')
                  }
                }}
                onBack={() => goBack(resultado ? 'perfil' : 'meses_investidor')}
              />
            )}

            {step === 'resultado' && resultado && (
              <StepResultado
                resultado={resultado}
                nome={nome}
                onContinuar={() => goNext('agendamento')}
                onBack={() => goBack('contato')}
              />
            )}

            {step === 'agendamento' && resultado && (
              <StepAgendamento
                resultado={resultado}
                nome={nome || undefined}
                whatsapp={whatsapp || undefined}
                // Quem veio da página já escolheu falar: abre direto no calendário,
                // sem a tela de opções que competia com o agendamento.
                inicio={temPreSelecao ? 'dia' : 'escolha'}
                onBack={temPreSelecao ? () => onClose?.() : () => goBack('resultado')}
                onSuccess={(slotIso, contato) => {
                  setNome(contato.nome)
                  setWhatsapp(contato.whatsapp)
                  redirectConfirmacao(resultado, slotIso, contato.nome)
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
