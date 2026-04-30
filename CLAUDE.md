# CLAUDE.md — Dashboard CAT

Contexto e histórico de decisões técnicas para o agente Claude Code.

---

## Projeto

**Nome:** Dashboard CAT (v0-dashboard-cat)  
**Stack:** Next.js 16 + React 19 + TypeScript + Supabase (PostgreSQL) + Tailwind CSS  
**Domínio:** Gestão de processos trabalhistas (Caterpillar/Martinelli)  
**Repositório local:** `D:\cat`

---

## Estrutura das Tabelas Supabase

### tb_processo
PK: `numero_processo` (text)  
Colunas numéricas: `valor_causa`, `valor_acordo`, `honorario_pericia`  
Colunas date: `data_ajuizamento`, `data_arquivamento`, `data_admissao_reclamante`, `data_demissao_reclamante`

### tb_pedidos_inicial
PK: `id` (bigserial)  
Todos os pedidos são `boolean` exceto `outros` (text)  
Colunas boolean: `do_at`, `reintegracao`, `periculosidade`, `insalubridade`, `rescisao_indireta`, `danos_morais`, `danos_materiais`, `horas_extras`, `intrajornada`, `horas_itinere`, `acumulo_funcao`, `equip_salarial`, `rec_vinculo`, `honorarios_advocaticios`

### tb_pedidos_sentenca e tb_pedidos_acordao
PK: `id` (bigserial)  
Colunas boolean: mesmas do inicial + `do_mental`, `do_ergonomica`, `incapacidade`, `acidente_trabalho`, `estabilidade`  
Colunas text: `obrigacao`, `outros`, `ergonomia`

### tb_laudo
PK: `id` (bigserial)  
Colunas text: `do_mental`, `do_medica_geral`, `ergonomia`, `incapacidade`, `resultado_medico`, `resultado_tecnico`  
Colunas boolean: `acidente_trabalho`, `periculosidade`, `insalubridade`  
Colunas numeric: `grau_mental`, `grau_medico_geral`, `grau_insalubridade`  
Obs: `do_mental` e `do_medica_geral` são text ("CAUSA", "CONCAUSA", "SEM NEXO") — NÃO boolean

### tb_valores
PK: `numero_processo` (text)  
Todas as colunas de valor são `numeric`; `apolice` é `boolean`

---

## Script de Importação (`import/importar.py`)

