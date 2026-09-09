/**
 * Duas portas, uma página.
 *
 * A campanha de carta contemplada aponta para /?porta=carta; a de consórcio
 * usa a página normal. Só o primeiro bloco muda — simulador, comparativo,
 * captura e agendamento são os mesmos componentes nas duas.
 *
 * Existe para resolver um problema medido: quem digitou "consórcio de imóvel"
 * chegava numa página onde a palavra "consórcio" só aparecia depois do
 * simulador. Cada visitante precisa ver na primeira tela a palavra que
 * escreveu no Google.
 */

export type PortaId = 'sonho' | 'carta'

export interface Porta {
  selo: string
  /** Entram na animação palavra por palavra do H1. */
  titulo: string[]
  /** Fecho do H1, em dourado. */
  remate: string
  subtitulo?: string
  cta: string
  rodape: string
}

export const PORTAS: Record<PortaId, Porta> = {
  // Tráfego de "consórcio de imóvel", "consórcio imobiliário", marca e direto.
  sonho: {
    selo: 'Regulado pelo Banco Central',
    titulo: ['Compre', 'o', 'que', 'você', 'quer.'],
    remate: 'Com consórcio. Sem um centavo de juros.',
    cta: 'Ver quanto eu economizo',
    rodape: 'Simulação gratuita · Leva 30 segundos · Sem cadastro para ver o resultado',
  },

  // Tráfego de "carta contemplada", "consórcio contemplado", "comprar carta contemplada".
  // Clique de R$ 1 a R$ 5 contra R$ 5 a R$ 26 da outra porta, e de gente com capital.
  carta: {
    selo: 'Sem ágio · Sem taxa de transferência',
    titulo: ['Você', 'não', 'precisa', 'comprar', 'carta', 'contemplada'],
    remate: 'de ninguém.',
    subtitulo:
      'Com o lance certo, a contemplação sai direto na administradora — contrato registrado, sem pagar ágio a terceiro.',
    cta: 'Calcular meu lance',
    rodape: 'Consórcio regulado pelo Banco Central · Simulação livre, sem cadastro',
  },
}

export function lerPorta(search: string): PortaId {
  const p = new URLSearchParams(search).get('porta')
  return p === 'carta' ? 'carta' : 'sonho'
}
