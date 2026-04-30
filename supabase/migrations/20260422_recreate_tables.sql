-- Recria as tabelas de trabalho com a mesma estrutura das backups
-- Baseado na inspeção direta das tabelas *_backup

-- ─── tb_processo ─────────────────────────────────────────────────────────────
-- (backup não tem id, pk é numero_processo)
DROP TABLE IF EXISTS public.tb_processo;
CREATE TABLE public.tb_processo (
  numero_processo            text PRIMARY KEY,
  nome_reclamante            text,
  status_reclamante          text,
  funcao_reclamante          text,
  comarca                    text,
  vara                       text,
  uf                         text,
  data_ajuizamento           date,
  data_arquivamento          date,
  fase_processual            text,
  advogado_reclamante        text,
  tipo_processo_apenso       text,
  numero_processo_apenso     text,
  tipo_acao                  text,
  data_admissao_reclamante   date,
  data_demissao_reclamante   date,
  modalidade_rescisao        text,
  reclamada                  text,
  centro_custo               text,
  empresa_terceirizada       text,
  perito_medico_psiquiatra   text,
  perito_medico_geral        text,
  perito_ergonomico          text,
  perito_tecnico             text,
  assistente_tecnico         text,
  assistente_medico          text,
  honorario_pericia          numeric,
  testemunha_reclamada       text,
  testemunha_reclamante      text,
  instancia                  text,
  status                     text,
  valor_acordo               numeric,
  valor_causa                numeric,
  liminar                    text
);

-- ─── tb_pedidos_inicial ───────────────────────────────────────────────────────
DROP TABLE IF EXISTS public.tb_pedidos_inicial;
CREATE TABLE public.tb_pedidos_inicial (
  id                       bigserial PRIMARY KEY,
  numero_processo          text,
  do_at                    boolean,
  reintegracao             boolean,
  periculosidade           boolean,
  insalubridade            boolean,
  rescisao_indireta        boolean,
  danos_morais             boolean,
  danos_materiais          boolean,
  horas_extras             boolean,
  intrajornada             boolean,
  horas_itinere            boolean,
  acumulo_funcao           boolean,
  equip_salarial           boolean,
  rec_vinculo              boolean,
  honorarios_adv           boolean,
  estabilidade             boolean,
  outros                   text
);

-- ─── tb_pedidos_sentenca ──────────────────────────────────────────────────────
DROP TABLE IF EXISTS public.tb_pedidos_sentenca;
CREATE TABLE public.tb_pedidos_sentenca (
  id                       bigserial PRIMARY KEY,
  numero_processo          text,
  do_psiquica              boolean,
  do_medica_geral          boolean,
  incapacidade             boolean,
  acidente_trabalho        boolean,
  periculosidade           boolean,
  insalubridade            boolean,
  reintegracao             boolean,
  rescisao_indireta        boolean,
  danos_morais             boolean,
  danos_materiais          boolean,
  horas_extras             boolean,
  intrajornada             boolean,
  horas_itinere            boolean,
  acumulo_funcao           boolean,
  equip_salarial           boolean,
  rec_vinculo              boolean,
  honorarios_adv           boolean,
  estabilidade             boolean,
  ergonomia                text,
  obrigacoes_fazer         text,
  outros                   text
);

-- ─── tb_pedidos_acordao ───────────────────────────────────────────────────────
DROP TABLE IF EXISTS public.tb_pedidos_acordao;
CREATE TABLE public.tb_pedidos_acordao (
  id                       bigserial PRIMARY KEY,
  numero_processo          text,
  do_psiquica              boolean,
  do_medica_geral          boolean,
  incapacidade             boolean,
  acidente_trabalho        boolean,
  periculosidade           boolean,
  insalubridade            boolean,
  reintegracao             boolean,
  rescisao_indireta        boolean,
  danos_morais             boolean,
  danos_materiais          boolean,
  horas_extras             boolean,
  intrajornada             boolean,
  horas_itinere            boolean,
  acumulo_funcao           boolean,
  equip_salarial           boolean,
  rec_vinculo              boolean,
  honorarios_adv           boolean,
  estabilidade             boolean,
  ergonomia                text,
  obrigacoes_fazer         text,
  outros                   text
);

-- ─── tb_laudo ─────────────────────────────────────────────────────────────────
-- do_psiquica e do_medico_geral são texto no Excel: "CAUSA", "CONCAUSA", "SEM NEXO"
DROP TABLE IF EXISTS public.tb_laudo;
CREATE TABLE public.tb_laudo (
  id                    bigserial PRIMARY KEY,
  numero_processo       text,
  do_psiquica           text,
  grau_psiquica         numeric,
  do_medico_geral       text,
  grau_medico           numeric,
  resultado_ergonomico  text,
  incapacidade          text,
  acidente_trabalho     boolean,
  periculosidade        boolean,
  insalubridade         boolean,
  grau_insalubridade    numeric,
  resultado_medico      text,
  resultado_tecnico     text
);

-- ─── tb_valores ───────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS public.tb_valores;
CREATE TABLE public.tb_valores (
  numero_processo                          text PRIMARY KEY,
  deposito_recursal                        numeric,
  apolice                                  boolean,
  custas_processuais                       numeric,
  deposito_judicial                        numeric,
  provavel_principal_quarter_anterior      numeric,
  provavel_correcao_quarter_anterior       numeric,
  provavel_juros_quarter_anterior          numeric,
  provavel_total_anterior                  numeric,
  provavel_principal_quarter_atual         numeric,
  provavel_correcao_quarter_atual          numeric,
  provavel_juros_quarter_atual             numeric,
  provavel_total_atual                     numeric,
  possivel_principal_quarter_anterior      numeric,
  possivel_correcao_quarter_anterior       numeric,
  possivel_juros_quarter_anterior          numeric,
  possivel_total_anterior                  numeric,
  possivel_principal_quarter_atual         numeric,
  possivel_correcao_quarter_atual          numeric,
  possivel_juros_quarter_atual             numeric,
  possivel_total_atual                     numeric,
  remoto_principal_quarter_anterior        numeric,
  remoto_correcao_quarter_anterior         numeric,
  remoto_juros_quarter_anterior            numeric,
  remoto_total_anterior                    numeric,
  remoto_principal_quarter_atual           numeric,
  remoto_correcao_quarter_atual            numeric,
  remoto_juros_quarter_atual               numeric,
  remoto_total_atual                       numeric,
  justificativa_reavaliacao_quarter_anterior text,
  justificativa_reavaliacao_quarter_atual    text,
  valor_pago_reclamante                    numeric
);

-- Habilita RLS (mesma politica das backups — acesso via service role)
ALTER TABLE public.tb_processo          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_pedidos_inicial   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_pedidos_sentenca  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_pedidos_acordao   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_laudo             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_valores           ENABLE ROW LEVEL SECURITY;
