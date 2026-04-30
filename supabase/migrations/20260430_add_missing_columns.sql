-- Adiciona colunas que existem nos Excels mas estavam ausentes no banco

-- tb_pedidos_sentenca
ALTER TABLE public.tb_pedidos_sentenca
  ADD COLUMN IF NOT EXISTS estabilidade boolean,
  ADD COLUMN IF NOT EXISTS ergonomia    text;

-- tb_pedidos_acordao
ALTER TABLE public.tb_pedidos_acordao
  ADD COLUMN IF NOT EXISTS estabilidade boolean,
  ADD COLUMN IF NOT EXISTS ergonomia    text;

-- tb_laudo
ALTER TABLE public.tb_laudo
  ADD COLUMN IF NOT EXISTS resultado_medico  text,
  ADD COLUMN IF NOT EXISTS resultado_tecnico text;
