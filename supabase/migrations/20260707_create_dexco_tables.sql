-- ─── dexco_tb_laudo ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dexco_tb_laudo (
  id bigserial PRIMARY KEY,
  numero_processo text,
  resultado_medico text,
  do_psiquica text,
  grau_psiquica numeric,
  do_medico_geral text,
  grau_medico numeric,
  incapacidade text,
  acidente_trabalho boolean,
  resultado_tecnico text,
  periculosidade boolean,
  agente_periculoso text,
  insalubridade boolean,
  agente_insalubre text,
  grau_insalubridade numeric
);

ALTER TABLE public.dexco_tb_laudo ENABLE ROW LEVEL SECURITY;

-- ─── dexco_tb_pedidos_acordao ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dexco_tb_pedidos_acordao (
  id bigserial PRIMARY KEY,
  numero_processo text,
  horas_extras boolean,
  intrajornada boolean,
  periculosidade boolean,
  insalubridade boolean,
  acumulo_funcao boolean,
  do_at text,
  danos_materiais boolean,
  danos_morais boolean,
  dano_estetico text,
  salario_substituicao text,
  equip_salarial boolean,
  responsabilidade text,
  justica_gratuita text,
  honorarios_adv boolean,
  outros text
);

ALTER TABLE public.dexco_tb_pedidos_acordao ENABLE ROW LEVEL SECURITY;

-- ─── dexco_tb_pedidos_inicial ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dexco_tb_pedidos_inicial (
  id bigserial PRIMARY KEY,
  numero_processo text,
  horas_extras boolean,
  intrajornada boolean,
  periculosidade boolean,
  insalubridade boolean,
  acumulo_funcao boolean,
  do_at text,
  danos_materiais boolean,
  danos_morais boolean,
  dano_estetico text,
  salario_substituicao text,
  equip_salarial boolean,
  responsabilidade text,
  justica_gratuita text,
  honorarios_adv boolean,
  outros text
);

ALTER TABLE public.dexco_tb_pedidos_inicial ENABLE ROW LEVEL SECURITY;

-- ─── dexco_tb_pedidos_sentenca ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dexco_tb_pedidos_sentenca (
  id bigserial PRIMARY KEY,
  numero_processo text,
  horas_extras boolean,
  intrajornada boolean,
  periculosidade boolean,
  insalubridade boolean,
  acumulo_funcao boolean,
  do_at text,
  danos_materiais boolean,
  danos_morais boolean,
  dano_estetico text,
  salario_substituicao text,
  equip_salarial boolean,
  responsabilidade text,
  justica_gratuita text,
  honorarios_adv boolean,
  outros text
);

ALTER TABLE public.dexco_tb_pedidos_sentenca ENABLE ROW LEVEL SECURITY;

-- ─── dexco_tb_processo ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dexco_tb_processo (
  numero_processo text PRIMARY KEY,
  nome_reclamante text,
  status_reclamante text,
  tipo_reclamante text,
  funcao_reclamante text,
  comarca text,
  vara text,
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

ALTER TABLE public.dexco_tb_processo ENABLE ROW LEVEL SECURITY;

-- ─── dexco_tb_valores ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dexco_tb_valores (
  numero_processo text PRIMARY KEY,
  deposito_recursal numeric,
  apolice boolean,
  custas_processuais numeric,
  deposito_judicial numeric,
  valor_pedido text,
  remoto text,
  possivel text,
  provavel text
);

ALTER TABLE public.dexco_tb_valores ENABLE ROW LEVEL SECURITY;

