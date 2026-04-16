# Relatório de Segurança - Dashboard CAT

**Data da análise:** 2026-04-16  
**Projeto:** v0-dashboard-cat  
**Deploy:** https://v0-dashboard-cat.vercel.app  

---

## Screenshots — Estado Original (antes das correções)

| # | Página | Arquivo |
|---|--------|---------|
| 1 | Login | `screenshots/01-login.png` |
| 2 | Dashboard — Visão Geral | `screenshots/02-dashboard-visao-geral.png` |
| 3 | Processos | `screenshots/03-processos.png` |
| 4 | Acordos | `screenshots/04-acordos.png` |
| 5 | Laudos | `screenshots/05-laudos.png` |
| 6 | Valores | `screenshots/06-valores.png` |
| 7 | Configurações | `screenshots/07-configuracoes.png` |

> Screenshots capturados em 2026-04-16 antes de qualquer correção de segurança ser aplicada.

---

## Estado Original (antes das correções)

### CRITICO 1 — TLS Desabilitado
**Arquivo:** `lib/supabase-server.ts:4`  
**Código original:**
```ts
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
```
**Risco:** Permite ataques Man-in-the-Middle — toda comunicação servidor→Supabase pode ser interceptada.  
**Correção:** Linha removida.

---

### CRITICO 2 — Service Worker cacheia páginas autenticadas
**Arquivo:** `public/sw.js`  
**Código original:**
```js
const PRECACHE_URLS = ['/', '/dashboard']
// ...cache.put(event.request, clone) — cacheava TODAS as requisições GET
```
**Risco:** Em dispositivos compartilhados, a página `/dashboard` com dados sensíveis ficava acessível offline sem autenticação.  
**Correção:** Removido `/dashboard` do precache; bloqueado cache de rotas autenticadas e respostas de API.

---

### ALTO 1 — API de logout sem autenticação
**Arquivo:** `app/api/auth/logout/route.ts`  
**Código original:**
```ts
export async function POST() {
  const supabase = createClient()
  await supabase.auth.signOut()
  return NextResponse.json({ success: true })
}
```
**Risco:** Qualquer requisição anônima podia chamar o endpoint.  
**Correção:** Adicionada verificação de sessão antes do signOut.

---

### ALTO 2 — Sem headers de segurança
**Arquivo:** `next.config.mjs`  
**Código original:**
```js
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
}
```
**Risco:** Sem CSP, HSTS, X-Frame-Options, X-Content-Type-Options — aplicação vulnerável a clickjacking, MIME sniffing, injeção de scripts.  
**Correção:** Headers de segurança adicionados; `ignoreBuildErrors` removido.

---

### ALTO 3 — Middleware silencia falha de autenticação
**Arquivo:** `middleware.ts:29-34`  
**Código original:**
```ts
try {
  const { data } = await supabase.auth.getUser()
  user = data.user
} catch {
  // Auth check failed — allow page to render  ← PROBLEMA
}
```
**Risco:** Se o Supabase falhasse, a página do dashboard era renderizada sem autenticação.  
**Correção:** Em caso de erro no auth check, redireciona para login se a rota for protegida.

---

### MEDIO 1 — Mudança de senha não salvava no backend
**Arquivo:** `components/dashboard/configuracoes-page.tsx:28-36`  
**Código original:**
```ts
const handleSavePassword = () => {
  if (newPassword === confirmPassword && newPassword.length >= 8) {
    setPasswordSaved(true)  // só atualizava estado local!
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setTimeout(() => setPasswordSaved(false), 2000)
  }
}
```
**Risco:** Usuário achava que estava trocando a senha mas nada era salvo.  
**Correção:** Criada API route `POST /api/auth/update-password` + componente atualizado para chamar a API.

---

### MEDIO 2 — Email hardcoded no componente de configurações
**Arquivo:** `components/dashboard/configuracoes-page.tsx:15`  
**Código original:**
```ts
const [email, setEmail] = useState("maria.silva@lexdash.com.br")
```
**Risco:** Email fictício exibido para todos os usuários; alteração de email não era salva.  
**Correção:** Email buscado do usuário autenticado via Supabase; salvamento implementado via API.

---

## Correções Aplicadas

| # | Arquivo | Problema | Status |
|---|---------|----------|--------|
| 1 | `lib/supabase-server.ts` | TLS desabilitado | ✅ Corrigido |
| 2 | `next.config.mjs` | Sem headers de segurança + ignoreBuildErrors | ✅ Corrigido |
| 3 | `app/api/auth/logout/route.ts` | Sem verificação de auth | ✅ Corrigido |
| 4 | `public/sw.js` | Cache de páginas autenticadas | ✅ Corrigido |
| 5 | `middleware.ts` | Falha de auth silenciada | ✅ Corrigido |
| 6 | `components/dashboard/configuracoes-page.tsx` | Email hardcoded + senha não salva | ✅ Corrigido |
| 7 | `app/api/auth/update-password/route.ts` | Rota inexistente | ✅ Criado |

---

## Problemas conhecidos não corrigidos nesta iteração

- **RBAC (controle de acesso por perfil):** Todos os usuários autenticados têm acesso igual. Requer definição de papéis no Supabase.
- **Row Level Security (RLS):** O servidor usa `SERVICE_ROLE_KEY` que bypassa RLS. Avaliar se RLS deve ser ativado por tabela.
- **Rate limiting:** Não há limite de tentativas de login ou chamadas de API.
- **Validação de inputs com Zod:** Pacote instalado mas não utilizado.
- **`select('*')` nas queries:** Expõe todas as colunas. Deve-se especificar apenas as colunas necessárias por view.
