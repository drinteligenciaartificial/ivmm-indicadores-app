export type ImportedResultRow = {
  code: string;
  year: number;
  month: number;
  actualValue: number;
  targetValue: number | null;
  analysis: string | null;
  actionPlan: string | null;
  sourceRow: number;
};

type CsvRow = Record<string, string>;

const monthNames: Record<string, number> = {
  jan: 1, janeiro: 1,
  fev: 2, fevereiro: 2,
  mar: 3, marco: 3,
  abr: 4, abril: 4,
  mai: 5, maio: 5,
  jun: 6, junho: 6,
  jul: 7, julho: 7,
  ago: 8, agosto: 8,
  set: 9, setembro: 9,
  out: 10, outubro: 10,
  nov: 11, novembro: 11,
  dez: 12, dezembro: 12,
};

export function normalizeImportHeader(value: string) {
  return value
    .replace(/^\uFEFF/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function parseCsvRecords(text: string, delimiter: string) {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === delimiter && !quoted) {
      record.push(field.trim());
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      record.push(field.trim());
      field = "";
      if (record.some(Boolean)) records.push(record);
      record = [];
    } else {
      field += character;
    }
  }
  record.push(field.trim());
  if (record.some(Boolean)) records.push(record);
  return records;
}

function delimiterFor(text: string) {
  const firstLine = text.replace(/^\uFEFF/, "").split(/\r?\n/, 1)[0];
  const candidates = [";", "\t", ","];
  return candidates.sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0];
}

export function parseResultCsv(text: string): CsvRow[] {
  const cleaned = text.replace(/^\uFEFF/, "").replace(/^sep=.+\r?\n/i, "");
  const records = parseCsvRecords(cleaned, delimiterFor(cleaned));
  if (records.length < 2) return [];
  const headers = records[0].map(normalizeImportHeader);
  return records.slice(1).map((columns) => Object.fromEntries(headers.map((header, index) => [header, columns[index] ?? ""])));
}

export function parseLocalizedNumber(input: unknown) {
  const original = String(input ?? "").trim();
  const negative = /^\(.*\)$/.test(original);
  const source = original
    .replace(/^\((.*)\)$/, "$1")
    .replace(/[\s\u00a0]/g, "")
    .replace(/[^0-9,.-]/g, "");
  if (!source) return null;
  let normalized = source;
  if (source.includes(",") && source.includes(".")) {
    normalized = source.lastIndexOf(",") > source.lastIndexOf(".")
      ? source.replace(/\./g, "").replace(",", ".")
      : source.replace(/,/g, "");
  } else if (source.includes(",")) {
    normalized = source.replace(/\./g, "").replace(",", ".");
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(source)) {
    normalized = source.replace(/\./g, "");
  }
  const number = Number(normalized);
  return Number.isFinite(number) ? (negative ? -Math.abs(number) : number) : null;
}

function validPeriod(year: number, month: number) {
  return Number.isInteger(year) && year >= 2000 && year <= 2100 && Number.isInteger(month) && month >= 1 && month <= 12;
}

export function parseImportPeriod(input: unknown, fallbackYear?: number | null) {
  const source = normalizeImportHeader(String(input ?? ""));
  if (!source) return null;
  let match = source.match(/^(20\d{2})_(0?[1-9]|1[0-2])(?:_\d{1,2})?$/);
  if (match) return { year: Number(match[1]), month: Number(match[2]) };
  match = source.match(/^(?:0?[1-9]|[12]\d|3[01])_(0?[1-9]|1[0-2])_(20\d{2})$/);
  if (match) return { year: Number(match[2]), month: Number(match[1]) };
  match = source.match(/^(0?[1-9]|1[0-2])_(20\d{2})$/);
  if (match) return { year: Number(match[2]), month: Number(match[1]) };
  match = source.match(/^([a-z]+)_(20\d{2})$/);
  if (match && monthNames[match[1]]) return { year: Number(match[2]), month: monthNames[match[1]] };
  if (monthNames[source] && fallbackYear) return { year: fallbackYear, month: monthNames[source] };
  const numericMonth = Number(source);
  if (fallbackYear && Number.isInteger(numericMonth) && numericMonth >= 1 && numericMonth <= 12) return { year: fallbackYear, month: numericMonth };
  return null;
}

