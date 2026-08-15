import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    await supabase.from('fichas_cadastrais').insert(body)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Ficha error:', err)
    return NextResponse.json({ error: 'Erro ao salvar ficha' }, { status: 500 })
  }
}
