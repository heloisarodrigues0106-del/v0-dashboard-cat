import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const LABEL_MAP: Record<string, string> = {
  "EXECUCAO": "Execução",
  "ACORDAO": "Acórdão",
  "REINTEGRACAO": "Reintegração",
  "RESCISAO INDIRETA": "Rescisão Indireta",
  "HONORARIOS ADVOCATICIOS": "Honorários Advocatícios",
  "VINCULO EMPREGATICIO": "Vínculo Empregatício",
  "ACUMULO DE FUNCAO": "Acúmulo de Função",
  "EQUIPARACAO SALARIAL": "Equiparação Salarial",
  "DANOS MORAIS": "Danos Morais",
  "DANOS MATERIAIS": "Danos Materiais",
  "HORAS EXTRAS": "Horas Extras",
  "INTRAJORNADA": "Intrajornada",
  "HORAS IN ITINERE": "Horas in Itinere",
  "PERICULOSIDADE": "Periculosidade",
  "INSALUBRIDADE": "Insalubridade",
  "PRIMEIRA INSTANCIA": "1ª Instância",
  "SEGUNDA INSTANCIA": "2ª Instância",
  "TERCEIRA INSTANCIA": "3ª Instância",
  "ARQUIVADO": "Arquivado",
  "ATIVO": "Ativo",
  "PROCEDENTE": "Procedente",
  "IMPROCEDENTE": "Improcedente",
  "PARCIALMENTE PROCEDENTE": "Parcialmente Procedente",
  "ACORDO": "Acordo",
  "SOBRESTADO": "Sobrestado",
  "CONHECIMENTO": "Conhecimento",
  "RECURSAL": "Recursal",
  "EXTINTO SEM RESOLUÇÃO": "Extinto sem Resolução",
  "EXTINTO COM RESOLUÇÃO": "Extinto com Resolução",
  "AGUARDANDO JULGAMENTO": "Aguardando Julgamento",
  "SENTENÇA": "Sentença"
}

export function formatLabel(value: any): string {
  if (value === null || value === undefined) return ""
  
  const original = String(value).trim()
  const normalized = original.toUpperCase().replace(/\s+/g, " ")
  
  if (LABEL_MAP[normalized]) {
    return LABEL_MAP[normalized]
  }

  // Capitalização padrão: Primeira letra maiúscula, restante minúscula
  if (original.length <= 1) return original.toUpperCase()
  return original.charAt(0).toUpperCase() + original.slice(1).toLowerCase()
}
