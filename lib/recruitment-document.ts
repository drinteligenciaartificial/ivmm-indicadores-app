type CandidateFields = {
  name: string;
  email: string;
  phone: string;
  professionalSummary: string;
  resumeText: string;
  source: string;
  tags: string;
  warning?: string;
};

function cleanText(text: string) {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractEmail(text: string) {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0]?.toLowerCase() ?? "";
}

function extractPhone(text: string) {
  return text.match(/(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4}[-\s]?\d{4}/)?.[0]?.replace(/\s+/g, " ").trim() ?? "";
}

function extractName(text: string, fallback: string) {
  const lines = cleanText(text).split("\n").map((line) => line.trim()).filter(Boolean);
  const ignored = /curr[ií]culo|resume|email|telefone|contato|objetivo|experi[eê]ncia|forma[cç][aã]o/i;
  const candidate = lines.find((line) => line.length >= 4 && line.length <= 80 && !ignored.test(line) && !line.includes("@"));
  if (candidate) return candidate.replace(/^[^A-Za-zÀ-ÿ]+/, "").trim();
  return fallback.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}

function inferTags(text: string) {
  const tags = [
    ["crm", /crm|kommo/i],
    ["whatsapp", /whatsapp/i],
    ["excel", /excel|planilha/i],
    ["recepção", /recep[cç][aã]o|recepcionista/i],
    ["atendimento", /atendimento|cliente|paciente/i],
    ["agenda", /agenda|agendamento/i],
  ].filter(([, regex]) => (regex as RegExp).test(text)).map(([tag]) => tag);
  return tags.join(", ");
}

async function extractPdf(buffer: Buffer) {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
}

async function extractDocx(buffer: Buffer) {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

function decodePlainText(buffer: Buffer) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("windows-1252").decode(buffer);
  }
}

export async function parseCandidateDocument(file: File): Promise<CandidateFields> {
  const fileName = file.name || "curriculo";
  const lowerName = fileName.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());
  let text = "";
  let warning: string | undefined;

  try {
    if (file.type === "application/pdf" || lowerName.endsWith(".pdf")) {
      text = await extractPdf(buffer);
    } else if (lowerName.endsWith(".docx")) {
      text = await extractDocx(buffer);
    } else if (lowerName.endsWith(".doc")) {
      text = decodePlainText(buffer);
      warning = "Arquivos .doc antigos podem ter extração limitada. Prefira .docx para leitura completa.";
    } else if (file.type.startsWith("text/") || lowerName.endsWith(".txt")) {
      text = decodePlainText(buffer);
    } else if (file.type.startsWith("image/") || /\.(png|jpg|jpeg)$/i.test(lowerName)) {
      warning = "Imagem recebida. A leitura OCR/IA de imagem será ativada na próxima etapa; preencha os campos não identificados antes de salvar.";
    } else {
      warning = "Formato recebido, mas sem extrator automático configurado.";
    }
  } catch (error) {
    warning = `Não foi possível extrair o texto automaticamente: ${error instanceof Error ? error.message : "erro desconhecido"}.`;
  }

  const resumeText = cleanText(text);
  const professionalSummary = resumeText.split("\n").filter(Boolean).slice(0, 4).join(" ").slice(0, 700);
  return {
    name: resumeText ? extractName(resumeText, fileName) : extractName(fileName, fileName),
    email: resumeText ? extractEmail(resumeText) : "",
    phone: resumeText ? extractPhone(resumeText) : "",
    professionalSummary,
    resumeText,
    source: "Importação de documento",
    tags: resumeText ? inferTags(resumeText) : "",
    warning,
  };
}
