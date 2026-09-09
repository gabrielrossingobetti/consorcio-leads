declare global {
  interface Window { gtag?: (...args: unknown[]) => void }
}

/**
 * Evento de análise (GA4). Serve para enxergar o funil inteiro:
 * quem abriu o simulador, quem trocou de produto, quem preencheu contato.
 *
 * NÃO usar nomes de eventos recomendados do GA4 aqui (generate_lead,
 * purchase, sign_up...) — o Google Ads importa esses automaticamente como
 * conversão, e é assim que o Smart Bidding acaba otimizando para o passo
 * errado do funil.
 */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, params)
  }
}

/**
 * A ÚNICA conversão que vai para o Google Ads.
 *
 * Só dispara quando a reunião foi de fato agendada na agenda do consultor.
 * É esse o sinal que o Smart Bidding usa para aprender quem vale a pena
 * buscar — preenchimento de formulário não entra aqui de propósito.
 *
 * O nome 'meeting_scheduled' é obrigatório: já existe uma ação de conversão
 * no Google Ads ligada a esse evento do GA4. Renomear quebra o vínculo e
 * zera o histórico de aprendizado.
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
 * A SEGUNDA conversão que vai para o Google Ads.
 *
 * Dispara quando a pessoa abre a conversa no WhatsApp já com a simulação
 * feita — não é um clique qualquer no botão flutuante, é a saída do bloco
 * de contemplação, depois de ela ter visto a parcela e o comparativo.
 *
 * Existe porque o público de carta contemplada teme golpe: falar com um
 * humano na hora é o que destrava a desconfiança. Contar só reunião marcada
 * ensinaria o Smart Bidding a desprezar metade dos leads bons.
 *
 * Nome custom de propósito. Nenhum evento recomendado do GA4 aqui — foi
 * 'generate_lead' importado sozinho que treinou o lance no passo errado.
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
