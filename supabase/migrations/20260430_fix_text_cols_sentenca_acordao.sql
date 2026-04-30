-- Corrige colunas que eram boolean mas contêm valores texto no Excel
-- tb_pedidos_sentenca e tb_pedidos_acordao:
--   do_psiquica   → valores: "SEM NEXO", "FALSE" (texto, não boolean)
--   do_medica_geral → valores: "CAUSA", "CONCAUSA", "SEM NEXO" (texto)
--   incapacidade  → valores: "INCAPAZ", "CAPAZ", "INCAPACIDADE PARCIAL PERMANENTE" (texto)

ALTER TABLE public.tb_pedidos_sentenca
  ALTER COLUMN do_psiquica    TYPE text USING NULL,
  ALTER COLUMN do_medica_geral TYPE text USING NULL,
  ALTER COLUMN incapacidade   TYPE text USING NULL;

ALTER TABLE public.tb_pedidos_acordao
  ALTER COLUMN do_psiquica    TYPE text USING NULL,
  ALTER COLUMN do_medica_geral TYPE text USING NULL,
  ALTER COLUMN incapacidade   TYPE text USING NULL;
