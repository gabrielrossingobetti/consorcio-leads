import test from 'node:test'
import assert from 'node:assert/strict'
import {
  validarPlanejamento, notasPlanejamento, lerAtribuicao,
  ORCAMENTOS, PRODUTOS_PLANO, linkWhatsApp, calcularLanceEmbutido,
} from '../lib/planejamento.mjs'

export const pedidoValido = () => ({
  request_id: 'b85dbbce-e7a9-4cba-96d1-094390b19994',
  nome: 'Pessoa de Teste', whatsapp: '(11) 98765-4321',
  bem: 'carro', valor: 100000, orcamento: ORCAMENTOS[1],
  momento: 'flexivel', lance: 'sem_reserva', intencao: 'avaliar_plano',
  consentimento: true, ciente_contemplacao: true,
  atribuicao: { gclid: 'click-teste', utm_campaign: 'automoveis' },
})

test('normaliza contato e preserva origem, sem qualificação automática', () => {
  const result = validarPlanejamento({ ...pedidoValido(), nome: '  Pessoa   de Teste  ', whatsapp: '+55 (11) 98765-4321', status: 'fechado' })
  assert.equal(result.ok, true)
  assert.equal(result.data.nome, 'Pessoa de Teste')
  assert.equal(result.data.whatsapp, '11987654321')
  assert.equal(result.data.status, undefined)
  assert.equal(result.data.atribuicao.gclid, 'click-teste')
  const notas = JSON.parse(notasPlanejamento(result.data))
  assert.equal(notas.origem, 'landing-v2')
  assert.equal(notas.momento, 'flexivel')
  assert.equal(notas.qualificado, undefined)
  assert.equal(notas.privacidade_versao, '2026-09-14')
})

test('não aceita produto, valores ou respostas manipulados', () => {
  for (const extra of [
    { bem: 'emprestimo' }, { valor: 0 }, { valor: Infinity },
    { valor: PRODUTOS_PLANO.carro.max + 1 }, { valor: '100000' },
    { orcamento: 'qualquer' }, { momento: 'garantido' }, { lance: '__proto__' },
    { intencao: 'qualificado' }, { intencao: undefined },
  ]) assert.equal(validarPlanejamento({ ...pedidoValido(), ...extra }).ok, false)
  assert.equal(validarPlanejamento({ ...pedidoValido(), bem: 'imovel', valor: 800000 }).ok, true)
})

test('exige ciência e solicitação de contato explícitas', () => {
  for (const extra of [
    { consentimento: false }, { consentimento: 'true' },
    { ciente_contemplacao: false }, { ciente_contemplacao: undefined },
  ]) assert.equal(validarPlanejamento({ ...pedidoValido(), ...extra }).ok, false)
})

test('rejeita contato inválido, campo robô e identificador inválido', () => {
  for (const extra of [
    { nome: 'A' }, { nome: '<script>teste</script>' }, { nome: 'A'.repeat(81) },
    { whatsapp: '123' }, { whatsapp: '99999999999' }, { whatsapp: '1187654321' },
    { request_id: 'lead-1' }, { website: 'spam.example' },
  ]) assert.equal(validarPlanejamento({ ...pedidoValido(), ...extra }).ok, false)
  for (const input of [null, [], 'texto', 1]) assert.equal(validarPlanejamento(input).ok, false)
})

test('urgência imediata é registrada para atendimento, sem prometer contemplação', () => {
  const result = validarPlanejamento({ ...pedidoValido(), momento: 'imediato' })
  assert.equal(result.ok, true)
  assert.equal(JSON.parse(notasPlanejamento(result.data)).momento, 'imediato')
})

