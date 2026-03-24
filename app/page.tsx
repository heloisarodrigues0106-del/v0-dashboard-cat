import { createServerSupabaseClient } from '@/lib/supabase-server'
import DashboardClient from './dashboard-client'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  
  const [
    { data: processos, error: errProc },
    { data: pedidosInicial },
    { data: pedidosSentenca },
    { data: pedidosAcordao },
    { data: laudos },
    { data: valores }
  ] = await Promise.all([
    supabase.from('tb_processo').select('*'),
    supabase.from('tb_pedidos_inicial').select('*'),
    supabase.from('tb_pedidos_sentenca').select('*'),
    supabase.from('tb_pedidos_acordao').select('*'),
    supabase.from('tb_laudo').select('*'),
    supabase.from('tb_valores').select('*')
  ])

  if (errProc) {
    console.error('Erro ao buscar processos no Supabase:', errProc)
  }

  return (
    <DashboardClient 
      processos={processos || []}
      pedidosInicial={pedidosInicial || []}
      pedidosSentenca={pedidosSentenca || []}
      pedidosAcordao={pedidosAcordao || []}
      laudos={laudos || []}
      valores={valores || []}
    />
  )
}
