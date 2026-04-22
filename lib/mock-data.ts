// Mock data based on tb_processo, tb_valores, tb_pedido_inicial, tb_pedido_sentenca

export interface Processo {
  numero_processo: string
  nome_reclamante: string
  fopag: string
  status_reclamante: "Ativo" | "Demitido" | "Aposentado" | string
  funcao_reclamante: string
  uf: string
  comarca: string
  vara: string
  data_ajuizamento: string
  data_arquivamento: string | null
  status: "Ativo" | "Encerrado" | "Suspenso" | "Arquivado" | string
  advogado_reclamante: string
  processo_apenso: string | null
  fase_processual: string
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
  numero_processo: string;
  deposito_recursal?: number | null;
  apolice?: boolean | null;
  custas_processuais?: number | null;
  deposito_judicial?: number | null;
  
  // Quarter Anterior - Provável
  provavel_principal_quarter_anterior?: number | null;
  provavel_correcao_quarter_anterior?: number | null;
  provavel_juros_quarter_anterior?: number | null;
  provavel_total_anterior?: number | null;
  
  // Quarter Atual - Provável
  provavel_principal_quarter_atual?: number | null;
  provavel_correcao_quarter_atual?: number | null;
  provavel_juros_quarter_atual?: number | null;
  provavel_total_atual?: number | null;
  
  // Quarter Atual - Possível
  possivel_principal_quarter_atual?: number | null;
  possivel_correcao_quarter_atual?: number | null;
  possivel_juros_quarter_atual?: number | null;
  possivel_total_atual?: number | null;
  
  // Quarter Atual - Remoto
  remoto_principal_quarter_atual?: number | null;
  remoto_correcao_quarter_atual?: number | null;
  remoto_juros_quarter_atual?: number | null;
  remoto_total_atual?: number | null;
  
