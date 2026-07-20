export type BemType = 'imovel' | 'carro' | 'negocio' | 'reforma' | 'investidor'

interface ConfigBem {
  label: string
  taxaFinanciamentoAnual: number  // % ao ano
  taxaAdminConsorcio: number      // % total sobre o crédito
  prazoMeses: number
  prazoLabel: string
}

export const CONFIG_BENS: Record<BemType, ConfigBem> = {
  imovel: {
    label: 'Imóvel',
    taxaFinanciamentoAnual: 10.5,
    taxaAdminConsorcio: 12,
    prazoMeses: 200,
    prazoLabel: '200 meses (~16 anos)',
  },
  carro: {
    label: 'Veículo',
    taxaFinanciamentoAnual: 18,
    taxaAdminConsorcio: 16.1,
    prazoMeses: 90,
    prazoLabel: '90 meses (7,5 anos)',
  },
  negocio: {
    label: 'Negócio/Empresa',
    taxaFinanciamentoAnual: 24,
    taxaAdminConsorcio: 24,
    prazoMeses: 60,
    prazoLabel: '60 meses (5 anos)',
  },
  reforma: {
    label: 'Reforma/Construção',
    taxaFinanciamentoAnual: 12,
    taxaAdminConsorcio: 24,
    prazoMeses: 100,
    prazoLabel: '100 meses (~8 anos)',
  },
  investidor: {
    label: 'Investimento',
    taxaFinanciamentoAnual: 0,
    taxaAdminConsorcio: 0,
    prazoMeses: 0,
    prazoLabel: '',
  },
}

export interface ResultadoCalculo {
  bem: BemType
  valor: number
  prazoMeses: number
  prazoLabel: string
  // Financiamento
  parcelaFinanciamento: number
  totalFinanciamento: number
  jurosFinanciamento: number
  // Consórcio
  parcelaConsorcio: number
  totalConsorcio: number
  taxaAdminTotal: number
  // Comparativo
  economiaMensal: number
  economiaTotal: number
  percentualEconomia: number
  anosAluguelEconomizados: number
  tempoMedioContemplacao: string
}

function calcularParcelaFinanciamento(valor: number, taxaAnual: number, meses: number): number {
  const taxaMensal = taxaAnual / 100 / 12
  if (taxaMensal === 0) return valor / meses
  return (valor * taxaMensal * Math.pow(1 + taxaMensal, meses)) / (Math.pow(1 + taxaMensal, meses) - 1)
}

export function calcular(bem: BemType, valor: number): ResultadoCalculo {
  const config = CONFIG_BENS[bem]
  const { prazoMeses, taxaFinanciamentoAnual, taxaAdminConsorcio } = config

  // Financiamento
  const parcelaFinanciamento = calcularParcelaFinanciamento(valor, taxaFinanciamentoAnual, prazoMeses)
  const totalFinanciamento = parcelaFinanciamento * prazoMeses
  const jurosFinanciamento = totalFinanciamento - valor

  // Consórcio Ademicon
  const taxaAdminTotal = valor * (taxaAdminConsorcio / 100)
  const totalConsorcio = valor + taxaAdminTotal
  const parcelaConsorcio = totalConsorcio / prazoMeses

  // Comparativo
  const economiaMensal = parcelaFinanciamento - parcelaConsorcio
  const economiaTotal = totalFinanciamento - totalConsorcio
  const percentualEconomia = (economiaTotal / totalFinanciamento) * 100

  // Quantos anos de aluguel médio a economia representa (aluguel médio R$1.800)
  const aluguelMedio = 1800
  const anosAluguelEconomizados = economiaTotal / (aluguelMedio * 12)

  // Tempo médio contemplação (aproximação: entre 12 e 36 meses dependendo do lance)
  const tempoMedioContemplacao = bem === 'imovel' ? '12 a 36 meses' : '6 a 24 meses'

  return {
    bem,
    valor,
    prazoMeses,
    prazoLabel: config.prazoLabel,
    parcelaFinanciamento: Math.round(parcelaFinanciamento),
    totalFinanciamento: Math.round(totalFinanciamento),
    jurosFinanciamento: Math.round(jurosFinanciamento),
    parcelaConsorcio: Math.round(parcelaConsorcio),
    totalConsorcio: Math.round(totalConsorcio),
    taxaAdminTotal: Math.round(taxaAdminTotal),
    economiaMensal: Math.round(economiaMensal),
    economiaTotal: Math.round(economiaTotal),
    percentualEconomia: Math.round(percentualEconomia),
    anosAluguelEconomizados: Math.round(anosAluguelEconomizados * 10) / 10,
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
  // Carta valoriza 6% a.a. = 0,5% ao mês
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
