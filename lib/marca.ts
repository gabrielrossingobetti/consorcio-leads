/**
 * Controle único da exposição da administradora parceira.
 *
 * Enquanto não houver confirmação do que o contrato permite em tráfego pago,
 * a marca fica desligada na porta de entrada e ligada só depois que o lead
 * já se identificou. Mudar aqui muda em toda a aplicação — não há nome
 * hardcoded espalhado por página.
 */

export const MARCA = {
  /** Nome da administradora. Só é exibido onde as flags abaixo permitirem. */
  nome: 'Ademicon',

  /** Exibir na landing page pública (hero, nav, rodapé)? */
  naLandingPublica: false,

  /** Exibir na página de direcionamento, após a simulação? */
  naPaginaPosSimulacao: true,

  /** Texto de credibilidade usado quando a marca está oculta. */
  semNome: 'administradora autorizada e fiscalizada pelo Banco Central',

  /** Texto de credibilidade usado quando a marca pode aparecer. */
  comNome:
    'Ademicon — maior administradora independente de consórcios do país, autorizada e fiscalizada pelo Banco Central',
} as const

/** Frase de credibilidade correta para o contexto pedido. */
export function credenciais(contexto: 'landing' | 'pos-simulacao'): string {
  const podeMostrar =
    contexto === 'landing' ? MARCA.naLandingPublica : MARCA.naPaginaPosSimulacao
  return podeMostrar ? MARCA.comNome : MARCA.semNome
}

/** Se o nome da administradora pode ser dito neste contexto. */
export function podeNomear(contexto: 'landing' | 'pos-simulacao'): boolean {
  return contexto === 'landing' ? MARCA.naLandingPublica : MARCA.naPaginaPosSimulacao
}
