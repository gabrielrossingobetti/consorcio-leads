/**
 * Origem do visitante, para o lead chegar sabendo de qual campanha veio.
 * Usado tanto no agendamento quanto na saída pelo WhatsApp — sem isso não
 * dá para saber qual porta trouxe quem fecha.
 */
export function getUTMs() {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_content: params.get('utm_content') || undefined,
  }
}
