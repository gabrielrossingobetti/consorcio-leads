'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { BemType, calcular, ResultadoCalculo, calcularInvestidor, ResultadoInvestidor } from '@/lib/calculos'
import StepBem from './StepBem'
import StepValor from './StepValor'
import StepPerfil from './StepPerfil'
import StepResultado from './StepResultado'
import StepResultadoInvestidor from './StepResultadoInvestidor'
import StepMesesInvestidor from './StepMesesInvestidor'
import StepContatoSimples from './StepContatoSimples'

type Step = 'bem' | 'contato' | 'valor' | 'perfil' | 'resultado' | 'meses_investidor' | 'resultado_investidor'

function getUTMs() {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_content: params.get('utm_content') || undefined,
  }
}

const STEPS_NORMAL: Step[] = ['bem', 'valor', 'perfil', 'contato', 'resultado']
const STEPS_INVESTIDOR: Step[] = ['bem', 'valor', 'meses_investidor', 'contato', 'resultado_investidor']

export default function Calculadora({ onClose }: { onClose?: () => void } = {}) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('bem')
  const [bem, setBem] = useState<BemType | null>(null)
  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [valor, setValor] = useState<number | null>(null)
  const [jaTentouFinanciar, setJaTentouFinanciar] = useState('')
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null)
  const [resultadoInvestidor, setResultadoInvestidor] = useState<ResultadoInvestidor | null>(null)
  const [mesesInvestidor, setMesesInvestidor] = useState<number>(12)
  const [simulacaoId, setSimulacaoId] = useState<string | null>(null)
  const [leadId, setLeadId] = useState<string | null>(null)
  const [direction, setDirection] = useState(1)

  const STEPS = bem === 'investidor' ? STEPS_INVESTIDOR : STEPS_NORMAL
  const stepIndex = STEPS.indexOf(step)
  const progress = ((stepIndex + 1) / STEPS.length) * 100

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
        if (typeof window !== 'undefined' && (window as unknown as { gtag?: Function }).gtag) {
          (window as unknown as { gtag: Function }).gtag('event', 'generate_lead', { bem: b })
        }
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

  function redirectObrigado(r: ResultadoCalculo) {
    router.push(
      `/obrigado?nome=${encodeURIComponent(nome)}` +
      `&economia=${r.economiaTotal}` +
      `&bem=${bem}` +
      `&valor=${r.valor}` +
      `&parcela=${r.parcelaConsorcio}` +
      `&prazo=${encodeURIComponent(jaTentouFinanciar)}`
    )
  }

  function redirectObrigadoInvestidor(r: ResultadoInvestidor) {
    router.push(
      `/obrigado?nome=${encodeURIComponent(nome)}` +
      `&economia=${r.lucroLiquido}` +
      `&bem=investidor` +
      `&valor=${r.carta}` +
      `&parcela=${r.parcelaReduzida}` +
      `&prazo=`
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
              <StepBem onSelect={(b) => { setBem(b); goNext('valor') }} />
            )}

            {step === 'valor' && bem && (
              <StepValor
                bem={bem}
                onConfirm={(v) => {
                  setValor(v)
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
                onBack={() => goBack('valor')}
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
                onContinuar={() => redirectObrigado(resultado)}
                onBack={() => goBack('contato')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
