import type { Metadata } from 'next'
import LideraLanding from '@/components/landing/LideraLanding'

export const metadata: Metadata = {
  title: 'Consórcio de imóvel | Planeje seu próximo endereço | Lidera',
  description: 'Planeje a compra do seu imóvel com consórcio. Informe seu objetivo, orçamento e momento de compra para receber orientação sem compromisso.',
  alternates: { canonical: '/consorcio-imovel' },
}

export default async function Page({
  searchParams,
}: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  return <LideraLanding key="imovel" produtoInicial="imovel" origemCarta={params.porta === 'carta'} />
}
