import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Tranca o painel de acompanhamento e a API dele.
 *
 * Estavam abertos na internet devolvendo nome e WhatsApp de todo mundo que
 * passou pelo funil — bastava saber a URL. Como é uso pessoal do consultor,
 * uma chave por link resolve sem inventar login.
 *
 * Uso: /admin/funil?chave=SUA_CHAVE — depois disso o cookie mantém a sessão
 * aberta por 30 dias no aparelho, então não precisa repetir a chave.
 */
const COOKIE = 'painel_ok'

export function proxy(request: NextRequest) {
  const chaveCerta = process.env.ADMIN_KEY
  // Sem chave configurada, tranca tudo em vez de abrir: falha para o lado seguro.
  if (!chaveCerta) return new NextResponse('Painel indisponível', { status: 503 })

  if (request.cookies.get(COOKIE)?.value === chaveCerta) return NextResponse.next()

  const chaveDada = request.nextUrl.searchParams.get('chave')
  if (chaveDada === chaveCerta) {
    const res = NextResponse.next()
    res.cookies.set(COOKIE, chaveCerta, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
    return res
  }

  return new NextResponse('Não autorizado', { status: 401 })
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
