-- Funcao RPC usada pelo importar.py para verificar colunas de uma tabela
-- Chamar via: supabase.rpc("get_table_columns", {"p_table": "tb_processo"})

CREATE OR REPLACE FUNCTION public.get_table_columns(p_table text)
RETURNS TABLE(column_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT column_name::text
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name   = p_table
  ORDER BY ordinal_position;
$$;
