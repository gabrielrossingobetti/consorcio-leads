/**
 * Identificador de sessão do visitante.
 *
 * Existe para o painel conseguir contar PESSOAS por etapa em vez de eventos
 * soltos. Sem isso uma etapa podia aparecer com menos gente que a seguinte,
 * o que não descreve funil nenhum.
 *
 * Fica no sessionStorage: dura a visita, some ao fechar a aba. Não é
 * identificação pessoal — é um número aleatório para ligar os passos de uma
 * mesma navegação.
 */
const CHAVE = 'funil_sessao'

export function getSessao(): string {
  if (typeof window === 'undefined') return ''
  try {
    let s = sessionStorage.getItem(CHAVE)
    if (!s) {
      s = Math.random().toString(36).slice(2) + Date.now().toString(36)
      sessionStorage.setItem(CHAVE, s)
    }
    return s
  } catch {
    // Navegador com storage bloqueado: segue sem sessão, o evento ainda é gravado.
    return ''
  }
}
