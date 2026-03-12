// Mock data based on tb_processo, tb_valores, tb_pedido_inicial, tb_pedido_sentenca

export interface Processo {
  numero_processo: string
  nome_reclamante: string
  fopag: string
  status_reclamante: "Ativo" | "Demitido" | "Aposentado"
  funcao_reclamante: string
  trt: string
  comarca: string
  vara: string
  data_recebimento: string
  data_arquivamento: string | null
  status_processo: "Ativo" | "Encerrado" | "Suspenso" | "Arquivado"
  advogado_reclamante: string
  processo_apenso: string | null
  fase_processo_atual: string
}

export interface PedidoInicial {
  numero_processo: string
  do_at: boolean
  reintegracao: boolean
  periculosidade: boolean
  insalubridade: boolean
  danos_morais: boolean
  horas_extras: boolean
  intrajornada: boolean
  horas_itinere: boolean
  acumulo_funcao: boolean
  equip_salarial: boolean
  rec_vinculo: boolean
  outros: string | null
}

export interface PedidoSentenca {
  numero_processo: string
  do_at: boolean
  reintegracao: boolean
  periculosidade: boolean
  insalubridade: boolean
  danos_morais: boolean
  horas_extras: boolean
  intrajornada: boolean
  horas_itinere: boolean
  acumulo_funcao: boolean
  equip_salarial: boolean
  rec_vinculo: boolean
  outros: string | null
}

export interface ValorRisco {
  numero_processo: string
  quarter: string
  ano: number
  principal_provavel: number
  correcao_monetaria_provavel: number
  juros_provavel: number
  principal_possivel: number
  correcao_monetaria_possivel: number
  juros_possivel: number
  principal_remoto: number
  correcao_monetaria_remoto: number
  juros_remoto: number
}

export interface PedidoComparativo {
  tipo: string
  inicial: number
  sentenca: number
}

