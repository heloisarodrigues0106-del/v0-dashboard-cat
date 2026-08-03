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

async function run() {
  const { data: processos } = await supabase.from('tb_processo').select('numero_processo')
  const { data: q1 } = await supabase.from('tb_valores_q1_2026').select('numero_processo, provavel_total_atual, possivel_total_atual, remoto_total_atual')
  const { data: q2 } = await supabase.from('tb_valores_q2_2026').select('numero_processo, provavel_total_anterior, possivel_total_anterior, remoto_total_anterior, provavel_total_atual, possivel_total_atual, remoto_total_atual')

  const procSet = new Set(processos.map(p => p.numero_processo))

  console.log('Total processos in tb_processo:', processos.length)

  // 1. Calculate Old Way (filtered by tb_processo)
  let oldAnt = 0
  let oldAtu = 0
  q2.forEach(r => {
    if (procSet.has(r.numero_processo)) {
      oldAnt += Number(r.provavel_total_anterior || 0)
      oldAtu += Number(r.provavel_total_atual || 0)
    }
  })

  // 2. Calculate New Way (filtered by tb_processo)
  const q1Map = new Map()
  q1.forEach(r => q1Map.set(r.numero_processo, r))
  
  const q2Map = new Map()
  q2.forEach(r => q2Map.set(r.numero_processo, r))

  const allProcessosSet = new Set([
    ...q1.map(r => r.numero_processo),
    ...q2.map(r => r.numero_processo)
  ].filter(Boolean))

  let newAnt = 0
  let newAtu = 0

  allProcessosSet.forEach(numProc => {
    if (procSet.has(numProc)) {
      const q1Row = q1Map.get(numProc) || {}
      const q2Row = q2Map.get(numProc) || {}

      newAnt += Number(q1Row.provavel_total_atual || 0)
      newAtu += Number(q2Row.provavel_total_atual || 0)
    }
  })

  console.log('--- FILTERED SUMS (OLD VS NEW) ---')
  console.log('Old Way (Q2.anterior) - Anterior:', oldAnt)
  console.log('Old Way (Q2.atual) - Atual:', oldAtu)
  console.log('New Way (Q1.atual) - Anterior:', newAnt)
  console.log('New Way (Q2.atual) - Atual:', newAtu)
}

run()
