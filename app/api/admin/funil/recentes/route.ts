import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data } = await supabase
    .from('funnel_events')
    .select('created_at, evento, nome, whatsapp, bem, valor')
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json({ recentes: data ?? [] })
}
