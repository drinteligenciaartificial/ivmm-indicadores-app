export const recruitmentStages = [
  ["INSCRICAO", "Inscrição"],
  ["TRIAGEM", "Triagem"],
  ["ANALISE_IA", "Análise IA"],
  ["ENTREVISTA_RH", "Entrevista RH"],
  ["ENTREVISTA_GESTOR", "Entrevista Gestor"],
  ["ASSESSMENT", "Assessment"],
  ["FINALISTA", "Finalista"],
  ["PROPOSTA", "Proposta"],
  ["ADMISSAO", "Admissão"],
  ["ONBOARDING", "Onboarding"],
  ["EXPERIENCIA_30", "30 dias"],
  ["EXPERIENCIA_60", "60 dias"],
  ["EXPERIENCIA_90", "90 dias"],
  ["EFETIVADO", "Efetivado"],
  ["BANCO_TALENTOS", "Banco de Talentos"],
  ["ENCERRADO", "Encerrado"],
] as const;

export const vacancyStatuses = [
  ["RASCUNHO", "Rascunho"],
  ["ABERTA", "Aberta"],
  ["PAUSADA", "Pausada"],
  ["EM_SELECAO", "Em seleção"],
  ["FINALISTA", "Finalista"],
  ["PREENCHIDA", "Preenchida"],
  ["CANCELADA", "Cancelada"],
  ["ARQUIVADA", "Arquivada"],
] as const;

export const interviewQuestions = [
  "Conte um pouco sobre sua trajetória profissional.",
  "Como você organiza prioridades quando há muitos atendimentos ao mesmo tempo?",
  "Descreva uma situação em que precisou lidar com um cliente ou paciente insatisfeito.",
  "Como você reage quando percebe que cometeu um erro operacional?",
  "Que evidências mostram sua facilidade com sistemas, WhatsApp, CRM ou planilhas?",
  "Como você prefere receber feedback?",
  "O que significa, na prática, lealdade e dedicação no ambiente de trabalho?",
  "Que tipo de rotina faz você performar melhor?",
  "Descreva uma situação usando contexto, ação e resultado.",
];

export const assessmentExercises = [
  "Simulação de recepção com chegada simultânea de pacientes.",
  "Organização de agenda com conflito de horários.",
  "Resposta a mensagem no WhatsApp com comunicação clara e acolhedora.",
  "Registro de lead no CRM com conferência de dados obrigatórios.",
];

export function stageLabel(stage: string) {
  return recruitmentStages.find(([value]) => value === stage)?.[1] ?? stage;
}

export function vacancyStatusLabel(status: string) {
  return vacancyStatuses.find(([value]) => value === status)?.[1] ?? status;
}

export function scoreColor(score: number) {
  if (score >= 80) return "VERDE";
  if (score >= 70) return "AMARELO";
  if (score >= 60) return "LARANJA";
  return "VERMELHO";
}

export function scoreLabel(score: number) {
  const color = scoreColor(score);
  if (color === "VERDE") return "Aderência forte";
  if (color === "AMARELO") return "Aderência moderada";
  if (color === "LARANJA") return "Ponto de atenção";
  return "Evidência insuficiente";
}

export function weightedScore(items: { note: number; weight: number }[]) {
  const active = items.filter((item) => item.weight > 0);
  const weightSum = active.reduce((sum, item) => sum + item.weight, 0);
  if (!weightSum) return 0;
  const score = active.reduce((sum, item) => sum + (item.note / 5) * item.weight, 0) / weightSum * 100;
  return Number(score.toFixed(1));
}

export function average(values: number[]) {
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
}