// Processos completos
export const processos: Processo[] = [
  {
    numero_processo: "0001234-56.2024.5.02.0001",
    nome_reclamante: "Maria Silva Santos",
    fopag: "FOPAG-001",
    status_reclamante: "Demitido",
    funcao_reclamante: "Auxiliar Administrativo",
    trt: "TRT-2",
    comarca: "São Paulo",
    vara: "1ª Vara do Trabalho",
    data_recebimento: "2024-01-15",
    data_arquivamento: null,
    status_processo: "Ativo",
    advogado_reclamante: "Dr. Carlos Mendes",
    processo_apenso: null,
    fase_processo_atual: "Instrução"
  },
  {
    numero_processo: "0002345-67.2024.5.02.0002",
    nome_reclamante: "João Pedro Oliveira",
    fopag: "FOPAG-002",
    status_reclamante: "Demitido",
    funcao_reclamante: "Operador de Produção",
    trt: "TRT-2",
    comarca: "Campinas",
    vara: "2ª Vara do Trabalho",
    data_recebimento: "2024-02-20",
    data_arquivamento: null,
    status_processo: "Ativo",
    advogado_reclamante: "Dra. Fernanda Lima",
    processo_apenso: null,
    fase_processo_atual: "Sentença"
  },
  {
    numero_processo: "0003456-78.2024.5.15.0003",
    nome_reclamante: "Ana Clara Ferreira",
    fopag: "FOPAG-003",
    status_reclamante: "Demitido",
    funcao_reclamante: "Analista de RH",
    trt: "TRT-15",
    comarca: "Ribeirão Preto",
    vara: "3ª Vara do Trabalho",
    data_recebimento: "2023-11-05",
    data_arquivamento: null,
    status_processo: "Ativo",
    advogado_reclamante: "Dr. Roberto Alves",
    processo_apenso: "0001234-56.2024.5.02.0001",
    fase_processo_atual: "Recurso Ordinário"
  },
  {
    numero_processo: "0004567-89.2023.5.02.0004",
    nome_reclamante: "Carlos Eduardo Lima",
    fopag: "FOPAG-004",
    status_reclamante: "Demitido",
    funcao_reclamante: "Supervisor de Logística",
    trt: "TRT-2",
    comarca: "São Paulo",
    vara: "4ª Vara do Trabalho",
    data_recebimento: "2023-08-12",
    data_arquivamento: null,
    status_processo: "Ativo",
    advogado_reclamante: "Dr. Paulo Rodrigues",
    processo_apenso: null,
    fase_processo_atual: "Execução"
  },
  {
    numero_processo: "0005678-90.2024.5.02.0005",
    nome_reclamante: "Beatriz Mendes Costa",
    fopag: "FOPAG-005",
    status_reclamante: "Ativo",
    funcao_reclamante: "Assistente Financeiro",
    trt: "TRT-2",
    comarca: "Santos",
    vara: "1ª Vara do Trabalho",
    data_recebimento: "2024-01-08",
    data_arquivamento: null,
    status_processo: "Suspenso",
    advogado_reclamante: "Dra. Mariana Souza",
    processo_apenso: null,
    fase_processo_atual: "Acordo"
  },
  {
    numero_processo: "0006789-01.2023.5.15.0006",
    nome_reclamante: "Fernando Alves Souza",
    fopag: "FOPAG-006",
    status_reclamante: "Demitido",
    funcao_reclamante: "Técnico de Manutenção",
    trt: "TRT-15",
    comarca: "Campinas",
    vara: "5ª Vara do Trabalho",
    data_recebimento: "2023-03-20",
    data_arquivamento: "2024-01-15",
    status_processo: "Arquivado",
    advogado_reclamante: "Dr. André Santos",
    processo_apenso: null,
    fase_processo_atual: "Arquivado"
  },
  {
    numero_processo: "0007890-12.2024.5.02.0007",
    nome_reclamante: "Luciana Ribeiro Dias",
    fopag: "FOPAG-007",
    status_reclamante: "Demitido",
    funcao_reclamante: "Coordenadora de Vendas",
    trt: "TRT-2",
    comarca: "São Paulo",
    vara: "6ª Vara do Trabalho",
    data_recebimento: "2024-03-01",
    data_arquivamento: null,
    status_processo: "Ativo",
    advogado_reclamante: "Dr. Ricardo Pereira",
    processo_apenso: null,
    fase_processo_atual: "Audiência Inicial"
  },
  {
    numero_processo: "0008901-23.2024.5.02.0008",
    nome_reclamante: "Roberto Carvalho Neto",
    fopag: "FOPAG-008",
    status_reclamante: "Aposentado",
    funcao_reclamante: "Gerente de Operações",
    trt: "TRT-2",
    comarca: "Guarulhos",
    vara: "2ª Vara do Trabalho",
    data_recebimento: "2024-02-10",
    data_arquivamento: null,
    status_processo: "Ativo",
    advogado_reclamante: "Dra. Juliana Costa",
    processo_apenso: null,
    fase_processo_atual: "Perícia"
  },
  {
    numero_processo: "0009012-34.2023.5.15.0009",
    nome_reclamante: "Patrícia Gomes Martins",
    fopag: "FOPAG-009",
    status_reclamante: "Demitido",
    funcao_reclamante: "Analista de Sistemas",
    trt: "TRT-15",
    comarca: "Sorocaba",
    vara: "1ª Vara do Trabalho",
    data_recebimento: "2023-06-15",
    data_arquivamento: "2024-02-20",
    status_processo: "Encerrado",
    advogado_reclamante: "Dr. Marcos Oliveira",
    processo_apenso: null,
    fase_processo_atual: "Encerrado"
  },
  {
    numero_processo: "0010123-45.2024.5.02.0010",
    nome_reclamante: "Marcos Vinícius Rocha",
    fopag: "FOPAG-010",
    status_reclamante: "Demitido",
    funcao_reclamante: "Engenheiro de Produção",
    trt: "TRT-2",
    comarca: "São Paulo",
    vara: "7ª Vara do Trabalho",
    data_recebimento: "2024-02-28",
    data_arquivamento: null,
    status_processo: "Ativo",
    advogado_reclamante: "Dra. Camila Ferreira",
    processo_apenso: null,
    fase_processo_atual: "Instrução"
  },
  {
    numero_processo: "0011234-56.2024.5.02.0011",
    nome_reclamante: "Renata Cristina Almeida",
    fopag: "FOPAG-011",
    status_reclamante: "Demitido",
    funcao_reclamante: "Recepcionista",
    trt: "TRT-2",
    comarca: "São Paulo",
    vara: "8ª Vara do Trabalho",
    data_recebimento: "2024-03-05",
    data_arquivamento: null,
    status_processo: "Ativo",
    advogado_reclamante: "Dr. Thiago Moreira",
    processo_apenso: null,
    fase_processo_atual: "Citação"
  },
  {
    numero_processo: "0012345-67.2024.5.15.0012",
    nome_reclamante: "Gustavo Henrique Prado",
    fopag: "FOPAG-012",
    status_reclamante: "Ativo",
    funcao_reclamante: "Motorista",
    trt: "TRT-15",
    comarca: "Piracicaba",
    vara: "1ª Vara do Trabalho",
    data_recebimento: "2024-01-22",
    data_arquivamento: null,
    status_processo: "Ativo",
    advogado_reclamante: "Dra. Letícia Ramos",
    processo_apenso: null,
    fase_processo_atual: "Instrução"
  }
]

