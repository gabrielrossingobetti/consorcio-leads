'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, ChevronDown, ArrowUpRight } from 'lucide-react'
import { getAtribuicao } from '@/lib/atribuicao'
import { trackEvent } from '@/lib/gtag'
import {
  ATENDIMENTOS, MOMENTOS, ORCAMENTOS, PRODUTOS_PLANO,
  calcularLanceEmbutido, linkWhatsApp, validarPlanejamento, type ProdutoPlano,
} from '@/lib/planejamento.mjs'

const dinheiro = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: Number.isInteger(valor) ? 0 : 2, maximumFractionDigits: 2 })

type Confirmacao = { id: string; valor: number; orcamento: string; url: string }

export default function PlanoForm({ produto }: { produto: ProdutoPlano }) {
  const config = PRODUTOS_PLANO[produto]
  const [etapa, setEtapa] = useState(1)
  const [valor, setValor] = useState(config.inicial)
  const [creditoDigitado, setCreditoDigitado] = useState(config.inicial.toLocaleString('pt-BR'))
  const [creditoInvalido, setCreditoInvalido] = useState(false)
  const [embutido, setEmbutido] = useState(false)
  const [intencao, setIntencao] = useState('')
  const [orcamento, setOrcamento] = useState('')
  const [momento, setMomento] = useState('')
  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [consentimento, setConsentimento] = useState(false)
  const [ciente, setCiente] = useState(false)
  const [website, setWebsite] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [confirmacao, setConfirmacao] = useState<Confirmacao | null>(null)
  const titulo = useRef<HTMLHeadingElement>(null)
  const etapaAnterior = useRef(1)
  const bloqueado = useRef(false)
  const tentativa = useRef<{ assinatura: string; id: string } | null>(null)
  const iniciado = useRef(false)
  const etapaConcluida = useRef(false)
  const exemplo = calcularLanceEmbutido(valor, embutido ? 25 : 0)

  useEffect(() => { getAtribuicao() }, [])
  useEffect(() => {
    if (etapaAnterior.current !== etapa || confirmacao) titulo.current?.focus()
    etapaAnterior.current = etapa
  }, [etapa, confirmacao])

  function medir(nomeEvento: string, parametros: Record<string, unknown> = {}) {
    // Somente etapas e escolhas de navegação; sem contato, orçamento ou URL.
    try { trackEvent(nomeEvento, { bem: produto, ...parametros }) } catch { /* Medição não bloqueia o formulário. */ }
  }

  function iniciar() {
    if (iniciado.current) return
    iniciado.current = true
    medir('planejamento_iniciado')
  }

  function escolherCredito(proximo: number) {
    setValor(proximo)
    setCreditoDigitado(proximo.toLocaleString('pt-BR'))
    setCreditoInvalido(false)
  }

  function digitarCredito(texto: string) {
    setCreditoDigitado(texto)
    const normalizado = texto.trim().replace(/^R\$\s*/, '').replace(/\./g, '').replace(/,00$/, '')
    const proximo = /^\d+$/.test(normalizado) ? Number(normalizado) : NaN
    const invalido = !Number.isSafeInteger(proximo) || proximo < config.min || proximo > config.max
    setCreditoInvalido(invalido)
    if (!invalido) setValor(proximo)
  }

  function continuar() {
    setErro('')
    if (creditoInvalido) {
      document.getElementById('credito-desejado')?.focus()
      return
    }
    if (!intencao) { setErro('Escolha como podemos ajudar no WhatsApp.'); return }
    if (!etapaConcluida.current) {
      medir('planejamento_etapa_concluida', { etapa: 1, intencao })
      etapaConcluida.current = true
    }
    setEtapa(2)
  }

  async function enviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (etapa === 1) { continuar(); return }
    if (bloqueado.current) return
    setErro('')
    const payload = {
      nome, whatsapp, bem: produto, valor, orcamento, momento, intencao,
      lance_embutido_percentual: embutido ? 25 : 0,
      lance: 'nao_informado', consentimento, ciente_contemplacao: ciente,
      website, atribuicao: getAtribuicao(),
    }
    const assinatura = JSON.stringify(payload)
    if (tentativa.current?.assinatura !== assinatura) {
      tentativa.current = { assinatura, id: crypto.randomUUID() }
    }
    const requestId = tentativa.current.id
    const validacao = validarPlanejamento({ ...payload, request_id: requestId })
    if (!validacao.ok) {
      setErro(validacao.error)
      medir('planejamento_erro', { etapa: 2, motivo: 'validacao' })
      return
    }

    bloqueado.current = true
    setSalvando(true)
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 20000)
    try {
      const resposta = await fetch('/api/planejamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, request_id: requestId }),
        signal: controller.signal,
      })
      const resultado = await resposta.json()
      if (!resposta.ok || resultado.success !== true || resultado.id !== requestId) {
        medir('planejamento_erro', { etapa: 2, motivo: 'envio' })
        setErro(typeof resultado.error === 'string'
          ? resultado.error
          : 'Não conseguimos confirmar o envio. Tente novamente.')
        return
      }
      const url = linkWhatsApp({ ...validacao.data, request_id: resultado.id })
      setConfirmacao({ id: resultado.id, valor, orcamento, url })
      setNome('')
      setWhatsapp('')

      // Navegar na mesma aba evita depender de popup após uma resposta assíncrona.
      // O callback dá tempo ao evento confirmado; o limite impede que analytics
      // bloqueado interrompa o atendimento. A mensagem ainda é enviada pelo usuário.
      let encaminhado = false
      const abrir = () => {
        if (encaminhado) return
        encaminhado = true
        try {
          trackEvent('whatsapp_aberto', { bem: produto, intencao, origem: 'apos_pedido_salvo' })
        } catch { /* Analytics não bloqueia a conversa. */ }
        try { window.location.assign(url) } catch { /* O link de apoio permanece visível. */ }
      }
      if (window.gtag) {
        window.setTimeout(abrir, 900)
        try {
          trackEvent('planejamento_enviado', {
            bem: produto, momento, intencao, event_id: resultado.id,
            event_callback: abrir, event_timeout: 800,
          })
        } catch { abrir() }
      } else {
        abrir()
      }
    } catch {
      medir('planejamento_erro', { etapa: 2, motivo: 'conexao' })
      setErro('Não conseguimos confirmar o envio. Seus dados foram mantidos; tente novamente.')
    } finally {
      window.clearTimeout(timeout)
      bloqueado.current = false
      setSalvando(false)
    }
  }

  if (confirmacao) {
    return (
      <div className="lp-form lp-success" role="status">
        <span className="lp-success-icon"><Check aria-hidden="true" /></span>
        <p className="lp-eyebrow">PEDIDO SALVO</p>
        <h3 ref={titulo} tabIndex={-1}>Vamos para o WhatsApp.</h3>
        <p>Estamos abrindo seu atendimento com o contexto do seu plano. Revise a mensagem e envie para iniciar a conversa.</p>
        <div className="lp-summary">
          <span>Seu objetivo</span>
          <strong>{dinheiro(confirmacao.valor)} em {produto === 'carro' ? 'automóvel' : 'imóvel'}</strong>
          <small>Orçamento informado: {confirmacao.orcamento}</small>
        </div>
        <a
          className="lp-button lp-button-full" href={confirmacao.url}
          onClick={() => trackEvent('whatsapp_aberto', { bem: produto, intencao, origem: 'link_de_apoio' })}
        >
          Abrir WhatsApp <ArrowRight size={19} aria-hidden="true" />
        </a>
        <p className="lp-small">Se o WhatsApp não abriu automaticamente, use o botão acima.</p>
      </div>
    )
  }

  return (
    <form className="lp-form" onSubmit={enviar} onChange={iniciar}
      onFocusCapture={(event) => { if (event.target.matches('input, select, button')) iniciar() }}
      aria-busy={salvando} aria-describedby={erro ? 'lp-form-error' : undefined}>
      <div className="lp-form-top">
        <span className="lp-eyebrow">SIMULE SUA CONQUISTA</span>
        <span className="lp-step-count">0{etapa} / 02</span>
      </div>
      <ol className="lp-stepper" aria-label="Etapas do pedido">
        {['Seu objetivo', 'Seu contato'].map((label, index) => (
          <li key={label} aria-current={etapa === index + 1 ? 'step' : undefined} className={etapa >= index + 1 ? 'is-active' : ''}>
            <span />{label}
          </li>
        ))}
      </ol>

      {etapa === 1 && (
        <div className="lp-form-stage">
          <h3 ref={titulo} tabIndex={-1}>O que você quer conquistar?</h3>
          <p>Comece pelo valor da carta de consórcio para {produto === 'carro' ? 'o seu carro' : 'o seu imóvel'}. Sem informar seu contato nesta etapa.</p>
          <label htmlFor="credito-desejado" className="lp-field-label">Valor da carta de crédito</label>
          <div className="lp-credit-input">
            <span aria-hidden="true">R$</span>
            <input id="credito-desejado" type="text" inputMode="numeric" required
              value={creditoDigitado} maxLength={16} aria-invalid={creditoInvalido || undefined}
              aria-describedby={creditoInvalido ? 'credito-erro' : 'credito-ajuda'}
              onChange={(event) => digitarCredito(event.target.value)}
              onBlur={() => { if (!creditoInvalido) setCreditoDigitado(valor.toLocaleString('pt-BR')) }} />
          </div>
          <p className="lp-field-hint" id="credito-ajuda">Digite um valor em reais ou use a barra abaixo.</p>
          {creditoInvalido && <p className="lp-field-error" id="credito-erro" role="status">Informe de {dinheiro(config.min)} a {dinheiro(config.max)}, sem centavos.</p>}
          <input
            aria-label="Ajustar o valor da carta" className="lp-range" type="range"
            min={config.min} max={config.max} step={1} value={valor}
            onChange={(event) => escolherCredito(Number(event.target.value))}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
              event.preventDefault()
              escolherCredito(Math.min(config.max, Math.max(config.min, valor + (event.key === 'ArrowRight' ? config.passo : -config.passo))))
            }}
            aria-valuetext={dinheiro(valor)}
          />
          <div className="lp-range-labels"><span>{dinheiro(config.min)}</span><span>{dinheiro(config.max)}</span></div>
          <div className="lp-presets" aria-label="Sugestões de crédito">
            {config.presets.map((preset) => (
              <button key={preset} type="button" aria-pressed={!creditoInvalido && valor === preset} onClick={() => escolherCredito(preset)}>{dinheiro(preset)}</button>
            ))}
          </div>
          <label className="lp-embedded-toggle">
            <input type="checkbox" checked={embutido} onChange={(event) => setEmbutido(event.target.checked)} aria-controls="exemplo-lance" />
            <span><strong>Ver exemplo com lance embutido de 25%</strong><small>Opcional · usar parte da própria carta no lance</small></span>
          </label>
          {embutido && !creditoInvalido && (
            <div id="exemplo-lance" className={'lp-credit-result' + (embutido ? ' has-bid' : '')}>
              <div className="lp-result-heading"><span>{embutido ? 'SE O LANCE DO EXEMPLO VENCER' : 'SEU PONTO DE PARTIDA'}</span><ArrowUpRight size={18} aria-hidden="true" /></div>
              {embutido && <div className="lp-result-deduction"><span>Lance com 25% da carta</span><strong>− {dinheiro(exemplo.lance)}</strong></div>}
              <div className="lp-result-net"><span>{embutido ? 'Crédito restante para a compra' : 'Crédito para planejar sua compra'}</span><output htmlFor="credito-desejado">{dinheiro(exemplo.creditoParaCompra)}</output></div>
              <div className="lp-credit-bar" aria-hidden="true"><span style={{ width: embutido ? '75%' : '100%' }} /><i /></div>
              <p>{embutido ? 'Esse lance sai da carta, sem usar reserva própria para essa parte. A utilização de 25% depende das regras do grupo e reduz o crédito para a compra.' : 'Uso do crédito após a contemplação e o cumprimento das condições do contrato.'}</p>
              {embutido && <details className="lp-result-details"><summary>O que este exemplo considera <ChevronDown size={14} aria-hidden="true" /></summary><p>É uma conta ilustrativa sobre o valor da carta. Não prevê a chance ou a data de contemplação, nem calcula parcelas, taxas ou reajustes. A base para classificar o lance pode incluir encargos e ser diferente do valor da carta. Confirme as condições do grupo no atendimento.</p></details>}
            </div>
          )}
          <fieldset className="lp-intent-options">
            <legend className="lp-field-label">Como podemos ajudar você? <span>(obrigatório)</span></legend>
            {Object.entries(ATENDIMENTOS).map(([key, label]) => (
              <label key={key} className={intencao === key ? 'is-selected' : ''}>
                <input type="radio" name="intencao" value={key} checked={intencao === key} required onChange={() => setIntencao(key)} />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>
          <p className="lp-note">Consórcio tem taxa de administração e pode ter outros custos e reajustes. Parcelas e condições serão apresentadas no WhatsApp. Contemplação por sorteios ou lances, sem data garantida.</p>
        </div>
      )}

      {etapa === 2 && (
        <div className="lp-form-stage">
          <h3 ref={titulo} tabIndex={-1}>{intencao === 'avaliar_plano' ? 'Vamos conversar sobre seu plano.' : 'Vamos esclarecer suas dúvidas.'}</h3>
          <p>Falta seu contato e o que precisamos para orientar você. Os campos desta etapa são obrigatórios.</p>
          <div className="lp-plan-review"><span>{produto === 'carro' ? 'Automóvel' : 'Imóvel'} · carta de {dinheiro(valor)}</span>{embutido && <small>Exemplo de lance: {dinheiro(exemplo.lance)} · restariam {dinheiro(exemplo.creditoParaCompra)} para comprar.</small>}<button type="button" className="lp-text-link" disabled={salvando} onClick={() => { setErro(''); setEtapa(1) }}>Editar objetivo</button></div>
          <div className="lp-contact-grid">
            <div>
              <label className="lp-field-label" htmlFor="nome">Seu nome</label>
              <input id="nome" name="name" autoComplete="name" required minLength={2} maxLength={80} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como podemos chamar você?" disabled={salvando} />
            </div>
            <div>
              <label className="lp-field-label" htmlFor="whatsapp">WhatsApp com DDD</label>
              <input id="whatsapp" name="tel" type="tel" inputMode="tel" autoComplete="tel-national" required maxLength={20} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(11) 99999-9999" aria-describedby="whatsapp-ajuda" disabled={salvando} />
              <p className="lp-field-hint" id="whatsapp-ajuda">Usaremos este número para conversar sobre o seu plano.</p>
            </div>
          </div>
          <label className="lp-field-label" htmlFor="orcamento">Quanto cabe no seu orçamento por mês?</label>
          <select id="orcamento" required value={orcamento} onChange={(e) => setOrcamento(e.target.value)} disabled={salvando}>
            <option value="">Selecione uma faixa</option>
            {ORCAMENTOS.map((item) => <option key={item}>{item}</option>)}
          </select>
          <label className="lp-field-label" htmlFor="momento">Quando você precisa do bem?</label>
          <select id="momento" required value={momento} onChange={(e) => setMomento(e.target.value)} disabled={salvando}>
            <option value="">Selecione seu momento</option>
            {Object.entries(MOMENTOS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          {momento === 'imediato' && (
            <p className="lp-notice" role="status">Consórcio não garante a liberação imediata do crédito. Vamos esclarecer isso antes de avaliar qualquer contratação.</p>
          )}
          <div className="lp-honeypot" aria-hidden="true">
            <label htmlFor="website">Deixe este campo em branco</label>
            <input id="website" name="website" autoComplete="off" tabIndex={-1} value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
          <label className="lp-check">
            <input type="checkbox" required checked={ciente} onChange={(e) => setCiente(e.target.checked)} disabled={salvando} />
            <span>Entendo que se trata de consórcio, com contemplação por sorteios ou lances e sem data garantida.</span>
          </label>
          <label className="lp-check">
            <input type="checkbox" required checked={consentimento} onChange={(e) => setConsentimento(e.target.checked)} disabled={salvando} />
            <span>Solicito contato sobre este planejamento e li o <Link href="/privacidade" target="_blank" rel="noopener noreferrer">aviso de privacidade</Link>.</span>
          </label>
        </div>
      )}

      {erro && <p id="lp-form-error" className="lp-error" role="alert">{erro}</p>}
      <div className="lp-form-actions">
        {etapa > 1 && <button className="lp-back" type="button" disabled={salvando} onClick={() => { setErro(''); setEtapa(1) }}>Voltar</button>}
        <button type="submit" className="lp-button lp-button-full" disabled={salvando}>
          {salvando ? 'Preparando seu atendimento…' : etapa === 2 ? 'Ir para o WhatsApp' : 'Continuar com meu objetivo'}
          {!salvando && <ArrowRight size={19} aria-hidden="true" />}
        </button>
      </div>
      <p className="lp-small">{etapa === 2 ? 'Depois de salvar, abriremos o WhatsApp. Você revisa e envia a mensagem.' : 'Sem reunião obrigatória. Atendimento no WhatsApp.'}</p>
    </form>
  )
}
