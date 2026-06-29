export const COLLECTION_OWNER = "Coordenação Administrativa";

export const profiles = [
  ["ADMINISTRADOR", "Administrador"],
  ["HEAD_OPERACOES", "Head de Operações"],
  ["COORDENACAO_ADMINISTRATIVA", "Coordenação Administrativa"],
  ["CONSELHO_CONSULTIVO", "Conselho Consultivo"],
  ["USUARIO_PERSONALIZADO", "Usuário personalizado"],
] as const;

export const areas = [
  ["FINANCEIRO", "Financeiro"],
  ["COMERCIAL", "Comercial"],
  ["RH", "RH"],
  ["OPERACOES", "Operações"],
  ["MARKETING", "Marketing"],
  ["ADMINISTRATIVO", "Administrativo"],
  ["RELACIONAMENTO_RETENCAO", "Relacionamento e Retenção"],
  ["QUALIDADE_ASSISTENCIAL", "Qualidade Assistencial"],
] as const;

export const perspectives = [
  ["FINANCEIRA", "Financeira"],
  ["CLIENTES", "Clientes"],
  ["PROCESSOS_INTERNOS", "Processos Internos"],
  ["PESSOAS_E_CULTURA", "Pessoas e Cultura"],
] as const;

export const indicatorTypes = [
  ["EFICIENCIA", "Eficiência"],
  ["EFICACIA", "Eficácia"],
  ["EFETIVIDADE", "Efetividade"],
  ["QUALIDADE", "Qualidade"],
] as const;

export const indicatorLevels = [
  ["ESTRATEGICO", "Estratégico"],
  ["TATICO", "Tático"],
  ["OPERACIONAL", "Operacional"],
] as const;

export const polarities = [
  ["MAIOR_MELHOR", "Quanto maior, melhor"],
  ["MENOR_MELHOR", "Quanto menor, melhor"],
] as const;

export const frequencies = [
  ["DIARIA", "Diária"],
  ["SEMANAL", "Semanal"],
  ["MENSAL", "Mensal"],
  ["TRIMESTRAL", "Trimestral"],
  ["SEMESTRAL", "Semestral"],
  ["ANUAL", "Anual"],
] as const;

export const statuses = [
  ["ATIVO", "Ativo"],
  ["EM_REVISAO", "Em revisão"],
  ["DESCONTINUADO", "Descontinuado"],
] as const;

export const trafficLights = [
  ["VERDE", "Verde"],
  ["AMARELO", "Amarelo"],
  ["VERMELHO", "Vermelho"],
] as const;

export const features = [
  ["dashboard", "Dashboard Executivo", "/"],
  ["indicadores", "Banco de Indicadores e Fichas", "/indicadores"],
  ["metas", "Metas", "/metas"],
  ["resultados", "Resultados", "/resultados"],
  ["lancamentos", "Lançamento Mensal", "/lancamentos"],
  ["scorecard", "Scorecard por Área", "/scorecard"],
  ["bsc", "Matriz BSC", "/bsc"],
  ["okrs", "OKRs", "/okrs"],
  ["head-operacoes", "Head de Operações", "/head-operacoes"],
  ["conselho", "Conselho Consultivo", "/conselho"],
  ["ia-automacao", "IA e Automação", "/ia-automacao"],
  ["historico", "Histórico de Alterações", "/historico"],
  ["exportacoes", "Exportações Excel/PDF", "/export"],
  ["usuarios", "Administração de Usuários", "/usuarios"],
] as const;

export type FeatureKey = (typeof features)[number][0];
export const allFeatureKeys = features.map(([key]) => key);

export const rolePermissions: Record<string, string[]> = {
  ADMINISTRADOR: allFeatureKeys,
  COORDENACAO_ADMINISTRATIVA: ["dashboard", "indicadores", "metas", "resultados", "lancamentos", "scorecard", "bsc", "okrs", "ia-automacao", "historico", "exportacoes"],
  HEAD_OPERACOES: ["dashboard", "indicadores", "resultados", "scorecard", "bsc", "okrs", "head-operacoes", "ia-automacao", "exportacoes"],
  CONSELHO_CONSULTIVO: ["dashboard", "indicadores", "scorecard", "bsc", "okrs", "conselho", "exportacoes"],
  USUARIO_PERSONALIZADO: ["dashboard"],
};
