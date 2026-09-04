import type { BemType } from './calculos'

/**
 * O acervo visual do sonho.
 *
 * Cada produto tem faixas de valor, e cada faixa tem um conjunto de imagens que
 * formam um "tour" — elas se alternam lentamente para dar sensação de percorrer
 * o ambiente, não de olhar uma foto estática.
 *
 * A regra: o que a pessoa vê tem que corresponder ao que o dinheiro dela compra.
 * Mostrar mansão para quem simulou R$150 mil quebra a confiança na hora.
 */

export interface FaixaSonho {
  /** Valor mínimo da faixa (inclusive) */
  ate: number
  /** Como esse patamar é chamado — aparece na interface */
  etiqueta: string
  /** Sequência de imagens que compõem o tour do ambiente */
  tour: string[]
}

const U = (id: string, q = 'w=1600&q=85&fit=crop') => `https://images.unsplash.com/photo-${id}?${q}`

export const SONHOS: Record<BemType, FaixaSonho[]> = {
  imovel: [
    {
      ate: 250_000,
      etiqueta: 'Apartamento',
      tour: [
        U('1522708323590-d24dbb6b0267'), // sala de estar aconchegante
        U('1560448204-e02f11c3d0e2'),    // sala clara com sofá
        U('1502672260266-1c1ef2d93688'), // cozinha integrada
      ],
    },
    {
      ate: 600_000,
      etiqueta: 'Apartamento amplo',
      tour: [
        U('1618221195710-dd6b41faaea6'), // living amplo moderno
        U('1616486338812-3dadae4b4ace'), // sala com pé-direito alto
        U('1600585154340-be6161a56a0c'), // fachada residencial
      ],
    },
    {
      ate: Infinity,
      etiqueta: 'Casa alto padrão',
      tour: [
        U('1564013799919-ab600027ffc6'), // casa com piscina
        U('1613490493576-7fde63acd811'), // interior alto padrão
        U('1600596542815-ffad4c1539a9'), // casa moderna externa
      ],
    },
  ],
  carro: [
    {
      ate: 80_000,
      etiqueta: 'Hatch / Sedan',
      tour: [
        U('1549317661-bd32c8ce0db2'), // sedan prata
        U('1552519507-da3b142c6e3d'),  // carro em movimento
        U('1503736334956-4c8f8e92946d'), // interior de carro
      ],
    },
    {
      ate: 180_000,
      etiqueta: 'SUV / Picape',
      tour: [
        U('1616422285623-13ff0162193c'), // SUV moderna
        U('1533473359331-0135ef1b58bf'),  // picape
        U('1449965408869-eaa3f722e40d'),  // painel/interior
      ],
    },
    {
      ate: Infinity,
      etiqueta: 'Premium',
      tour: [
        U('1503376780353-7e6692767b70'), // esportivo
        U('1544636331-e26879cd4d9b'),    // premium frontal
        U('1502877338535-766e1452684a'), // premium em estrada
      ],
    },
  ],
  negocio: [
    {
      ate: 200_000,
      etiqueta: 'Ponto comercial',
      tour: [
        U('1497366216548-37526070297c'), // escritório pequeno
        U('1521737604893-d14cc237f11d'), // equipe trabalhando
        U('1556740738-b6a63e27c4df'),    // ambiente comercial
      ],
    },
    {
      ate: Infinity,
      etiqueta: 'Estrutura completa',
      tour: [
        U('1486325212027-8081e485255e'), // prédio corporativo
        U('1497215728101-856f4ea42174'), // escritório amplo
        U('1604328698692-f76ea9498e76'), // galpão/estrutura
      ],
    },
  ],
  reforma: [
    {
      ate: Infinity,
      etiqueta: 'Reforma',
      tour: [U('1503387762-592deb58ef4e'), U('1600585154340-be6161a56a0c')],
    },
  ],
  investidor: [
    {
      ate: Infinity,
      etiqueta: 'Investimento',
      tour: [U('1486406146926-c627a92ad1ab'), U('1611974789855-9c2a0a7236a3')],
    },
  ],
}

/** Devolve a faixa de sonho correspondente ao valor simulado. */
export function faixaPara(bem: BemType, valor: number): FaixaSonho {
  const faixas = SONHOS[bem] ?? SONHOS.imovel
  return faixas.find((f) => valor <= f.ate) ?? faixas[faixas.length - 1]
}