// Pedidos iniciais por processo
export const pedidosIniciais: PedidoInicial[] = [
  {
    numero_processo: "0001234-56.2024.5.02.0001",
    do_at: true,
    reintegracao: false,
    periculosidade: false,
    insalubridade: true,
    danos_morais: true,
    horas_extras: true,
    intrajornada: true,
    horas_itinere: false,
    acumulo_funcao: false,
    equip_salarial: false,
    rec_vinculo: false,
    outros: null
  },
  {
    numero_processo: "0002345-67.2024.5.02.0002",
    do_at: false,
    reintegracao: false,
    periculosidade: true,
    insalubridade: false,
    danos_morais: true,
    horas_extras: true,
    intrajornada: false,
    horas_itinere: true,
    acumulo_funcao: true,
    equip_salarial: false,
    rec_vinculo: false,
    outros: "Adicional noturno"
  },
  {
    numero_processo: "0003456-78.2024.5.15.0003",
    do_at: false,
    reintegracao: true,
    periculosidade: false,
    insalubridade: false,
    danos_morais: true,
    horas_extras: true,
    intrajornada: true,
    horas_itinere: false,
    acumulo_funcao: false,
    equip_salarial: true,
    rec_vinculo: false,
    outros: null
  },
  {
    numero_processo: "0004567-89.2023.5.02.0004",
    do_at: true,
    reintegracao: false,
    periculosidade: true,
    insalubridade: true,
    danos_morais: true,
    horas_extras: true,
    intrajornada: true,
    horas_itinere: true,
    acumulo_funcao: true,
    equip_salarial: false,
    rec_vinculo: false,
    outros: "FGTS não depositado"
  },
  {
    numero_processo: "0005678-90.2024.5.02.0005",
    do_at: false,
    reintegracao: false,
    periculosidade: false,
    insalubridade: false,
    danos_morais: true,
    horas_extras: true,
    intrajornada: false,
    horas_itinere: false,
    acumulo_funcao: false,
    equip_salarial: true,
    rec_vinculo: true,
    outros: null
  }
]

// Pedidos deferidos em sentença
export const pedidosSentenca: PedidoSentenca[] = [
  {
    numero_processo: "0002345-67.2024.5.02.0002",
    do_at: false,
    reintegracao: false,
    periculosidade: true,
    insalubridade: false,
    danos_morais: false,
    horas_extras: true,
    intrajornada: false,
    horas_itinere: false,
    acumulo_funcao: true,
    equip_salarial: false,
    rec_vinculo: false,
    outros: null
  },
  {
    numero_processo: "0006789-01.2023.5.15.0006",
    do_at: false,
    reintegracao: false,
    periculosidade: false,
    insalubridade: false,
    danos_morais: false,
    horas_extras: true,
    intrajornada: true,
    horas_itinere: false,
    acumulo_funcao: false,
    equip_salarial: false,
    rec_vinculo: false,
    outros: null
  },
  {
    numero_processo: "0009012-34.2023.5.15.0009",
    do_at: false,
    reintegracao: false,
    periculosidade: false,
    insalubridade: true,
    danos_morais: true,
    horas_extras: true,
    intrajornada: false,
    horas_itinere: false,
    acumulo_funcao: false,
    equip_salarial: false,
    rec_vinculo: false,
    outros: null
  }
]

