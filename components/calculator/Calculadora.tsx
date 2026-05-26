'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { BemType, calcular, ResultadoCalculo } from '@/lib/calculos'
import StepBem from './StepBem'
import StepValor from './StepValor'
import StepPerfil from './StepPerfil'
import StepResultado from './StepResultado'
import StepContato from './StepContato'

type Step = 'bem' | 'valor' | 'perfil' | 'resultado' | 'contato'

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

const STEPS: Step[] = ['bem', 'valor', 'perfil', 'resultado', 'contato']

export default function Calculadora() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('bem')
  const [bem, setBem] = useState<BemType | null>(null)
  const [valor, setValor] = useState<number | null>(null)
  const [jaTentouFinanciar, setJaTentouFinanciar] = useState('')
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null)
  const [simulacaoId, setSimulacaoId] = useState<string | null>(null)
  const [direction, setDirection] = useState(1)

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

  async function salvarSimulacao(r: ResultadoCalculo) {
    const utms = getUTMs()
    try {
      const res = await fetch('/api/simulacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...r, ...utms }),
      })
      const data = await res.json()
      if (data.id) setSimulacaoId(data.id)
    } catch {
      // silencioso — não bloqueia o fluxo
    }
  }

  async function handleContato(nome: string, whatsapp: string) {
    const utms = getUTMs()
    await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome,
        whatsapp,
        bem,
        valor,
        simulacao_id: simulacaoId,
        ja_tentou_financiar: jaTentouFinanciar,
        ...utms,
      }),
    })
    router.push(`/obrigado?nome=${encodeURIComponent(nome)}&economia=${resultado?.economiaTotal || 0}&bem=${bem}`)
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400 font-medium">
            Etapa {stepIndex + 1} de {STEPS.length}
          </span>
          <span className="text-xs text-blue-600 font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
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
              <StepBem
                onSelect={(b) => { setBem(b); goNext('valor') }}
              />
            )}
            {step === 'valor' && bem && (
              <StepValor
                bem={bem}
                onConfirm={(v) => { setValor(v); goNext('perfil') }}
                onBack={() => goBack('bem')}
              />
            )}
            {step === 'perfil' && bem && valor && (
              <StepPerfil
                onSelect={(r) => {
                  setJaTentouFinanciar(r)
                  const calc = calcular(bem, valor)
                  setResultado(calc)
                  salvarSimulacao(calc)
                  goNext('resultado')
                }}
                onBack={() => goBack('valor')}
              />
            )}
            {step === 'resultado' && resultado && (
              <StepResultado
                resultado={resultado}
                onContinuar={() => goNext('contato')}
                onBack={() => goBack('bem')}
              />
            )}
            {step === 'contato' && resultado && (
              <StepContato
                resultado={resultado}
                jaTentouFinanciar={jaTentouFinanciar}
                onSubmit={handleContato}
                onBack={() => goBack('resultado')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
