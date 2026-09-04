'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, type MotionValue } from 'framer-motion'

/**
 * O palco onde o sonho acontece.
 *
 * Recebe uma sequência de imagens e as atravessa lentamente com Ken Burns,
 * criando a sensação de percorrer o ambiente em vez de olhar uma foto.
 * As camadas respondem ao mouse com profundidades diferentes — o que dá
 * a sensação de espaço real, não de imagem colada no fundo.
 */
export default function PalcoSonho({
  tour,
  chave,
  posicao = 'center',
  parallaxX,
  parallaxY,
  intervalo = 5200,
}: {
  /** Imagens que compõem o percurso pelo ambiente */
  tour: string[]
  /** Muda quando o contexto muda (produto ou faixa) — reinicia o tour */
  chave: string
  posicao?: string
  parallaxX?: MotionValue<number>
  parallaxY?: MotionValue<number>
  intervalo?: number
}) {
  const [quadro, setQuadro] = useState(0)

  // Reinicia o percurso sempre que o ambiente muda
  useEffect(() => {
    setQuadro(0)
  }, [chave])

  // Avança pelo ambiente
  useEffect(() => {
    if (tour.length < 2) return
    const t = setInterval(() => setQuadro((q) => (q + 1) % tour.length), intervalo)
    return () => clearInterval(t)
  }, [tour.length, intervalo, chave])

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      style={parallaxX && parallaxY ? { x: parallaxX, y: parallaxY, scale: 1.08 } : undefined}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={`${chave}-${quadro}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tour[quadro]}
            alt=""
            className="ken-burns h-full w-full object-cover"
            style={{ objectPosition: posicao }}
            loading={quadro === 0 ? 'eager' : 'lazy'}
          />
        </motion.div>
      </AnimatePresence>

      {/* Marcadores do percurso — sinal discreto de que a cena se move */}
      {tour.length > 1 && (
        <div className="absolute bottom-6 right-6 z-10 flex gap-1.5">
          {tour.map((_, i) => (
            <span
              key={i}
              className="h-0.5 rounded-full transition-all duration-700"
              style={{
                width: i === quadro ? 22 : 8,
                background: i === quadro ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.28)',
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
