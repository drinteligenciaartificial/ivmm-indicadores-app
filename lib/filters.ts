export function searchParam(searchParams: Record<string, string | string[] | undefined>, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

export function cleanParams(searchParams: Record<string, string | string[] | undefined>) {
  return {
    area: searchParam(searchParams, "area") || "",
    bsc: searchParam(searchParams, "bsc") || "",
    month: searchParam(searchParams, "month") || "",
    quarter: searchParam(searchParams, "quarter") || "",
    year: searchParam(searchParams, "year") || "",
    traffic: searchParam(searchParams, "traffic") || "",
  };
}

export function dateFilter(year?: string, month?: string) {
  if (!year) return undefined;
  const y = Number(year);
  if (!Number.isFinite(y)) return undefined;
  if (month) {
    const m = Number(month);
    if (!Number.isFinite(m) || m < 1 || m > 12) return undefined;
    return {
      gte: new Date(Date.UTC(y, m - 1, 1)),
      lt: new Date(Date.UTC(m === 12 ? y + 1 : y, m === 12 ? 0 : m, 1)),
    };
  }
  return {
    gte: new Date(Date.UTC(y, 0, 1)),
    lt: new Date(Date.UTC(y + 1, 0, 1)),
  };
}