// Valores de risco por processo e trimestre
export const valoresRisco: ValorRisco[] = [
  {
    numero_processo: "0001234-56.2024.5.02.0001",
    quarter: "Q1",
    ano: 2024,
    principal_provavel: 85000,
    correcao_monetaria_provavel: 8500,
    juros_provavel: 5950,
    principal_possivel: 45000,
    correcao_monetaria_possivel: 4500,
    juros_possivel: 3150,
    principal_remoto: 25000,
    correcao_monetaria_remoto: 2500,
    juros_remoto: 1750
  },
  {
    numero_processo: "0002345-67.2024.5.02.0002",
    quarter: "Q1",
    ano: 2024,
    principal_provavel: 120000,
    correcao_monetaria_provavel: 12000,
    juros_provavel: 8400,
    principal_possivel: 65000,
    correcao_monetaria_possivel: 6500,
    juros_possivel: 4550,
    principal_remoto: 35000,
    correcao_monetaria_remoto: 3500,
    juros_remoto: 2450
  },
  {
    numero_processo: "0003456-78.2024.5.15.0003",
    quarter: "Q1",
    ano: 2024,
    principal_provavel: 95000,
    correcao_monetaria_provavel: 9500,
    juros_provavel: 6650,
    principal_possivel: 55000,
    correcao_monetaria_possivel: 5500,
    juros_possivel: 3850,
    principal_remoto: 30000,
    correcao_monetaria_remoto: 3000,
    juros_remoto: 2100
  },
  {
    numero_processo: "0004567-89.2023.5.02.0004",
    quarter: "Q1",
    ano: 2024,
    principal_provavel: 250000,
    correcao_monetaria_provavel: 25000,
    juros_provavel: 17500,
    principal_possivel: 150000,
    correcao_monetaria_possivel: 15000,
    juros_possivel: 10500,
    principal_remoto: 80000,
    correcao_monetaria_remoto: 8000,
    juros_remoto: 5600
  },
  {
    numero_processo: "0001234-56.2024.5.02.0001",
    quarter: "Q2",
    ano: 2024,
    principal_provavel: 88000,
    correcao_monetaria_provavel: 9200,
    juros_provavel: 6440,
    principal_possivel: 47000,
    correcao_monetaria_possivel: 4900,
    juros_possivel: 3430,
    principal_remoto: 26000,
    correcao_monetaria_remoto: 2700,
    juros_remoto: 1890
  },
  {
    numero_processo: "0007890-12.2024.5.02.0007",
    quarter: "Q1",
    ano: 2024,
    principal_provavel: 75000,
    correcao_monetaria_provavel: 7500,
    juros_provavel: 5250,
    principal_possivel: 40000,
    correcao_monetaria_possivel: 4000,
    juros_possivel: 2800,
    principal_remoto: 20000,
    correcao_monetaria_remoto: 2000,
    juros_remoto: 1400
  },
  {
    numero_processo: "0008901-23.2024.5.02.0008",
    quarter: "Q1",
    ano: 2024,
    principal_provavel: 180000,
    correcao_monetaria_provavel: 18000,
    juros_provavel: 12600,
    principal_possivel: 95000,
    correcao_monetaria_possivel: 9500,
    juros_possivel: 6650,
    principal_remoto: 50000,
    correcao_monetaria_remoto: 5000,
    juros_remoto: 3500
  },
  {
    numero_processo: "0010123-45.2024.5.02.0010",
    quarter: "Q1",
    ano: 2024,
    principal_provavel: 110000,
    correcao_monetaria_provavel: 11000,
    juros_provavel: 7700,
    principal_possivel: 60000,
    correcao_monetaria_possivel: 6000,
    juros_possivel: 4200,
    principal_remoto: 32000,
    correcao_monetaria_remoto: 3200,
    juros_remoto: 2240
  }
]

// Dados agregados para gráficos do dashboard
export const valoresRiscoAgregados = [
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
export const comarcas = ["São Paulo", "Campinas", "Ribeirão Preto", "Santos", "Guarulhos", "Sorocaba", "Piracicaba"]
export const varas = [
  "1ª Vara do Trabalho",
  "2ª Vara do Trabalho",
  "3ª Vara do Trabalho",
  "4ª Vara do Trabalho",
  "5ª Vara do Trabalho",
  "6ª Vara do Trabalho",
  "7ª Vara do Trabalho",
  "8ª Vara do Trabalho"
]
export const statusOptions = ["Ativo", "Encerrado", "Suspenso", "Arquivado"]
export const statusReclamanteOptions = ["Ativo", "Demitido", "Aposentado"]
export const fasesProcesso = [
  "Citação",
  "Audiência Inicial",
  "Instrução",
  "Perícia",
  "Sentença",
  "Recurso Ordinário",
  "Execução",
  "Acordo",
  "Arquivado",
  "Encerrado"
]
export const trimestres = ["Q1", "Q2", "Q3", "Q4"]
export const anos = [2023, 2024, 2025]

// Labels dos pedidos para exibição
export const pedidoLabels: Record<string, string> = {
  do_at: "DO/AT",
  reintegracao: "Reintegração",
  periculosidade: "Periculosidade",
  insalubridade: "Insalubridade",
  danos_morais: "Danos Morais",
  horas_extras: "Horas Extras",
  intrajornada: "Intrajornada",
  horas_itinere: "Horas In Itinere",
  acumulo_funcao: "Acúmulo de Função",
  equip_salarial: "Equiparação Salarial",
  rec_vinculo: "Reconhecimento de Vínculo",
  outros: "Outros"
}
