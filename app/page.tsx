import LideraLanding from '@/components/landing/LideraLanding'
import LegacyLanding from '@/components/landing/LegacyLanding'

type Parametros = Record<string, string | string[] | undefined>

export default async function Page({ searchParams }: { searchParams: Promise<Parametros> }) {
  const params = await searchParams
  if (params.produto === 'negocio') return <LegacyLanding />
  const produto = params.produto === 'imovel' ? 'imovel' : 'carro'
  return <LideraLanding key={produto} produtoInicial={produto} origemCarta={params.porta === 'carta'} />
}
