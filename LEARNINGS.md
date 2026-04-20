# Aprendizados da Sessão — Dashboard CAT
**Data:** 2026-04-16

---

## 1. Supabase

### Credenciais e Conexão
- A URL do projeto segue o padrão `https://<project-id>.supabase.co`
- O `project-id` está em **Settings → General → Project ID**
- As chaves estão em **Settings → API**:
  - `Publishable key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (segura para o browser)
  - `Secret key` → `SUPABASE_SERVICE_ROLE_KEY` (apenas servidor — bypassa RLS)
- As novas chaves do Supabase começam com `sb_publishable_` e `sb_secret_` (formato novo, diferente do `eyJ...` antigo)
- Acessar a URL diretamente no browser retorna `{"error":"requested path is invalid"}` — isso é normal

### Clonagem de Tabelas
- `CREATE TABLE nova LIKE original INCLUDING ALL` — copia estrutura **com** constraints (inclusive PK e NOT NULL), o que impede inserção sem `id`
- `CREATE TABLE nova AS SELECT * FROM original WHERE false` — copia estrutura **sem** constraints, ideal para tabelas de staging/import
- Tabelas clonadas com `LIKE` herdam a PK mas **não** a sequência de autoincrement — causa erro `null value in column "id" violates not-null constraint`
- Solução: usar `CREATE TABLE AS SELECT ... WHERE false` para tabelas de validação

### RLS (Row Level Security)
- `SERVICE_ROLE_KEY` bypassa RLS completamente — usar apenas no servidor
- Para sistema de empresa única, a política mais simples é: `TO authenticated USING (true)`
- Sem RLS ativo, qualquer usuário autenticado com `ANON_KEY` pode ler todos os dados
- Script de RLS salvo em `supabase/rls.sql`

### Renomear Tabelas
- `ALTER TABLE nome_atual RENAME TO novo_nome` — renomeia sem perda de dados
- Padrão adotado: originais viram `_backup`, imports viram os nomes originais

### Schema Cache
- O Supabase mantém um cache do schema das tabelas
- Colunas que não existem no banco retornam erro `PGRST204: Could not find the 'coluna' in the schema cache`
- Isso é útil para identificar divergências entre Excel e banco

---

## 2. Script de Importação Python

### Estrutura Geral
- Biblioteca `supabase-py` para conexão com o Supabase
- `pandas` + `openpyxl` para leitura dos Excels
- Inserção em batches de 100 linhas (limite seguro da API REST do Supabase)
- Leitura automática do `.env.local` para carregar credenciais

### Problemas Encontrados e Soluções

#### Encoding no Windows
- Terminal Windows (cp1252) não suporta caracteres UTF-8 nos prints
- Solução: `sys.stdout.reconfigure(encoding='utf-8')` no início do script

#### SSL Certificate Error
- Ambiente local com VPN/proxy causa `CERTIFICATE_VERIFY_FAILED`
- Solução: `ssl._create_default_https_context = ssl._create_unverified_context`
- **Atenção:** não usar em produção — apenas em ambiente de desenvolvimento

#### NaN não serializável em JSON
- `pandas` mantém `float('nan')` mesmo após conversões
- `None` em Python vira `null` no JSON, mas `float('nan')` causa erro
- Solução: função `sanitize_record()` que filtra todos os `nan` residuais antes de enviar

#### Tipos incompatíveis Excel → Banco
| Problema | Causa | Solução |
|----------|-------|---------|
| `"FLASE"`, `"FALSER"` | Typo no Excel | Mapeados para `false` no `to_bool()` |
| `"CONCAUSA"`, `"SEM NEXO"` em coluna boolean | Dado textual em campo bool | Vira `None` |
| `"INCAPAZ"`, `"CAPAZ"` em coluna boolean | Dado textual em campo bool | Vira `None` |
| Espaços em branco em campo numeric | Célula "vazia" com espaços | `strip()` → `None` |
| `"447278. 40"` (espaço no número) | Formatação do Excel | Remove espaços antes de converter |
| `Timestamp` pandas não serializável | Tipo nativo pandas | `.date().isoformat()` |
| `NaT` (Not a Time) pandas | Data vazia | Checagem com `pd.isnull()` |
| Número serial de data (`45231`) | Excel armazena datas como inteiros | Converte via `1899-12-30 + N dias` |

#### Colunas com nomes diferentes entre Excel e banco
- Excel e banco frequentemente têm nomes divergentes
- Solução: dicionário `renomear` por tabela no script
- Exemplos encontrados:
  - `honorarios_adv` → `honorarios_advocaticios`
  - `do_psiquica` → `do_mental`
  - `do_medica_geral` → `do_ergonomica`
  - `grau_medico` → `grau_medico_geral`
  - `obrigacoes_fazer` → `obrigacao`
  - `numero_ processo_apenso` (com espaço) → `numero_processo_apenso`
  - `testemunha reclamante` (com espaço) → `testemunha_reclamante`

#### Colunas do Excel que não existem no banco
- Solução: lista `ignorar` por tabela — colunas são dropadas antes da inserção
- Exemplos: `resultado_medico`, `resultado_tecnico` (em `tb_laudo`)

#### Colunas duplicadas após renomear
- Quando duas colunas do Excel mapeiam para o mesmo nome no banco
- Solução: `df.loc[:, ~df.columns.duplicated()]` — mantém a primeira

#### Coluna `id` nas tabelas clonadas
- Tabelas clonadas com `LIKE` herdam `id` como NOT NULL sem autoincrement
- Solução 1: `ALTER TABLE ... ALTER COLUMN id DROP NOT NULL` — falha se `id` é PK
- Solução 2: Recriar com `CREATE TABLE AS SELECT * FROM ... WHERE false` — sem constraints
- Script sempre remove coluna `id` do DataFrame antes de inserir

### Boas Práticas Aprendidas
- **Inspecionar antes de converter** — ler todos os valores únicos de cada coluna antes de definir os tipos
- **Testar nas tabelas `_import` primeiro** — validar antes de sobrescrever produção
- **Batch size 100** — seguro para a API REST do Supabase sem timeout
- **Limpar tabela antes de inserir** — usar `.delete().neq("numero_processo", "__NUNCA_EXISTE__")` para deletar todos os registros sem truncate

---

## 3. Segurança (Next.js + Supabase)

### Correções Aplicadas
| # | Problema | Arquivo | Correção |
|---|----------|---------|----------|
| 1 | TLS desabilitado (`NODE_TLS_REJECT_UNAUTHORIZED = '0'`) | `lib/supabase-server.ts` | Linha removida |
| 2 | Sem headers de segurança | `next.config.mjs` | CSP, HSTS, X-Frame-Options, etc. |
| 3 | `ignoreBuildErrors: true` | `next.config.mjs` | Removido |
| 4 | Logout sem autenticação | `app/api/auth/logout/route.ts` | Verifica sessão antes de signOut |
| 5 | Service Worker cacheava `/dashboard` | `public/sw.js` | Bloqueado cache de rotas autenticadas |
| 6 | Middleware silenciava falha de auth | `middleware.ts` | Redireciona para login em caso de erro |
| 7 | Email hardcoded no componente | `configuracoes-page.tsx` | Carregado via `supabase.auth.getUser()` |
| 8 | Senha não era salva no backend | `configuracoes-page.tsx` | API route criada |
| 9 | Rate limiting ausente no login | `app/page.tsx` | Bloqueio após 5 tentativas por 30s |
| 10 | `select('*')` em todas as queries | `app/dashboard/page.tsx` | Colunas explícitas |
| 11 | `console.error` em produção | `app/dashboard/page.tsx` | Só ativo em development |
| 12 | Senha atual não verificada | `app/api/auth/update-password/route.ts` | Re-autenticação via Supabase |
| 13 | Sem validação de força de senha | `configuracoes-page.tsx` + API | Maiúscula + número + símbolo obrigatórios |

### Pendente
- **RLS** — script gerado em `supabase/rls.sql`, ainda não executado (decisão do cliente)
- **Rate limiting server-side** — atual é client-side (pode ser burlado); requer Redis/Upstash
- **2FA/MFA** — não implementado
- **Auditoria de acesso** — sem log de quem acessou o quê

---

## 4. Fluxo de Atualização de Dados (Processo Definido)

```
1. Colocar novos .xlsx na pasta import/
2. Rodar: python import/importar.py
   → Importa nas tabelas _import
3. Validar dados no Supabase (tabelas _import)
4. Se OK, executar no SQL Editor:
   ALTER TABLE tb_X RENAME TO tb_X_backup;
   ALTER TABLE tb_X_import RENAME TO tb_X;
5. Se necessário reverter:
   ALTER TABLE tb_X RENAME TO tb_X_import;
   ALTER TABLE tb_X_backup RENAME TO tb_X;
```
