'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
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

const STEPS_NORMAL: Step[] = ['bem', 'contato', 'valor', 'perfil', 'resultado']
const STEPS_INVESTIDOR: Step[] = ['bem', 'contato', 'valor', 'meses_investidor', 'resultado_investidor']

export default function Calculadora({ onClose }: { onClose?: () => void }) {
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

  async function salvarLead(n: string, w: string, b: BemType) {
    const utms = getUTMs()
    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: n, whatsapp: w, bem: b, ...utms }),
      })
    } catch {
      // silencioso
    }
  }

  async function salvarSimulacao(r: ResultadoCalculo) {
    const utms = getUTMs()
    try {
      const res = await fetch('/api/simulacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...r, nome, whatsapp, ...utms }),
      })
      const data = await res.json()
      if (data.id) setSimulacaoId(data.id)
    } catch {
      // silencioso
    }
  }

  async function handleResultadoFinal(r: ResultadoCalculo) {
    await salvarSimulacao(r)
    router.push(
      `/obrigado?nome=${encodeURIComponent(nome)}` +
      `&economia=${r.economiaTotal}` +
      `&bem=${bem}` +
      `&valor=${r.valor}` +
      `&parcela=${r.parcelaConsorcio}` +
      `&prazo=${encodeURIComponent(jaTentouFinanciar)}`
    )
  }

  async function handleResultadoInvestidorFinal(r: ResultadoInvestidor) {
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-600 font-bold">{Math.round(progress)}%</span>
            {onClose && (
              <button
                onClick={onClose}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
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
              <StepBem onSelect={(b) => { setBem(b); goNext('contato') }} />
            )}

            {step === 'contato' && (
              <StepContatoSimples
                onSubmit={(n, w) => {
                  setNome(n)
                  setWhatsapp(w)
                  if (bem) salvarLead(n, w, bem)
                  goNext('valor')
                }}
                onBack={() => goBack('bem')}
              />
            )}

            {step === 'valor' && bem && (
              <StepValor
                bem={bem}
                onConfirm={(v) => {
                  setValor(v)
                  goNext(bem === 'investidor' ? 'meses_investidor' : 'perfil')
                }}
                onBack={() => goBack('contato')}
              />
            )}

            {step === 'meses_investidor' && bem === 'investidor' && valor && (
              <StepMesesInvestidor
                onConfirm={(meses) => {
                  setMesesInvestidor(meses)
                  const calc = calcularInvestidor(valor, meses)
                  setResultadoInvestidor(calc)
                  goNext('resultado_investidor')
                }}
                onBack={() => goBack('valor')}
              />
            )}

            {step === 'resultado_investidor' && resultadoInvestidor && (
              <StepResultadoInvestidor
                resultado={resultadoInvestidor}
                onContinuar={() => handleResultadoInvestidorFinal(resultadoInvestidor)}
                onBack={() => goBack('meses_investidor')}
              />
            )}

            {step === 'perfil' && bem && valor && (
              <StepPerfil
                onSelect={(r) => {
                  setJaTentouFinanciar(r)
                  const calc = calcular(bem, valor)
                  setResultado(calc)
                  goNext('resultado')
                }}
                onBack={() => goBack('valor')}
              />
            )}

            {step === 'resultado' && resultado && (
              <StepResultado
                resultado={resultado}
                onContinuar={() => handleResultadoFinal(resultado)}
                onBack={() => goBack('bem')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