### Regra principal
**Nenhuma coluna do Excel deve ser ignorada.** Se uma coluna existe no Excel mas não no banco, o correto é:
1. Adicionar a coluna no schema do Supabase (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`)
2. Atualizar a migration em `supabase/migrations/`
3. Adicionar o tipo correto em `BOOL_COLS` ou `NUMERIC_COLS` conforme o caso
4. Remover a coluna da lista `ignorar` (ou não adicioná-la)

### Mapeamento de nomes Excel → banco (renomear)
| Excel | Banco | Tabela |
|---|---|---|
| `honorarios_adv` | `honorarios_advocaticios` | pedidos_inicial, sentenca, acordao |
| `do_psiquica` | `do_mental` | sentenca, acordao, laudo |
| `do_medica_geral` | `do_ergonomica` | sentenca, acordao |
| `do_medico_geral` | `do_medica_geral` | laudo |
| `grau_psiquica` | `grau_mental` | laudo |
| `grau_medico` | `grau_medico_geral` | laudo |
| `obrigacoes_fazer` | `obrigacao` | sentenca, acordao |
| `resultado_ergonomico` | `ergonomia` | laudo |
| `periculosidade ` (espaço) | `periculosidade` | pedidos_inicial, sentenca, acordao |
| `numero_ processo_apenso` (espaço) | `numero_processo_apenso` | processo |
| `testemunha reclamante` (espaço) | `testemunha_reclamante` | processo |
| `deposito_judicial ` (espaço) | `deposito_judicial` | valores |

### Conversores de tipo
- **to_bool**: aceita `true/t/yes/sim/1/x` → True; `false/f/no/nao/0/flase/falser` → False; demais → None
- **to_numeric**: remove espaços, substitui `,` por `.`, converte para float
- **to_date**: suporta Timestamp pandas, NaT, seriais Excel (inteiro/float), strings ISO
- **limpar_valor**: strip, NaN/None/"nan"/"" → None
- **sanitize_record**: remove todos os NaN residuais do dict antes de enviar ao Supabase

### Operação de limpeza antes de inserir
```python
supabase.table(tabela).delete().neq("numero_processo", "__NUNCA_EXISTE__").execute()
```
Isso deleta todos os registros sem usar TRUNCATE (que requer permissão especial).

### Batch size
100 linhas por insert — seguro para a API REST do Supabase sem timeout.

---

## Sessão 2026-04-30 — Colunas adicionadas

### Problema identificado
O script tinha listas `ignorar` para colunas que existiam no Excel mas não no banco.
A política correta é: **toda coluna do Excel deve existir no banco**.

### Colunas adicionadas ao Supabase

| Tabela | Coluna | Tipo | Valores observados |
|---|---|---|---|
| `tb_pedidos_sentenca` | `estabilidade` | boolean | TRUE / FALSE |
| `tb_pedidos_sentenca` | `ergonomia` | text | NEGATIVO / POSITIVO |
| `tb_pedidos_acordao` | `estabilidade` | boolean | TRUE / FALSE |
| `tb_pedidos_acordao` | `ergonomia` | text | NEGATIVO |
| `tb_laudo` | `resultado_medico` | text | NEGATIVO / POSITIVO |
| `tb_laudo` | `resultado_tecnico` | text | POSITIVO / NEGATIVO |

### Arquivos alterados
- `import/importar.py` — removidas as entradas `ignorar`; `estabilidade` adicionado em `BOOL_COLS` para sentenca e acordao
- `supabase/migrations/20260422_recreate_tables.sql` — schema atualizado com novas colunas
- `supabase/migrations/20260430_add_missing_columns.sql` — **migration incremental** com `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` para aplicar sem recriar tabelas
- `app/dashboard/page.tsx` — adicionado `estabilidade, ergonomia` nos selects de `tb_pedidos_sentenca` e `tb_pedidos_acordao`

### Observação sobre tb_laudo
`tb_laudo` usa `select('*')` na query, então `resultado_medico` e `resultado_tecnico` são retornados automaticamente após a migration — sem alterar o select.

---

## Query de dados (`app/dashboard/page.tsx`)

- Todas as queries usam colunas explícitas (não `select('*')`) exceto `tb_laudo`
- Ao adicionar colunas novas no banco, lembrar de incluir no select correspondente
- `tb_laudo` usa `select('*')` — novos campos chegam automaticamente

---

## Supabase — Credenciais e Operações

- **URL:** `https://dcqpzzdtpdjvcjcobgbs.supabase.co`
- **Anon key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`): segura para browser, respeita RLS
- **Service role key** (`SUPABASE_SERVICE_ROLE_KEY`): apenas servidor, bypassa RLS
- RLS habilitado em todas as tabelas; política: autenticados podem ler tudo
- Migrations ficam em `supabase/migrations/` — executar no SQL Editor do Supabase

---

## Fluxo para adicionar nova coluna do Excel ao banco

```
1. Inspecionar valores únicos da coluna no Excel (definir tipo: text/boolean/numeric)
2. Adicionar ALTER TABLE em supabase/migrations/<data>_add_missing_columns.sql
3. Executar o SQL no painel do Supabase (SQL Editor)
4. Atualizar supabase/migrations/20260422_recreate_tables.sql (schema canônico)
5. Se boolean: adicionar em BOOL_COLS no importar.py
   Se numeric: adicionar em NUMERIC_COLS no importar.py
6. Remover da lista ignorar (ou não adicionar) no TABELAS do importar.py
7. Se a tabela usa select explícito em app/dashboard/page.tsx, adicionar a coluna
8. Rodar python import/importar.py
```

---

## Referências internas

- Schema canônico: `supabase/migrations/20260422_recreate_tables.sql`
- RLS: `supabase/rls.sql`
- Aprendizados anteriores (sessão 2026-04-16): `LEARNINGS.md`
