// Mock data based on tb_processo, tb_valores, tb_pedido_inicial, tb_pedido_sentenca

export interface Processo {
  id: string
  numero_processo: string
  reclamante: string
  trt: string
  comarca: string
  fase_atual: string
  status: "Ativo" | "Encerrado" | "Suspenso" | "Arquivado"
  data_distribuicao: string
  data_atualizacao: string
}

export interface ValorRisco {
  trimestre: string
  ano: number
  principal_provavel: number
  correcao_provavel: number
  juros_provavel: number
  principal_possivel: number
  correcao_possivel: number
  juros_possivel: number
  principal_remoto: number
  correcao_remoto: number
  juros_remoto: number
}

export interface PedidoComparativo {
  tipo: string
  inicial: number
  sentenca: number
}

export const processos: Processo[] = [
  {
    id: "1",
    numero_processo: "0001234-56.2024.5.02.0001",
    reclamante: "Maria Silva Santos",
    trt: "TRT-2",
    comarca: "São Paulo",
    fase_atual: "Instrução",
    status: "Ativo",
    data_distribuicao: "2024-01-15",
    data_atualizacao: "2024-03-10"
  },
  {
    id: "2",
    numero_processo: "0002345-67.2024.5.02.0002",
    reclamante: "João Pedro Oliveira",
    trt: "TRT-2",
    comarca: "Campinas",
    fase_atual: "Sentença",
    status: "Ativo",
    data_distribuicao: "2024-02-20",
    data_atualizacao: "2024-03-08"
  },
  {
    id: "3",
    numero_processo: "0003456-78.2024.5.15.0003",
    reclamante: "Ana Clara Ferreira",
    trt: "TRT-15",
    comarca: "Ribeirão Preto",
    fase_atual: "Recurso Ordinário",
    status: "Ativo",
    data_distribuicao: "2023-11-05",
    data_atualizacao: "2024-03-05"
  },
  {
    id: "4",
    numero_processo: "0004567-89.2023.5.02.0004",
    reclamante: "Carlos Eduardo Lima",
    trt: "TRT-2",
    comarca: "São Paulo",
    fase_atual: "Execução",
    status: "Ativo",
    data_distribuicao: "2023-08-12",
    data_atualizacao: "2024-02-28"
  },
  {
    id: "5",
    numero_processo: "0005678-90.2024.5.02.0005",
    reclamante: "Beatriz Mendes Costa",
    trt: "TRT-2",
    comarca: "Santos",
    fase_atual: "Acordo",
    status: "Suspenso",
    data_distribuicao: "2024-01-08",
    data_atualizacao: "2024-03-01"
  },
  {
    id: "6",
    numero_processo: "0006789-01.2023.5.15.0006",
    reclamante: "Fernando Alves Souza",
    trt: "TRT-15",
    comarca: "Campinas",
    fase_atual: "Arquivado",
    status: "Arquivado",
    data_distribuicao: "2023-03-20",
    data_atualizacao: "2024-01-15"
  },
  {
    id: "7",
    numero_processo: "0007890-12.2024.5.02.0007",
    reclamante: "Luciana Ribeiro Dias",
    trt: "TRT-2",
    comarca: "São Paulo",
    fase_atual: "Audiência Inicial",
    status: "Ativo",
    data_distribuicao: "2024-03-01",
    data_atualizacao: "2024-03-10"
  },
  {
    id: "8",
    numero_processo: "0008901-23.2024.5.02.0008",
    reclamante: "Roberto Carvalho Neto",
    trt: "TRT-2",
    comarca: "Guarulhos",
    fase_atual: "Perícia",
    status: "Ativo",
    data_distribuicao: "2024-02-10",
    data_atualizacao: "2024-03-09"
  },
  {
    id: "9",
    numero_processo: "0009012-34.2023.5.15.0009",
    reclamante: "Patrícia Gomes Martins",
    trt: "TRT-15",
    comarca: "Sorocaba",
    fase_atual: "Encerrado",
    status: "Encerrado",
    data_distribuicao: "2023-06-15",
    data_atualizacao: "2024-02-20"
  },
  {
    id: "10",
    numero_processo: "0010123-45.2024.5.02.0010",
    reclamante: "Marcos Vinícius Rocha",
    trt: "TRT-2",
    comarca: "São Paulo",
    fase_atual: "Instrução",
    status: "Ativo",
    data_distribuicao: "2024-02-28",
    data_atualizacao: "2024-03-11"
  }
]

