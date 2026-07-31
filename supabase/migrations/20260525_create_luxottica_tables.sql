-- ─── luxottica_tb_contratos_terceiros ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.luxottica_tb_contratos_terceiros (
  id bigserial PRIMARY KEY,
  contratada text,
  cnpj text,
  objeto text,
  vigencia_atual text,
  valor_mensal text,
  aditivos_anexos text,
  clausula_de_rescisao text,
  status text
);

ALTER TABLE public.luxottica_tb_contratos_terceiros ENABLE ROW LEVEL SECURITY;

-- ─── luxottica_tb_laudo ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.luxottica_tb_laudo (
  id bigserial PRIMARY KEY,
  numero_processo text,
  resultado_medico text,
  do_psiquica text,
  grau_psiquica numeric,
  do_medico_geral text,
  grau_medico numeric,
  ergonomia text,
  incapacidade text,
  acidente_trabalho boolean,
  resultado_tecnico text,
  periculosidade boolean,
  insalubridade boolean,
  grau_insalubridade numeric
);

ALTER TABLE public.luxottica_tb_laudo ENABLE ROW LEVEL SECURITY;

-- ─── luxottica_tb_pedidos_acordao ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.luxottica_tb_pedidos_acordao (
  id bigserial PRIMARY KEY,
  numero_processo text,
  do_psiquica text,
  do_medica_geral text,
  ergonomia text,
  incapacidade text,
  acidente_trabalho boolean,
  periculosidade boolean,
  insalubridade boolean,
  reintegracao boolean,
  rescisao_indireta boolean,
  assedio_moral text,
  danos_morais boolean,
  danos_materiais boolean,
  horas_extras boolean,
  intrajornada boolean,
  interjornada text,
  tempo_disposicao text,
  sobreaviso text,
  adicional_noturno text,
  acumulo_funcao boolean,
  equip_salarial boolean,
  rec_vinculo boolean,
  responsabilidade text,
  unicidade text,
  verbas text,
  multa_467 text,
  multa_477 text,
  honorarios_adv boolean,
  obrigacoes_fazer text,
  outros text
);

ALTER TABLE public.luxottica_tb_pedidos_acordao ENABLE ROW LEVEL SECURITY;

-- ─── luxottica_tb_pedidos_inicial ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.luxottica_tb_pedidos_inicial (
  id bigserial PRIMARY KEY,
  numero_processo text,
  do_at text,
  reintegracao boolean,
  periculosidade boolean,
  insalubridade boolean,
  rescisao_indireta boolean,
  assedio_moral text,
  danos_morais boolean,
  danos_materiais boolean,
  horas_extras boolean,
  intrajornada boolean,
  interjornada text,
  tempo_disposicao text,
  sobreaviso text,
  adicional_noturno text,
  acumulo_funcao boolean,
  equip_salarial boolean,
  rec_vinculo boolean,
  responsabilidade text,
  unicidade text,
  verbas text,
  multa_467 text,
  multa_477 text,
  honorarios_adv boolean,
  outros text
);

ALTER TABLE public.luxottica_tb_pedidos_inicial ENABLE ROW LEVEL SECURITY;

-- ─── luxottica_tb_pedidos_sentenca ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.luxottica_tb_pedidos_sentenca (
  id bigserial PRIMARY KEY,
  numero_processo text,
  do_psiquica text,
  do_medica_geral text,
  ergonomia text,
  incapacidade text,
  acidente_trabalho boolean,
  periculosidade boolean,
  insalubridade boolean,
  reintegracao boolean,
  rescisao_indireta boolean,
  assedio_moral text,
  danos_morais boolean,
  danos_materiais boolean,
  horas_extras boolean,
  intrajornada boolean,
  interjornada text,
  tempo_disposicao text,
  sobreaviso text,
  adicional_noturno text,
  acumulo_funcao boolean,
  equip_salarial boolean,
  rec_vinculo boolean,
  responsabilidade text,
  unicidade text,
  verbas text,
  multa_467 text,
  multa_477 text,
  honorarios_adv boolean,
  obrigacoes_fazer text,
  outros text
);

ALTER TABLE public.luxottica_tb_pedidos_sentenca ENABLE ROW LEVEL SECURITY;

-- ─── luxottica_tb_processo ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.luxottica_tb_processo (
  numero_processo text PRIMARY KEY,
  nome_reclamante text,
  status_reclamante text,
  tipo_reclamante text,
  funcao_reclamante text,
  comarca text,
  vara text,
  orgao text,
  uf text,
  data_ajuizamento date,
  data_arquivamento date,
  fase_processual text,
  advogado_reclamante text,
  tipo_processo_apenso text,
  numero_processo_apenso text,
  tipo_acao text,
  data_admissao_reclamante date,
  data_demissao_reclamante date,
  modalidade_rescisao text,
  reclamada text,
  centro_custo text,
  empresa_terceirizada text,
  assistente_tecnico text,
  assistente_medico text,
  perito_medico_psiquiatra text,
  perito_medico_geral text,
  perito_ergonomico text,
  perito_tecnico text,
  honorario_pericia numeric,
  testemunha_reclamada text,
  testemunha_reclamante text,
  instancia text,
  status text,
  valor_acordo numeric,
  valor_causa numeric,
  liminar text
);

ALTER TABLE public.luxottica_tb_processo ENABLE ROW LEVEL SECURITY;

-- ─── luxottica_tb_valores ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.luxottica_tb_valores (
  numero_processo text PRIMARY KEY,
  deposito_recursal numeric,
  custas_processuais numeric,
  deposito_judicial numeric,
  provavel text,
  possivel text,
  remoto text
);

ALTER TABLE public.luxottica_tb_valores ENABLE ROW LEVEL SECURITY;

