'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { getAtribuicao } from '@/lib/atribuicao'
import { trackEvent } from '@/lib/gtag'
import {
  ATENDIMENTOS, MOMENTOS, ORCAMENTOS, PRODUTOS_PLANO,
  linkWhatsApp, validarPlanejamento, type ProdutoPlano,
} from '@/lib/planejamento.mjs'

const dinheiro = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

type Confirmacao = { id: string; valor: number; orcamento: string; url: string }

export default function PlanoForm({ produto }: { produto: ProdutoPlano }) {
  const config = PRODUTOS_PLANO[produto]
  const [etapa, setEtapa] = useState(1)
  const [valor, setValor] = useState(config.inicial)
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
  const bloqueado = useRef(false)
  const tentativa = useRef<{ assinatura: string; id: string } | null>(null)

  useEffect(() => { getAtribuicao() }, [])
  useEffect(() => {
    if (etapa > 1 || confirmacao) titulo.current?.focus({ preventScroll: true })
  }, [etapa, confirmacao])

  function continuar() {
    setErro('')
    if (!intencao) { setErro('Escolha como podemos ajudar no WhatsApp.'); return }
    setEtapa(2)
  }

  async function enviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (etapa === 1) { continuar(); return }
    if (bloqueado.current) return
    setErro('')
    const payload = {
      nome, whatsapp, bem: produto, valor, orcamento, momento, intencao,
      lance: 'nao_informado', consentimento, ciente_contemplacao: ciente,
      website, atribuicao: getAtribuicao(),
    }
    const assinatura = JSON.stringify(payload)
    if (tentativa.current?.assinatura !== assinatura) {
      tentativa.current = { assinatura, id: crypto.randomUUID() }
    }
    const requestId = tentativa.current.id
    const validacao = validarPlanejamento({ ...payload, request_id: requestId })
    if (!validacao.ok) { setErro(validacao.error); return }

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
      if (!resposta.ok || resultado.success !== true || typeof resultado.id !== 'string') {
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
    <form className="lp-form" onSubmit={enviar} aria-busy={salvando} aria-describedby={erro ? 'lp-form-error' : undefined}>
      <div className="lp-form-top">
        <span className="lp-eyebrow">SEU PLANO, PELO WHATSAPP</span>
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
          <p>Escolha o crédito desejado para {produto === 'carro' ? 'o seu carro' : 'o seu imóvel'} e conte como podemos ajudar.</p>
          <label htmlFor="credito-desejado" className="lp-field-label">Crédito desejado</label>
          <output className="lp-credit" htmlFor="credito-desejado">{dinheiro(valor)}</output>
          <input
            id="credito-desejado" className="lp-range" type="range"
            min={config.min} max={config.max} step={config.passo} value={valor}
            onChange={(event) => setValor(Number(event.target.value))}
            aria-valuetext={dinheiro(valor)}
          />
          <div className="lp-range-labels"><span>{dinheiro(config.min)}</span><span>{dinheiro(config.max)}</span></div>
          <div className="lp-presets" aria-label="Sugestões de crédito">
            {config.presets.map((preset) => (
              <button key={preset} type="button" aria-pressed={valor === preset} onClick={() => setValor(preset)}>{dinheiro(preset)}</button>
            ))}
          </div>
          <fieldset className="lp-intent-options">
            <legend className="lp-field-label">Como podemos ajudar você?</legend>
            {Object.entries(ATENDIMENTOS).map(([key, label]) => (
              <label key={key} className={intencao === key ? 'is-selected' : ''}>
                <input type="radio" name="intencao" value={key} checked={intencao === key} required onChange={() => setIntencao(key)} />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>
          <p className="lp-note">O crédito selecionado é um objetivo de compra. Parcelas, taxas e condições serão apresentadas no atendimento, conforme o plano disponível.</p>
        </div>
      )}

      {etapa === 2 && (
        <div className="lp-form-stage">
          <h3 ref={titulo} tabIndex={-1}>{intencao === 'avaliar_plano' ? 'Vamos conversar sobre seu plano.' : 'Vamos esclarecer suas dúvidas.'}</h3>
          <p>Deixe seu contato e duas informações para começar a conversa com mais contexto.</p>
          <div className="lp-contact-grid">
            <div>
              <label className="lp-field-label" htmlFor="nome">Seu nome</label>
              <input id="nome" name="name" autoComplete="name" required minLength={2} maxLength={80} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como podemos chamar você?" disabled={salvando} />
            </div>
            <div>
              <label className="lp-field-label" htmlFor="whatsapp">WhatsApp com DDD</label>
              <input id="whatsapp" name="tel" type="tel" inputMode="tel" autoComplete="tel-national" required maxLength={20} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(11) 99999-9999" disabled={salvando} />
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
            <span>Entendo que se trata de consórcio, com contemplação por sorteio ou lance e sem data garantida.</span>
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
          {salvando ? 'Preparando seu atendimento…' : etapa === 2 ? 'Ir para o WhatsApp' : 'Continuar'}
          {!salvando && <ArrowRight size={19} aria-hidden="true" />}
        </button>
      </div>
      <p className="lp-small">{etapa === 2 ? 'Depois de salvar, abriremos o WhatsApp. Você revisa e envia a mensagem.' : 'Sem reunião obrigatória. Atendimento no WhatsApp.'}</p>
    </form>
  )
}
