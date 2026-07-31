const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  "https://dcqpzzdtpdjvcjcobgbs.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcXB6emR0cGRqdmNqY29iZ2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzY5NzUsImV4cCI6MjA4ODkxMjk3NX0.RHptA5v_OdQBzU5fWWdZc_rcoOH5dSuRG95ndQW-wWI"
)

async function test() {
  console.log("--- TESTANDO TB_VALORES ---")
  const { data: valData, error: valError } = await supabase.from('tb_valores').select('*').limit(3)
  if (valError) {
    console.error("Erro tb_valores:", valError.message)
  } else {
    console.log("tb_valores colunas:", Object.keys(valData[0] || {}))
    console.log("tb_valores amostra:", valData)
  }

  console.log("\n--- TESTANDO TB_VALORES_Q2_2026 ---")
  const { data: q2Data, error: q2Error } = await supabase.from('tb_valores_q2_2026').select('*').limit(3)
  if (q2Error) {
    console.error("Erro tb_valores_q2_2026:", q2Error.message)
  } else {
    console.log("tb_valores_q2_2026 colunas:", Object.keys(q2Data[0] || {}))
    console.log("tb_valores_q2_2026 amostra:", q2Data)
  }

  console.log("\n--- TESTANDO TB_PROCESSO (STATUS/INSTANCIA) ---")
  const { data: procData, error: procError } = await supabase.from('tb_processo').select('instancia, status')
  if (procError) {
    console.error("Erro tb_processo:", procError.message)
  } else {
    const instancias = [...new Set(procData.map(p => p.instancia))]
    const statuses = [...new Set(procData.map(p => p.status))]
    console.log("Instancias distintas:", instancias)
    console.log("Status distintos:", statuses)
  }
}

test()
