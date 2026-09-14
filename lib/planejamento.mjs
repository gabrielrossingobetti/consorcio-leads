/**
 * Dados declarados pelo visitante. Nenhuma destas respostas, sozinha,
 * classifica o contato como qualificado ou calcula uma parcela comercial.
 *
 * @typedef {'carro' | 'imovel'} ProdutoPlano
 * @typedef {{
 *   request_id: string, nome: string, whatsapp: string, bem: ProdutoPlano,
 *   valor: number, orcamento: string, momento: string, lance: string, intencao: string,
 *   consentimento: true, ciente_contemplacao: true,
 *   atribuicao: Record<string, string>
 * }} Planejamento
 */

export const PRODUTOS_PLANO = {
  carro: { min: 30000, max: 400000, passo: 5000, inicial: 100000, presets: [60000, 100000, 180000] },
  imovel: { min: 80000, max: 1500000, passo: 10000, inicial: 400000, presets: [200000, 400000, 800000] },
};

export const ATENDIMENTOS = {
  avaliar_plano: 'Já conheço consórcio e quero avaliar um plano',
  entender_consorcio: 'Quero entender como o consórcio funciona',
};

export const ORCAMENTOS = [
  'Até R$ 800', 'R$ 801 a R$ 1.500', 'R$ 1.501 a R$ 2.500',
  'R$ 2.501 a R$ 4.000', 'Acima de R$ 4.000', 'Quero orientação',
];

export const MOMENTOS = {
  flexivel: 'Posso me planejar, sem data garantida',
  lance: 'Quero avaliar a possibilidade de lance',
  imediato: 'Preciso do bem imediatamente',
};

export const LANCES = {
  nao_informado: 'Reserva não informada no site',
  sem_reserva: 'Ainda não tenho uma reserva',
  ate_20: 'Tenho até 20% do crédito desejado',
  acima_20: 'Tenho mais de 20% do crédito desejado',
  avaliar: 'Prefiro avaliar com o consultor',
};

export const ATRIBUICAO_KEYS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'gclid', 'wbraid', 'gbraid', 'gad_campaignid',
];

export const PRIVACIDADE_VERSAO = '2026-09-14';

/** @param {unknown} value */
function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * @param {unknown} input
 * @returns {{ok: true, data: Planejamento} | {ok: false, error: string}}
 */
export function validarPlanejamento(input) {
  if (!isRecord(input)) return { ok: false, error: 'Pedido inválido.' };
  const body = /** @type {Record<string, unknown>} */ (input);
  if (body.website) return { ok: false, error: 'Não foi possível enviar este pedido.' };
  if (typeof body.request_id !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.request_id)) {
    return { ok: false, error: 'Atualize a página e tente novamente.' };
  }
  const nome = typeof body.nome === 'string' ? body.nome.trim().replace(/\s+/g, ' ') : '';
  if (nome.length < 2 || nome.length > 80 || /[<>\u0000-\u001f]/.test(nome)) {
    return { ok: false, error: 'Informe seu nome, com 2 a 80 caracteres.' };
  }
  let whatsapp = typeof body.whatsapp === 'string' ? body.whatsapp.replace(/\D/g, '') : '';
  if (whatsapp.length === 13 && whatsapp.startsWith('55')) whatsapp = whatsapp.slice(2);
  if (!/^[1-9]{2}9\d{8}$/.test(whatsapp) || /^(\d)\1+$/.test(whatsapp)) {
    return { ok: false, error: 'Informe um celular brasileiro com DDD e 9 dígitos.' };
  }
  if (body.bem !== 'carro' && body.bem !== 'imovel') {
    return { ok: false, error: 'Selecione automóvel ou imóvel.' };
  }
  const produto = PRODUTOS_PLANO[body.bem];
  if (typeof body.valor !== 'number' || !Number.isFinite(body.valor) ||
      body.valor < produto.min || body.valor > produto.max) {
    return { ok: false, error: 'Revise o valor do crédito desejado.' };
  }
  if (typeof body.orcamento !== 'string' || !ORCAMENTOS.includes(body.orcamento) ||
      typeof body.momento !== 'string' || !Object.hasOwn(MOMENTOS, body.momento) ||
      typeof body.lance !== 'string' || !Object.hasOwn(LANCES, body.lance)) {
    return { ok: false, error: 'Conte seu orçamento, momento de compra e reserva para lance.' };
  }
  if (typeof body.intencao !== 'string' || !Object.hasOwn(ATENDIMENTOS, body.intencao)) {
    return { ok: false, error: 'Escolha como podemos ajudar no WhatsApp.' };
  }
  if (body.consentimento !== true || body.ciente_contemplacao !== true) {
    return { ok: false, error: 'Confirme o pedido de contato e a ciência sobre a contemplação.' };
  }
  /** @type {Record<string, string>} */
  const atribuicao = {};
  if (isRecord(body.atribuicao)) {
    const origem = /** @type {Record<string, unknown>} */ (body.atribuicao);
    for (const key of ATRIBUICAO_KEYS) {
      if (typeof origem[key] === 'string') {
        const value = origem[key].replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 500);
        if (value) atribuicao[key] = value;
      }
    }
  }
  return { ok: true, data: {
    request_id: body.request_id.toLowerCase(), nome, whatsapp, bem: body.bem,
    valor: body.valor, orcamento: body.orcamento, momento: body.momento,
    lance: body.lance, intencao: body.intencao, consentimento: true, ciente_contemplacao: true, atribuicao,
  } };
}

/** @param {Planejamento} data */
export function notasPlanejamento(data) {
  return JSON.stringify({
    versao: 1, origem: 'landing-v2', orcamento: data.orcamento,
    momento: data.momento, lance: data.lance, intencao: data.intencao,
    consentimento: data.consentimento,
    ciente_contemplacao: data.ciente_contemplacao,
    privacidade_versao: PRIVACIDADE_VERSAO,
    atribuicao: data.atribuicao,
  });
}

/** @param {string} search */
export function lerAtribuicao(search) {
  const params = new URLSearchParams(search);
  /** @type {Record<string, string>} */
  const result = {};
  for (const key of ATRIBUICAO_KEYS) {
    const value = params.get(key);
    if (value) result[key] = value.replace(/[\u0000-\u001f<>]/g, '').slice(0, 500);
  }
  return result;
}

/**
 * Mensagem contextual para o mesmo atendimento, sem nome, telefone ou
 * identificadores de anúncio na URL externa.
 * @param {Pick<Planejamento, 'bem' | 'valor' | 'orcamento' | 'momento' | 'intencao' | 'request_id'>} data
 */
export function linkWhatsApp(data) {
  const entrada = data.intencao === 'avaliar_plano'
    ? 'Olá! Já conheço consórcio e quero avaliar um plano para contratar.'
    : 'Olá! Quero entender como funciona o consórcio e se faz sentido para mim.';
  const valor = data.valor.toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL', maximumFractionDigits: 0,
  });
  const mensagem = [
    entrada,
    'Produto: ' + (data.bem === 'carro' ? 'automóvel' : 'imóvel') + '.',
    'Crédito desejado: ' + valor + '.',
    'Orçamento mensal: ' + data.orcamento + '.',
    'Momento: ' + MOMENTOS[/** @type {keyof typeof MOMENTOS} */ (data.momento)] + '.',
    'Sei que a contemplação depende de sorteio ou lance, sem data garantida.',
    'Protocolo: ' + data.request_id,
  ].join('\n');
  return 'https://wa.me/5511993929660?text=' + encodeURIComponent(mensagem);
}