  // Justificativas e Pagamentos
  justificativa_reavaliacao_quarter_anterior?: string | null;
  justificativa_reavaliacao_quarter_atual?: string | null;
  valor_pago_reclamante?: number | null;
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
    uf: "SP",
    comarca: "São Paulo",
    vara: "1ª Vara do Trabalho",
    data_ajuizamento: "2024-01-15",
    data_arquivamento: null,
    status: "Ativo",
    advogado_reclamante: "Dr. Carlos Mendes",
    processo_apenso: null,
    fase_processual: "Instrução"
  },
  {
    numero_processo: "0002345-67.2024.5.02.0002",
    nome_reclamante: "João Pedro Oliveira",
    fopag: "FOPAG-002",
    status_reclamante: "Demitido",
    funcao_reclamante: "Operador de Produção",
    uf: "SP",
    comarca: "Campinas",
    vara: "2ª Vara do Trabalho",
    data_ajuizamento: "2024-02-20",
    data_arquivamento: null,
    status: "Ativo",
    advogado_reclamante: "Dra. Fernanda Lima",
    processo_apenso: null,
    fase_processual: "Sentença"
  },
  {
    numero_processo: "0003456-78.2024.5.15.0003",
    nome_reclamante: "Ana Clara Ferreira",
    fopag: "FOPAG-003",
    status_reclamante: "Demitido",
    funcao_reclamante: "Analista de RH",
    uf: "SP",
    comarca: "Ribeirão Preto",
    vara: "3ª Vara do Trabalho",
    data_ajuizamento: "2023-11-05",
    data_arquivamento: null,
    status: "Ativo",
    advogado_reclamante: "Dr. Roberto Alves",
    processo_apenso: "0001234-56.2024.5.02.0001",
    fase_processual: "Recurso Ordinário"
  },
  {
    numero_processo: "0004567-89.2023.5.02.0004",
    nome_reclamante: "Carlos Eduardo Lima",
    fopag: "FOPAG-004",
    status_reclamante: "Demitido",
    funcao_reclamante: "Supervisor de Logística",
    uf: "SP",
    comarca: "São Paulo",
    vara: "4ª Vara do Trabalho",
    data_ajuizamento: "2023-08-12",
    data_arquivamento: null,
    status: "Ativo",
    advogado_reclamante: "Dr. Paulo Rodrigues",
    processo_apenso: null,
    fase_processual: "Execução"
  },
  {
    numero_processo: "0005678-90.2024.5.02.0005",
    nome_reclamante: "Beatriz Mendes Costa",
    fopag: "FOPAG-005",
    status_reclamante: "Ativo",
    funcao_reclamante: "Assistente Financeiro",
    uf: "SP",
    comarca: "Santos",
    vara: "1ª Vara do Trabalho",
    data_ajuizamento: "2024-01-08",
    data_arquivamento: null,
    status: "Suspenso",
    advogado_reclamante: "Dra. Mariana Souza",
    processo_apenso: null,
    fase_processual: "Acordo"
  },
  {
    numero_processo: "0006789-01.2023.5.15.0006",
    nome_reclamante: "Fernando Alves Souza",
    fopag: "FOPAG-006",
    status_reclamante: "Demitido",
    funcao_reclamante: "Técnico de Manutenção",
    uf: "SP",
    comarca: "Campinas",
    vara: "5ª Vara do Trabalho",
    data_ajuizamento: "2023-03-20",
    data_arquivamento: "2024-01-15",
    status: "Arquivado",
    advogado_reclamante: "Dr. André Santos",
    processo_apenso: null,
    fase_processual: "Arquivado"
  },
  {
    numero_processo: "0007890-12.2024.5.02.0007",
    nome_reclamante: "Luciana Ribeiro Dias",
    fopag: "FOPAG-007",
    status_reclamante: "Demitido",
    funcao_reclamante: "Coordenadora de Vendas",
    uf: "SP",
    comarca: "São Paulo",
    vara: "6ª Vara do Trabalho",
    data_ajuizamento: "2024-03-01",
    data_arquivamento: null,
    status: "Ativo",
    advogado_reclamante: "Dr. Ricardo Pereira",
    processo_apenso: null,
    fase_processual: "Audiência Inicial"
  },
  {
    numero_processo: "0008901-23.2024.5.02.0008",
    nome_reclamante: "Roberto Carvalho Neto",
    fopag: "FOPAG-008",
    status_reclamante: "Aposentado",
    funcao_reclamante: "Gerente de Operações",
    uf: "SP",
    comarca: "Guarulhos",
    vara: "2ª Vara do Trabalho",
    data_ajuizamento: "2024-02-10",
    data_arquivamento: null,
    status: "Ativo",
    advogado_reclamante: "Dra. Juliana Costa",
    processo_apenso: null,
    fase_processual: "Perícia"
  },
  {
    numero_processo: "0009012-34.2023.5.15.0009",
    nome_reclamante: "Patrícia Gomes Martins",
    fopag: "FOPAG-009",
    status_reclamante: "Demitido",
    funcao_reclamante: "Analista de Sistemas",
    uf: "SP",
    comarca: "Sorocaba",
    vara: "1ª Vara do Trabalho",
    data_ajuizamento: "2023-06-15",
    data_arquivamento: "2024-02-20",
    status: "Encerrado",
    advogado_reclamante: "Dr. Marcos Oliveira",
    processo_apenso: null,
    fase_processual: "Encerrado"
  },
  {
    numero_processo: "0010123-45.2024.5.02.0010",
    nome_reclamante: "Marcos Vinícius Rocha",
    fopag: "FOPAG-010",
    status_reclamante: "Demitido",
    funcao_reclamante: "Engenheiro de Produção",
    uf: "SP",
    comarca: "São Paulo",
    vara: "7ª Vara do Trabalho",
    data_ajuizamento: "2024-02-28",
    data_arquivamento: null,
    status: "Ativo",
    advogado_reclamante: "Dra. Camila Ferreira",
    processo_apenso: null,
    fase_processual: "Instrução"
  },
  {
    numero_processo: "0011234-56.2024.5.02.0011",
    nome_reclamante: "Renata Cristina Almeida",
    fopag: "FOPAG-011",
    status_reclamante: "Demitido",
    funcao_reclamante: "Recepcionista",
    uf: "SP",
    comarca: "São Paulo",
    vara: "8ª Vara do Trabalho",
    data_ajuizamento: "2024-03-05",
    data_arquivamento: null,
    status: "Ativo",
    advogado_reclamante: "Dr. Thiago Moreira",
    processo_apenso: null,
    fase_processual: "Citação"
  },
  {
    numero_processo: "0012345-67.2024.5.15.0012",
    nome_reclamante: "Gustavo Henrique Prado",
    fopag: "FOPAG-012",
    status_reclamante: "Ativo",
    funcao_reclamante: "Motorista",
    uf: "SP",
    comarca: "Piracicaba",
    vara: "1ª Vara do Trabalho",
    data_ajuizamento: "2024-01-22",
    data_arquivamento: null,
    status: "Ativo",
    advogado_reclamante: "Dra. Letícia Ramos",
    processo_apenso: null,
    fase_processual: "Instrução"
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

// Valores de risco por processo (schema consolidado Q-1 e Q atual)
export const valoresRisco: ValorRisco[] = [
  {
    numero_processo: "0001234-56.2024.5.02.0001",
    provavel_principal_quarter_anterior: 85000,
    provavel_correcao_quarter_anterior: 8500,
    provavel_juros_quarter_anterior: 5950,
    provavel_total_anterior: 99450,
    provavel_principal_quarter_atual: 88000,
    provavel_correcao_quarter_atual: 9200,
    provavel_juros_quarter_atual: 6440,
    provavel_total_atual: 103640,
    possivel_total_atual: 55330,
    remoto_total_atual: 30590
  },
  {
    numero_processo: "0002345-67.2024.5.02.0002",
    provavel_total_anterior: 140400,
    provavel_total_atual: 155000,
    possivel_total_atual: 76050,
    remoto_total_atual: 40950
  },
  {
    numero_processo: "0003456-78.2024.5.15.0003",
    provavel_total_anterior: 111150,
    provavel_total_atual: 105000,
    possivel_total_atual: 64350,
    remoto_total_atual: 35100
  },
  {
    numero_processo: "0004567-89.2023.5.02.0004",
    provavel_total_anterior: 292500,
    provavel_total_atual: 310000,
    possivel_total_atual: 175500,
    remoto_total_atual: 93600
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

export const ufs = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"]
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
