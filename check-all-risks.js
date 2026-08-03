process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const envContent = fs.readFileSync('.env.local', 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  const parts = line.split('=')
  if (parts.length >= 2) {
    const key = parts[0].trim()
    const val = parts.slice(1).join('=').trim().replace(/^"(.*)"$/, '$1')
    env[key] = val
  }
})

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function normalizeNumber(num) {
  if (!num) return ''
  return num.replace(/[^a-zA-Z0-9]/g, '').trim()
}

async function run() {
  const { data: processos } = await supabase
    .from('tb_processo')
    .select('numero_processo, valor_causa, valor_acordo, status')
    .gt('valor_acordo', 0)

  const { data: q2 } = await supabase.from('tb_valores_q2_2026').select('*')

  const q2Map = new Map()
  q2.forEach(r => q2Map.set(normalizeNumber(r.numero_processo), r))

  console.log('=== PROCESS RISK PROFILES ===')
  processos.forEach(p => {
    const norm = normalizeNumber(p.numero_processo)
    const r2 = q2Map.get(norm) || {}

    console.log(`Proc: ${p.numero_processo} (Acordo: ${p.valor_acordo})`)
    console.log(`  Provavel (Ant/Atu): ${r2.provavel_total_anterior} / ${r2.provavel_total_atual}`)
    console.log(`  Possivel (Ant/Atu): ${r2.possivel_total_anterior} / ${r2.possivel_total_atual}`)
    console.log(`  Remoto (Ant/Atu):   ${r2.remoto_total_anterior} / ${r2.remoto_total_atual}`)
  })
}

run()
