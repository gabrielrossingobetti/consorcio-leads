import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type BemType = 'imovel' | 'carro' | 'negocio' | 'reforma'
export type StatusLead = 'novo' | 'contatado' | 'reuniao_agendada' | 'fechado' | 'perdido'

export interface Simulacao {
  id?: string
  created_at?: string
  bem: BemType
  valor: number
  parcela_consorcio: number
  parcela_financiamento: number
  total_consorcio: number
  total_financiamento: number
  economia_total: number
  prazo_meses: number
  converteu_lead: boolean
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  ja_tentou_financiar?: string
}

export interface LeadCaptacao {
  id?: string
  created_at?: string
  nome: string
  whatsapp: string
  email?: string
  bem: BemType
  valor: number
  simulacao_id?: string
  status: StatusLead
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  ja_tentou_financiar?: string
  notas?: string
}
