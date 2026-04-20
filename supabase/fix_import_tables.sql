-- Recria as tabelas _import sem a constraint de id
-- Execute no SQL Editor do Supabase

DROP TABLE IF EXISTS tb_pedidos_inicial_import;
DROP TABLE IF EXISTS tb_pedidos_sentenca_import;
DROP TABLE IF EXISTS tb_pedidos_acordao_import;
DROP TABLE IF EXISTS tb_laudo_import;
DROP TABLE IF EXISTS tb_valores_import;
DROP TABLE IF EXISTS tb_processo_import;

CREATE TABLE tb_processo_import AS SELECT * FROM tb_processo WHERE false;
CREATE TABLE tb_pedidos_inicial_import AS SELECT * FROM tb_pedidos_inicial WHERE false;
CREATE TABLE tb_pedidos_sentenca_import AS SELECT * FROM tb_pedidos_sentenca WHERE false;
CREATE TABLE tb_pedidos_acordao_import AS SELECT * FROM tb_pedidos_acordao WHERE false;
CREATE TABLE tb_laudo_import AS SELECT * FROM tb_laudo WHERE false;
CREATE TABLE tb_valores_import AS SELECT * FROM tb_valores WHERE false;
