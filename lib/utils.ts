import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const LABEL_MAP: Record<string, string> = {
  "EXECUCAO": "EXECUÇÃO",
  "ACORDAO": "ACÓRDÃO",
  "REINTEGRACAO": "REINTEGRAÇÃO",
  "RESCISAO INDIRETA": "RESCISÃO INDIRETA",
  "HONORARIOS ADVOCATICIOS": "HONORÁRIOS ADVOCATÍCIOS",
  "VINCULO EMPREGATICIO": "VÍNCULO EMPREGATÍCIO",
  "ACUMULO DE FUNCAO": "ACÚMULO DE FUNÇÃO",
  "EQUIPARACAO SALARIAL": "EQUIPARAÇÃO SALARIAL",
  "DANOS MORAIS": "DANOS MORAIS",
  "DANOS MATERIAIS": "DANOS MATERIAIS",
  "HORAS EXTRAS": "HORAS EXTRAS",
  "INTRAJORNADA": "INTRAJORNADA",
  "HORAS IN ITINERE": "HORAS IN ITINERE",
  "PERICULOSIDADE": "PERICULOSIDADE",
  "INSALUBRIDADE": "INSALUBRIDADE",
  "PRIMEIRA INSTANCIA": "1ª INSTÂNCIA",
  "SEGUNDA INSTANCIA": "2ª INSTÂNCIA",
  "TERCEIRA INSTANCIA": "3ª INSTÂNCIA",
  "ARQUIVADO": "ARQUIVADO",
  "ATIVO": "ATIVO",
  "PROCEDENTE": "PROCEDENTE",
  "IMPROCEDENTE": "IMPROCEDENTE",
  "PARCIALMENTE PROCEDENTE": "PARCIALMENTE PROCEDENTE",
  "ACORDO": "ACORDO",
  "SOBRESTADO": "SOBRESTADO",
  "CONHECIMENTO": "CONHECIMENTO",
  "RECURSAL": "RECURSAL",
  "EXTINTO SEM RESOLUÇÃO": "EXTINTO SEM RESOLUÇÃO",
  "EXTINTO COM RESOLUÇÃO": "EXTINTO COM RESOLUÇÃO",
  "AGUARDANDO JULGAMENTO": "AGUARDANDO JULGAMENTO",
  "SENTENÇA": "SENTENÇA",
  "RECLAMACAO TRABALHISTA": "RECLAMAÇÃO TRABALHISTA",
  "EXECUCAO PROVISORIA": "EXECUÇÃO PROVISÓRIA",
  "ACAO RESCISORIA": "AÇÃO RESCISÓRIA",
  "ENCERRADO": "ENCERRADO"
}

export function formatLabel(value: any): string {
  if (value === null || value === undefined) return ""
  
  const original = String(value).trim()
  const normalized = original.toUpperCase().replace(/\s+/g, " ")
  
  if (LABEL_MAP[normalized]) {
    return LABEL_MAP[normalized]
  }

  // Por padrão, retorna tudo em caixa alta para manter o padrão solicitado (Ranking, Tabelas, etc)
  return normalized
}
