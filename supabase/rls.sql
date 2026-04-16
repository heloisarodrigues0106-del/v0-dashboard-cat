-- =============================================================================
-- ROW LEVEL SECURITY (RLS) — Dashboard CAT
-- Executar no painel do Supabase: SQL Editor
-- Política: qualquer usuário autenticado pode ler todos os dados
-- (sistema de empresa única — Caterpillar/Martinelli)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- tb_processo
-- -----------------------------------------------------------------------------
ALTER TABLE tb_processo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Autenticados podem ler processos" ON tb_processo;
CREATE POLICY "Autenticados podem ler processos"
  ON tb_processo
  FOR SELECT
  TO authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- tb_pedidos_inicial
-- -----------------------------------------------------------------------------
ALTER TABLE tb_pedidos_inicial ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Autenticados podem ler pedidos inicial" ON tb_pedidos_inicial;
CREATE POLICY "Autenticados podem ler pedidos inicial"
  ON tb_pedidos_inicial
  FOR SELECT
  TO authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- tb_pedidos_sentenca
-- -----------------------------------------------------------------------------
ALTER TABLE tb_pedidos_sentenca ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Autenticados podem ler pedidos sentenca" ON tb_pedidos_sentenca;
CREATE POLICY "Autenticados podem ler pedidos sentenca"
  ON tb_pedidos_sentenca
  FOR SELECT
  TO authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- tb_pedidos_acordao
-- -----------------------------------------------------------------------------
ALTER TABLE tb_pedidos_acordao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Autenticados podem ler pedidos acordao" ON tb_pedidos_acordao;
CREATE POLICY "Autenticados podem ler pedidos acordao"
  ON tb_pedidos_acordao
  FOR SELECT
  TO authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- tb_laudo
-- -----------------------------------------------------------------------------
ALTER TABLE tb_laudo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Autenticados podem ler laudos" ON tb_laudo;
CREATE POLICY "Autenticados podem ler laudos"
  ON tb_laudo
  FOR SELECT
  TO authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- tb_valores
-- -----------------------------------------------------------------------------
ALTER TABLE tb_valores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Autenticados podem ler valores" ON tb_valores;
CREATE POLICY "Autenticados podem ler valores"
  ON tb_valores
  FOR SELECT
  TO authenticated
  USING (true);

-- =============================================================================
-- IMPORTANTE: O dashboard usa SERVICE_ROLE_KEY no servidor, que bypassa RLS.
-- Para que o RLS tenha efeito no acesso direto (ex: Supabase Studio ou APIs
-- usando a ANON_KEY), essas políticas são necessárias.
-- Para remover o bypass, troque createServerSupabaseClient() para usar
-- a ANON_KEY com createServerClient() do @supabase/ssr (requer RLS ativo).
-- =============================================================================
