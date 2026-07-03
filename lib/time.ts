export const BRASILIA_TIME_ZONE = "America/Sao_Paulo";

export function formatBrasiliaDateTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRASILIA_TIME_ZONE,
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
}

export function brasiliaYear() {
  return Number(new Intl.DateTimeFormat("en", {
    timeZone: BRASILIA_TIME_ZONE,
    year: "numeric",
  }).format(new Date()));
}
