declare global {
  interface Window { gtag?: (...args: unknown[]) => void }
}

/**
 * Eventos de análise. O nome, sozinho, não transforma um evento em conversão
 * de lances: isso depende da configuração das ações e metas no Google Ads.
 * A nova landing só emite planejamento_enviado depois de confirmar a gravação.
 */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, params)
  }
}

/**
 * Fluxo legado: manter o nome até auditar os vínculos no Google Ads.
 * A importância para lances depende das metas efetivamente configuradas.
 * O valor abaixo é crédito solicitado, não faturamento/comissão.
 */
export function registrarReuniaoAgendada(params?: {
  bem?: string
  valor?: number
}) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', 'meeting_scheduled', {
    ...params,
    value: params?.valor ?? 0,
    currency: 'BRL',
  })
}

/**
 * Fluxo legado: o nome histórico whatsapp_qualificado mede abertura,
 * não comprova conversa ou qualificação comercial.
 * Mantido para não mudar silenciosamente campanhas antigas.
 * A nova landing usa whatsapp_aberto, sem atribuir receita ao crédito.
 */
export function registrarWhatsappIniciado(params?: {
  bem?: string
  valor?: number
  porta?: string
}) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', 'whatsapp_qualificado', {
    ...params,
    value: params?.valor ?? 0,
    currency: 'BRL',
  })
}
