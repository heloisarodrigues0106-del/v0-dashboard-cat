-- Migration: Adiciona coluna tipo_reclamante à tabela rfg_tb_processo
-- Executar no SQL Editor do Supabase

ALTER TABLE public.rfg_tb_processo
  ADD COLUMN IF NOT EXISTS tipo_reclamante text;