export const valoresRisco: ValorRisco[] = [
  {
    trimestre: "Q1",
    ano: 2024,
    principal_provavel: 1250000,
    correcao_provavel: 125000,
    juros_provavel: 87500,
    principal_possivel: 850000,
    correcao_possivel: 85000,
    juros_possivel: 59500,
    principal_remoto: 420000,
    correcao_remoto: 42000,
    juros_remoto: 29400
  },
  {
    trimestre: "Q2",
    ano: 2024,
    principal_provavel: 1450000,
    correcao_provavel: 145000,
    juros_provavel: 101500,
    principal_possivel: 920000,
    correcao_possivel: 92000,
    juros_possivel: 64400,
    principal_remoto: 380000,
    correcao_remoto: 38000,
    juros_remoto: 26600
  },
  {
    trimestre: "Q3",
    ano: 2024,
    principal_provavel: 1680000,
    correcao_provavel: 168000,
    juros_provavel: 117600,
    principal_possivel: 1050000,
    correcao_possivel: 105000,
    juros_possivel: 73500,
    principal_remoto: 450000,
    correcao_remoto: 45000,
    juros_remoto: 31500
  },
  {
    trimestre: "Q4",
    ano: 2024,
    principal_provavel: 1520000,
    correcao_provavel: 152000,
    juros_provavel: 106400,
    principal_possivel: 980000,
    correcao_possivel: 98000,
    juros_possivel: 68600,
    principal_remoto: 510000,
    correcao_remoto: 51000,
    juros_remoto: 35700
  },
  {
    trimestre: "Q1",
    ano: 2025,
    principal_provavel: 1380000,
    correcao_provavel: 138000,
    juros_provavel: 96600,
    principal_possivel: 890000,
    correcao_possivel: 89000,
    juros_possivel: 62300,
    principal_remoto: 470000,
    correcao_remoto: 47000,
    juros_remoto: 32900
  }
]

export const pedidosComparativos: PedidoComparativo[] = [
  { tipo: "Horas Extras", inicial: 85, sentenca: 62 },
  { tipo: "Insalubridade", inicial: 45, sentenca: 28 },
  { tipo: "Danos Morais", inicial: 72, sentenca: 35 },
  { tipo: "Periculosidade", inicial: 38, sentenca: 22 },
  { tipo: "Adicional Noturno", inicial: 56, sentenca: 48 },
  { tipo: "Verbas Rescisórias", inicial: 68, sentenca: 55 },
  { tipo: "FGTS", inicial: 52, sentenca: 45 },
  { tipo: "Férias", inicial: 41, sentenca: 38 }
]

export const topPedidos = [
  { tipo: "Horas Extras", total: 147, percentual: 92 },
  { tipo: "Danos Morais", total: 107, percentual: 67 },
  { tipo: "Verbas Rescisórias", total: 123, percentual: 77 },
  { tipo: "Adicional Noturno", total: 104, percentual: 65 },
  { tipo: "Insalubridade", total: 73, percentual: 46 }
]

export const kpis = {
  totalProcessosAtivos: 127,
  valorTotalRiscoProvavel: 1778400,
  topComarca: "São Paulo",
  processosRecebidosAno: 48,
  crescimentoAnual: 12.5
}

export const trts = ["TRT-2", "TRT-15", "TRT-1", "TRT-3", "TRT-4"]
export const comarcas = ["São Paulo", "Campinas", "Ribeirão Preto", "Santos", "Guarulhos", "Sorocaba"]
export const statusOptions = ["Ativo", "Encerrado", "Suspenso", "Arquivado"]
export const trimestres = ["Q1", "Q2", "Q3", "Q4"]
export const anos = [2023, 2024, 2025]