test('origem usa lista permitida e limita tamanho', () => {
  const input = { ...pedidoValido(), atribuicao: {
    gclid: 'x'.repeat(900), utm_term: 'consorcio carro',
    nome: 'não deve entrar', arbitrary: 'não deve entrar',
  } }
  const result = validarPlanejamento(input)
  assert.equal(result.ok, true)
  assert.equal(result.data.atribuicao.gclid.length, 500)
  assert.deepEqual(Object.keys(result.data.atribuicao), ['utm_term', 'gclid'])
  assert.deepEqual(lerAtribuicao('?gclid=abc&gbraid=xyz&utm_term=consorcio+carro&nome=Teste'), {
    utm_term: 'consorcio carro', gclid: 'abc', gbraid: 'xyz',
  })
})

test('as duas intenções vão ao mesmo WhatsApp com contexto, sem dados pessoais na URL', () => {
  const pronto = new URL(linkWhatsApp(pedidoValido()))
  const aprender = new URL(linkWhatsApp({ ...pedidoValido(), intencao: 'entender_consorcio' }))
  assert.equal(pronto.origin, 'https://wa.me')
  assert.equal(pronto.pathname, aprender.pathname)
  assert.match(pronto.searchParams.get('text'), /quero avaliar um plano para contratar/)
  assert.match(aprender.searchParams.get('text'), /Quero entender como funciona/)
  for (const url of [pronto, aprender]) {
    const mensagem = url.searchParams.get('text')
    assert.match(mensagem, /sem data garantida/)
    assert.match(mensagem, /automóvel/)
    assert.equal(mensagem.includes('Pessoa de Teste'), false)
    assert.equal(mensagem.includes('11987654321'), false)
    assert.equal(mensagem.includes('click-teste'), false)
  }
})

test('exemplo de 25% deduz o lance da carta, incluindo centavos e limites', () => {
  assert.deepEqual(calcularLanceEmbutido(100000, 25), {
    credito: 100000, percentual: 25, lance: 25000, creditoParaCompra: 75000,
  })
  for (const credito of [30000, 99999, 100001, 400000, 1500000, 100000.03]) {
    const exemplo = calcularLanceEmbutido(credito, 25)
    assert.equal(Math.round((exemplo.lance + exemplo.creditoParaCompra) * 100), Math.round(credito * 100))
    assert.equal(calcularLanceEmbutido(credito, 0).creditoParaCompra, credito)
  }
  for (const [credito, percentual] of [[0, 25], [-10, 25], [NaN, 25], [Infinity, 25], [1500001, 25], [100000, 30], [100000, '25']]) {
    assert.throws(() => calcularLanceEmbutido(credito, percentual), RangeError)
  }
})

test('servidor recalcula o exemplo e rejeita percentuais manipulados', () => {
  const result = validarPlanejamento({ ...pedidoValido(), lance_embutido_percentual: 25,
    creditoParaCompra: 100000, exemplo_lance_embutido: { lance: 0 } })
  assert.equal(result.ok, true)
  const exemplo = JSON.parse(notasPlanejamento(result.data)).exemplo_lance_embutido
  assert.equal(exemplo.creditoParaCompra, 75000)
  assert.equal(exemplo.lance, 25000)
  assert.equal(exemplo.sujeito_as_regras_do_grupo, true)
  for (const lance_embutido_percentual of [null, '25', 26, -25, {}, true]) {
    assert.equal(validarPlanejamento({ ...pedidoValido(), lance_embutido_percentual }).ok, false)
  }
  assert.equal(JSON.parse(notasPlanejamento(validarPlanejamento(pedidoValido()).data)).exemplo_lance_embutido, null)
})

test('mensagem leva a simulação escolhida, o crédito restante e a condição do grupo', () => {
  const mensagem = new URL(linkWhatsApp({ ...pedidoValido(), lance_embutido_percentual: 25 })).searchParams.get('text')
  assert.match(mensagem, /25\.000,00/)
  assert.match(mensagem, /75\.000,00/)
  assert.match(mensagem, /se permitido pelo grupo/)
  assert.match(mensagem, /se o lance vencer/)
  const semExemplo = new URL(linkWhatsApp(pedidoValido())).searchParams.get('text')
  assert.equal(semExemplo.includes('embutido'), false)
})
