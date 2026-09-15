import type { Metadata } from 'next'
import LideraLanding from '@/components/landing/LideraLanding'

export const metadata: Metadata = {
  title: 'Consórcio de automóvel | Planeje seu próximo carro | Lidera',
  description: 'Planeje a compra do seu automóvel com consórcio. Informe seu objetivo, orçamento e momento de compra para receber orientação sem compromisso.',
  alternates: { canonical: '/consorcio-veiculo' },
}

export default async function Page({
  searchParams,
}: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  return <LideraLanding key="carro" produtoInicial="carro" origemCarta={params.porta === 'carta'} />
}
