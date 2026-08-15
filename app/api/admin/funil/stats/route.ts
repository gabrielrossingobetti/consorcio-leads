import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const since = new Date()
  since.setDate(since.getDate() - 30)

  const { data } = await supabase
    .from('funnel_events')
    .select('evento')
    .gte('created_at', since.toISOString())

  const map: Record<string, number> = {}
  for (const row of data ?? []) {
    map[row.evento] = (map[row.evento] ?? 0) + 1
  }

  const counts = Object.entries(map).map(([evento, count]) => ({ evento, count }))
  return NextResponse.json({ counts })
}
