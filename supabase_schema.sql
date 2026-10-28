-- ============================================================================
-- Script de Criação das Tabelas (Usuários e Avaliações) no Supabase
-- Copie e cole este código no "SQL Editor" do painel do Supabase e clique em "Run"
-- ============================================================================

-- 1. Tabela de Usuários (Login por SISDMID, Hierarquia de Cargos e Campanhas)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sisdmid TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Coordenador',
  role_type TEXT NOT NULL DEFAULT 'Coordenador',
  campaign TEXT,
  states TEXT[],
  activities TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Caso a tabela já tenha sido criada anteriormente, garante as novas colunas:
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role_type TEXT NOT NULL DEFAULT 'Coordenador';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS campaign TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS states TEXT[];
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS activities TEXT[];

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura de usuários para login" ON public.users;
CREATE POLICY "Permitir leitura de usuários para login"
  ON public.users
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir criação de usuários" ON public.users;
CREATE POLICY "Permitir criação de usuários"
  ON public.users
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização de usuários" ON public.users;
CREATE POLICY "Permitir atualização de usuários"
  ON public.users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir exclusão de usuários" ON public.users;
CREATE POLICY "Permitir exclusão de usuários"
  ON public.users
  FOR DELETE
  USING (true);

-- Conta Admin Master: Pedro Cruz (SISDMID: 135126 | Senha: 04052006)
INSERT INTO public.users (sisdmid, password, name, role, role_type, campaign)
VALUES ('135126', '04052006', 'Pedro Cruz', 'Admin Master', 'Admin Master', NULL)
ON CONFLICT (sisdmid) DO UPDATE
SET password = EXCLUDED.password,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    role_type = EXCLUDED.role_type,
    campaign = EXCLUDED.campaign;

-- 2. Tabela de Avaliações (Corrections)
CREATE TABLE IF NOT EXISTS public.corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign TEXT NOT NULL,
  activity TEXT NOT NULL,
  castle_name TEXT NOT NULL,
  castle_number INTEGER NOT NULL,
  state TEXT NOT NULL,
  score NUMERIC(4, 1) NOT NULL CHECK (score >= 0 AND score <= 10),
  status TEXT NOT NULL CHECK (status IN ('Aprovada', 'Recusada', 'Devolvida', 'Aguardando Revisão')),
  evaluator_notes TEXT,
  assigned_to TEXT,
  assigned_to_name TEXT,
  created_at DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT NOT NULL DEFAULT 'Pedro Cruz'
);

-- Caso a tabela já tenha sido criada anteriormente, garante as colunas de atribuição:
ALTER TABLE public.corrections ADD COLUMN IF NOT EXISTS assigned_to TEXT;
ALTER TABLE public.corrections ADD COLUMN IF NOT EXISTS assigned_to_name TEXT;

ALTER TABLE public.corrections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura pública de correções" ON public.corrections;
CREATE POLICY "Permitir leitura pública de correções"
  ON public.corrections
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir inserção de correções" ON public.corrections;
CREATE POLICY "Permitir inserção de correções"
  ON public.corrections
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização de correções" ON public.corrections;
CREATE POLICY "Permitir atualização de correções"
  ON public.corrections
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir exclusão de correções" ON public.corrections;
CREATE POLICY "Permitir exclusão de correções"
  ON public.corrections
  FOR DELETE
  USING (true);
