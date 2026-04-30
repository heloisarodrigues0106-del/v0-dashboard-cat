-- Migration: renomear colunas do Supabase para ficarem iguais ao Excel
-- Fonte da verdade: nomes das colunas do Excel (com _ no lugar de espaços)
-- Executar no SQL Editor do Supabase

-- tb_pedidos_inicial
ALTER TABLE tb_pedidos_inicial RENAME COLUMN honorarios_advocaticios TO honorarios_adv;

-- tb_pedidos_sentenca
ALTER TABLE tb_pedidos_sentenca RENAME COLUMN honorarios_advocaticios TO honorarios_adv;
ALTER TABLE tb_pedidos_sentenca RENAME COLUMN do_mental TO do_psiquica;
ALTER TABLE tb_pedidos_sentenca RENAME COLUMN do_ergonomica TO do_medica_geral;
ALTER TABLE tb_pedidos_sentenca RENAME COLUMN obrigacao TO obrigacoes_fazer;

-- tb_pedidos_acordao
ALTER TABLE tb_pedidos_acordao RENAME COLUMN honorarios_advocaticios TO honorarios_adv;
ALTER TABLE tb_pedidos_acordao RENAME COLUMN do_mental TO do_psiquica;
ALTER TABLE tb_pedidos_acordao RENAME COLUMN do_ergonomica TO do_medica_geral;
ALTER TABLE tb_pedidos_acordao RENAME COLUMN obrigacao TO obrigacoes_fazer;

-- tb_laudo
ALTER TABLE tb_laudo RENAME COLUMN do_mental TO do_psiquica;
ALTER TABLE tb_laudo RENAME COLUMN grau_mental TO grau_psiquica;
ALTER TABLE tb_laudo RENAME COLUMN do_medica_geral TO do_medico_geral;
ALTER TABLE tb_laudo RENAME COLUMN grau_medico_geral TO grau_medico;
ALTER TABLE tb_laudo RENAME COLUMN ergonomia TO resultado_ergonomico;
