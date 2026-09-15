import { lerAtribuicao } from './planejamento.mjs'

const CHAVE = 'lidera:atribuicao:v1'

/** Mantém a origem na sessão. Uma nova campanha substitui o conjunto inteiro. */
export function getAtribuicao(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const atual = lerAtribuicao(window.location.search)
  try {
    if (Object.keys(atual).length) {
      window.sessionStorage.setItem(CHAVE, JSON.stringify(atual))
      return atual
    }
    const anterior = JSON.parse(window.sessionStorage.getItem(CHAVE) || '{}')
    if (!anterior || typeof anterior !== 'object' || Array.isArray(anterior)) return {}
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(anterior)) {
      if (typeof value === 'string') params.set(key, value)
    }
    return lerAtribuicao(params.toString())
  } catch {
    return atual
  }
}
