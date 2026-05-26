-- Execute este SQL no Supabase SQL Editor
-- Acesse: https://supabase.com → seu projeto → SQL Editor

-- Tabela de simulações (tudo que foi calculado, mesmo sem virar lead)
CREATE TABLE IF NOT EXISTS simulacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  bem TEXT NOT NULL CHECK (bem IN ('imovel', 'carro', 'negocio', 'reforma')),
  valor NUMERIC NOT NULL,
  parcela_consorcio NUMERIC NOT NULL,
  parcela_financiamento NUMERIC NOT NULL,
  total_consorcio NUMERIC NOT NULL,
  total_financiamento NUMERIC NOT NULL,
  economia_total NUMERIC NOT NULL,
  prazo_meses INTEGER NOT NULL,
  converteu_lead BOOLEAN DEFAULT FALSE,
  ja_tentou_financiar TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT
);

-- Tabela de leads (quem preencheu nome + WhatsApp)
CREATE TABLE IF NOT EXISTS leads_captacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  bem TEXT NOT NULL CHECK (bem IN ('imovel', 'carro', 'negocio', 'reforma')),
  valor NUMERIC,
  simulacao_id UUID REFERENCES simulacoes(id),
  status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'reuniao_agendada', 'fechado', 'perdido')),
  ja_tentou_financiar TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  notas TEXT
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads_captacao(status);
CREATE INDEX IF NOT EXISTS idx_leads_bem ON leads_captacao(bem);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads_captacao(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_simulacoes_bem ON simulacoes(bem);
CREATE INDEX IF NOT EXISTS idx_simulacoes_converteu ON simulacoes(converteu_lead);

-- Habilitar Row Level Security
ALTER TABLE simulacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads_captacao ENABLE ROW LEVEL SECURITY;

-- Política: permite inserção pública (necessário para a API funcionar com anon key)
CREATE POLICY "Permitir insercao publica simulacoes"
  ON simulacoes FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Permitir update simulacoes"
  ON simulacoes FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Permitir insercao publica leads"
  ON leads_captacao FOR INSERT
  TO anon
  WITH CHECK (true);
