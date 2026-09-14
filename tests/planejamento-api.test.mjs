import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
import * as planejamento from '../lib/planejamento.mjs'

// Executa a rota real com dependências isoladas. Nenhum banco, e-mail,
// ferramenta de analytics ou endpoint de produção é chamado.
const source = readFileSync(new URL('../app/api/planejamento/route.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText

const pedido = () => ({
  request_id: 'b85dbbce-e7a9-4cba-96d1-094390b19994',
  nome: 'Pessoa de Teste', whatsapp: '11987654321',
  bem: 'carro', valor: 100000, orcamento: planejamento.ORCAMENTOS[1],
  momento: 'flexivel', lance: 'sem_reserva', intencao: 'avaliar_plano',
  consentimento: true, ciente_contemplacao: true,
  atribuicao: { gclid: 'click-teste' },
})

function carregar({ insertError = null, collision = false, noCredentials = false, connectionError = false } = {}) {
  let gravado
  let chamadas = 0
  const db = {
    from(table) {
      assert.equal(table, 'leads_captacao')
      return {
        async insert(row) {
          chamadas++
          if (connectionError) throw new Error('simulated offline')
          gravado = row
          return { error: insertError }
        },
        select() { return this },
        eq() { return this },
        async single() {
          return { data: { ...gravado, ...(collision ? { nome: 'Outra pessoa' } : {}) }, error: null }
        },
      }
    },
  }
  const exports = {}
  const requireMock = (name) => {
    if (name === 'next/server') return { NextResponse: { json: (body, init) => Response.json(body, init) } }
    if (name === '@supabase/supabase-js') return { createClient: () => db }
    if (name === '@/lib/planejamento.mjs') return planejamento
    throw new Error('Dependência inesperada: ' + name)
  }
  new Function('require', 'exports', 'process', compiled)(requireMock, exports, {
    env: noCredentials ? {} : {
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.invalid',
      SUPABASE_SERVICE_ROLE_KEY: 'isolated-test-placeholder',
    },
  })
  const send = (body = pedido(), headers = {}) => exports.POST(new Request('https://landing.example/api/planejamento', {
    method: 'POST', headers: { 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }))
  return { send, get row() { return gravado }, get calls() { return chamadas } }
}

test('confirma somente depois de gravar e guarda o contexto nas notas', async () => {
  const app = carregar()
  const response = await app.send()
  assert.equal(response.status, 201)
  assert.deepEqual(await response.json(), { success: true, id: pedido().request_id })
  assert.equal(app.calls, 1)
  assert.equal(app.row.status, 'novo')
  assert.equal(JSON.parse(app.row.notas).atribuicao.gclid, 'click-teste')
})

test('falha de banco ou de conexão nunca retorna sucesso', async () => {
  for (const options of [{ insertError: { code: 'XX000' } }, { connectionError: true }]) {
    const response = await carregar(options).send()
    assert.equal(response.status, 503)
    assert.equal((await response.json()).success, undefined)
  }
})

test('repetição do mesmo pedido é segura; colisão não é sobrescrita', async () => {
  const options = { insertError: { code: '23505' } }
  assert.equal((await carregar(options).send()).status, 200)
  assert.equal((await carregar({ ...options, collision: true }).send()).status, 503)
})

test('entrada inválida, origem externa e formato incorreto não chegam ao banco', async () => {
  const app = carregar()
  assert.equal((await app.send({ ...pedido(), consentimento: false })).status, 400)
  assert.equal((await app.send('{')).status, 400)
  assert.equal((await app.send('x'.repeat(12001))).status, 413)
  assert.equal((await app.send(pedido(), { origin: 'https://external.example' })).status, 403)
  assert.equal((await app.send(pedido(), { 'content-type': 'text/plain' })).status, 415)
  assert.equal(app.calls, 0)
})

test('ausência de credenciais é indisponibilidade, não contato salvo', async () => {
  const app = carregar({ noCredentials: true })
  assert.equal((await app.send()).status, 503)
  assert.equal(app.calls, 0)
})