function firstValue(row: CsvRow, names: string[]) {
  for (const name of names) {
    const value = row[name];
    if (value != null && value !== "") return value;
  }
  return "";
}

function explicitPeriod(row: CsvRow) {
  const year = Number(firstValue(row, ["ano", "year"]));
  const monthValue = firstValue(row, ["mes", "month"]);
  const month = Number(monthValue);
  if (validPeriod(year, month)) return { year, month };
  const fromMonth = parseImportPeriod(monthValue, Number.isInteger(year) ? year : null);
  if (fromMonth && validPeriod(fromMonth.year, fromMonth.month)) return fromMonth;
  const combined = firstValue(row, ["competencia", "periodo", "referencia", "data", "mes_ano"]);
  const parsed = parseImportPeriod(combined, Number.isInteger(year) ? year : null);
  return parsed && validPeriod(parsed.year, parsed.month) ? parsed : null;
}

const fixedHeaders = new Set([
  "codigo_indicador", "codigo", "indicador", "ano", "year", "mes", "month", "competencia", "periodo", "referencia", "data", "mes_ano",
  "resultado", "valor", "valor_realizado", "realizado", "meta", "valor_meta", "analise", "observacao", "comentario", "plano_acao", "plano_de_acao", "acao",
  "unidade", "unit", "formato",
]);

export function normalizeImportedRows(rows: CsvRow[], fallbackCode = "") {
  const normalized: ImportedResultRow[] = [];
  const rejected: Array<{ row: number; reason: string }> = [];
  rows.forEach((row, index) => {
    const sourceRow = index + 2;
    const code = firstValue(row, ["codigo_indicador", "codigo", "indicador"]) || fallbackCode;
    const period = explicitPeriod(row);
    const commonTarget = parseLocalizedNumber(firstValue(row, ["meta", "valor_meta"]));
    const analysis = firstValue(row, ["analise", "observacao", "comentario"]) || null;
    const actionPlan = firstValue(row, ["plano_acao", "plano_de_acao", "acao"]) || null;
    if (period) {
      const actualValue = parseLocalizedNumber(firstValue(row, ["resultado", "valor", "valor_realizado", "realizado"]));
      if (!code) rejected.push({ row: sourceRow, reason: "indicador não informado" });
      else if (actualValue == null) rejected.push({ row: sourceRow, reason: "resultado inválido" });
      else normalized.push({ code, ...period, actualValue, targetValue: commonTarget, analysis, actionPlan, sourceRow });
      return;
    }

    const fallbackYear = Number(firstValue(row, ["ano", "year"]));
    let expanded = 0;
    for (const [header, rawValue] of Object.entries(row)) {
      if (fixedHeaders.has(header) || rawValue === "") continue;
      const headerPeriod = parseImportPeriod(header.replace(/^(resultado|valor|realizado)_/, ""), Number.isInteger(fallbackYear) ? fallbackYear : null);
      const actualValue = parseLocalizedNumber(rawValue);
      if (!headerPeriod || actualValue == null) continue;
      const periodKey = header.replace(/^(resultado|valor|realizado)_/, "");
      const periodTarget = parseLocalizedNumber(row[`meta_${periodKey}`]) ?? commonTarget;
      normalized.push({ code, ...headerPeriod, actualValue, targetValue: periodTarget, analysis, actionPlan, sourceRow });
      expanded += 1;
    }
    if (!expanded) rejected.push({ row: sourceRow, reason: "competência não reconhecida" });
  });
  return { rows: normalized, rejected };
}
