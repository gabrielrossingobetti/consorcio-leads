export type BemType = 'imovel' | 'carro' | 'negocio' | 'reforma' | 'investidor'

interface ConfigBem {
  label: string
  taxaFinanciamentoMensal: number  // % ao mês (taxa real praticada)
  prazoFinanciamentoMeses: number  // prazo real do financiamento
  taxaAdminConsorcio: number       // % total sobre o crédito
  prazoConsorcioMeses: number      // prazo do consórcio
  taxaParcelaCheia?: number        // % da carta por mês (taxa real Ademicon, até contemplação)
}

export const CONFIG_BENS: Record<BemType, ConfigBem> = {
  imovel: {
    label: 'Imóvel',
    taxaFinanciamentoMensal: 1.1,      // 1,1% a.m. — taxa nominal + MIP/DFI + taxa adm. (≈R$1.100 a cada R$100k)
    prazoFinanciamentoMeses: 360,      // 30 anos
    taxaAdminConsorcio: 24,            // 24% total Ademicon
    prazoConsorcioMeses: 225,          // ~18 anos
    taxaParcelaCheia: 0.0056,          // PARCELA CHEIA: R$560 a cada R$100k (taxa real Ademicon)
  },
  carro: {
    label: 'Veículo',
    taxaFinanciamentoMensal: 2.0,      // 2% a.m. — taxa real praticada em financiamento de veículo
    prazoFinanciamentoMeses: 60,       // 5 anos
    taxaAdminConsorcio: 16,            // 16% total Ademicon
    prazoConsorcioMeses: 90,           // 7,5 anos
    taxaParcelaCheia: 0.0129,          // PARCELA CHEIA: R$1.290 a cada R$100k (taxa real Ademicon)
  },
  negocio: {
    label: 'Negócio/Empresa',
    taxaFinanciamentoMensal: 2.0,
    prazoFinanciamentoMeses: 60,
    taxaAdminConsorcio: 24,
    prazoConsorcioMeses: 60,
  },
  reforma: {
    label: 'Reforma/Construção',
    taxaFinanciamentoMensal: 1.0,
    prazoFinanciamentoMeses: 120,
    taxaAdminConsorcio: 24,
    prazoConsorcioMeses: 100,
  },
  investidor: {
    label: 'Investimento',
    taxaFinanciamentoMensal: 0,
    prazoFinanciamentoMeses: 0,
    taxaAdminConsorcio: 0,
    prazoConsorcioMeses: 0,
  },
}

export interface ResultadoCalculo {
  bem: BemType
  valor: number
  prazoFinanciamentoMeses: number
  prazoConsorcioMeses: number
  // Financiamento
  parcelaFinanciamento: number
  totalFinanciamento: number
  jurosFinanciamento: number
  // Consórcio
  parcelaConsorcio: number
  parcelaReduzida: number
  totalConsorcio: number
  taxaAdminTotal: number
  // Comparativo
  economiaMensal: number
  economiaTotal: number
  percentualEconomia: number
  tempoMedioContemplacao: string
}

function calcularParcelaMensal(valor: number, taxaMensal: number, meses: number): number {
  if (taxaMensal === 0) return valor / meses
  const t = taxaMensal / 100
  return (valor * t * Math.pow(1 + t, meses)) / (Math.pow(1 + t, meses) - 1)
}

export function calcular(bem: BemType, valor: number): ResultadoCalculo {
  const config = CONFIG_BENS[bem]
  const {
    taxaFinanciamentoMensal,
    prazoFinanciamentoMeses,
    taxaAdminConsorcio,
    prazoConsorcioMeses,
    taxaParcelaCheia,
  } = config

  // Financiamento
  const parcelaFinanciamento = calcularParcelaMensal(valor, taxaFinanciamentoMensal, prazoFinanciamentoMeses)
  const totalFinanciamento = parcelaFinanciamento * prazoFinanciamentoMeses
  const jurosFinanciamento = totalFinanciamento - valor

  // Consórcio Ademicon
  const taxaAdminTotal = valor * (taxaAdminConsorcio / 100)
  // Parcela CHEIA — é esta que a LP exibe. A reduzida fica como margem de negociação na reunião.
  const parcelaConsorcio = taxaParcelaCheia
    ? valor * taxaParcelaCheia
    : (valor + taxaAdminTotal) / prazoConsorcioMeses
  // Total contratual = crédito + taxa administrativa (24% imóvel / 16% veículo).
  // É este o número que bate com o contrato e com o que o consultor apresenta.
  const totalConsorcio = valor + taxaAdminTotal
  // Parcela reduzida — uso interno do consultor, NUNCA exibida na landing page
  const TAXA_REDUZIDA: Partial<Record<BemType, number>> = { imovel: 0.00337, carro: 0.0073 }
  const parcelaReduzida = valor * (TAXA_REDUZIDA[bem] ?? parcelaConsorcio / valor)

  // Comparativo
  const economiaMensal = parcelaFinanciamento - parcelaConsorcio
  const economiaTotal = totalFinanciamento - totalConsorcio
  const percentualEconomia = (economiaTotal / totalFinanciamento) * 100

  const tempoMedioContemplacao = bem === 'imovel' ? '12 a 36 meses' : '6 a 24 meses'

  return {
    bem,
    valor,
    prazoFinanciamentoMeses,
    prazoConsorcioMeses,
    parcelaFinanciamento: Math.round(parcelaFinanciamento),
    totalFinanciamento: Math.round(totalFinanciamento),
    jurosFinanciamento: Math.round(jurosFinanciamento),
    parcelaConsorcio: Math.round(parcelaConsorcio),
    parcelaReduzida: Math.round(parcelaReduzida),
    totalConsorcio: Math.round(totalConsorcio),
    taxaAdminTotal: Math.round(taxaAdminTotal),
    economiaMensal: Math.round(economiaMensal),
    economiaTotal: Math.round(economiaTotal),
    percentualEconomia: Math.round(percentualEconomia),
    tempoMedioContemplacao,
  }
}

export interface ResultadoInvestidor {
  carta: number
  mesesEstimados: number
  lanceEmbutido: number
  cartaLiquida: number
  parcelaReduzida: number
  totalParcelasPagas: number
  valorRecebido: number
  lucroLiquido: number
  retornoPercent: number
  valorizacaoGanha: number
}

export function calcularInvestidor(carta: number, mesesEstimados: number): ResultadoInvestidor {
  const lanceEmbutido = carta * 0.25
  const cartaLiquida = carta * 0.75
  const parcelaReduzida = carta * 0.00337
  const totalParcelasPagas = parcelaReduzida * mesesEstimados
  const cartaLiquidaValorizada = cartaLiquida * Math.pow(1.005, mesesEstimados)
  const valorizacaoGanha = cartaLiquidaValorizada - cartaLiquida
  const valorRecebido = cartaLiquidaValorizada * 0.40
  const lucroLiquido = valorRecebido - totalParcelasPagas

  return {
    carta,
    mesesEstimados,
    lanceEmbutido: Math.round(lanceEmbutido),
    cartaLiquida: Math.round(cartaLiquida),
    parcelaReduzida: Math.round(parcelaReduzida),
    totalParcelasPagas: Math.round(totalParcelasPagas),
    valorRecebido: Math.round(valorRecebido),
    lucroLiquido: Math.round(lucroLiquido),
    retornoPercent: Math.round((lucroLiquido / totalParcelasPagas) * 100),
    valorizacaoGanha: Math.round(valorizacaoGanha),
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
