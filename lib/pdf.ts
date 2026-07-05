function escapePdf(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function simplePdf(title: string, lines: string[]) {
  const safeLines = [title, "", ...lines].slice(0, 42);
  const content = [
    "BT",
    "/F1 16 Tf",
    "50 790 Td",
    `(${escapePdf(title)}) Tj`,
    "/F1 10 Tf",
    ...safeLines.slice(2).flatMap((line) => ["0 -18 Td", `(${escapePdf(line.slice(0, 120))}) Tj`]),
    "ET",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index++) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf);
}

export function indicatorPdf(title: string, rows: { code: string; name: string; area: string; achievement?: string; trafficLight?: string; objective?: string }[]) {
  const commands = [
    "0.106 0.145 0.318 rg",
    "0 760 612 82 re f",
    "1 1 1 rg",
    "BT /F1 18 Tf 42 810 Td",
    `(${escapePdf(title)}) Tj`,
    "0 -24 Td /F1 10 Tf",
    "(Banco de Indicadores e Fichas - layout institucional IVMM) Tj",
    "ET",
    "0.886 0.851 0.796 rg",
    "34 720 544 28 re f",
    "0.133 0.157 0.247 rg",
    "BT /F1 9 Tf 42 730 Td (Codigo) Tj 70 0 Td (Indicador) Tj 210 0 Td (Area) Tj 85 0 Td (Ating.) Tj 60 0 Td (Semaforo) Tj ET",
  ];
  let y = 696;
  rows.slice(0, 24).forEach((row, index) => {
    commands.push(index % 2 === 0 ? "1 1 1 rg" : "0.961 0.945 0.922 rg");
    commands.push(`34 ${y - 8} 544 24 re f`);
    commands.push("0.133 0.157 0.247 rg");
    commands.push(`BT /F1 8 Tf 42 ${y} Td (${escapePdf(row.code)}) Tj 70 0 Td (${escapePdf(row.name.slice(0, 34))}) Tj 210 0 Td (${escapePdf(row.area)}) Tj 85 0 Td (${escapePdf(row.achievement ?? "-")}) Tj 60 0 Td (${escapePdf(row.trafficLight ?? "-")}) Tj ET`);
    y -= 26;
    if (row.objective) {
      commands.push("0.412 0.427 0.482 rg");
      commands.push(`BT /F1 7 Tf 112 ${y + 8} Td (${escapePdf(row.objective.slice(0, 88))}) Tj ET`);
    }
  });
  const content = commands.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index++) pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf);
}

export function tablePdf(title: string, headers: string[], rows: string[][]) {
  const pageRows = 27;
  const pages = Array.from({ length: Math.max(1, Math.ceil(rows.length / pageRows)) }, (_, pageIndex) => {
    const commands = [
      "0.106 0.145 0.318 rg", "0 760 612 82 re f", "1 1 1 rg",
      `BT /F1 17 Tf 34 810 Td (${escapePdf(title.slice(0, 62))}) Tj ET`,
      "0.886 0.851 0.796 rg", "24 720 564 28 re f", "0.133 0.157 0.247 rg",
    ];
    const columnWidth = 564 / headers.length;
    headers.forEach((header, index) => commands.push(`BT /F1 7 Tf ${28 + index * columnWidth} 731 Td (${escapePdf(header.slice(0, 16))}) Tj ET`));
    let y = 698;
    rows.slice(pageIndex * pageRows, (pageIndex + 1) * pageRows).forEach((row, rowIndex) => {
      commands.push(rowIndex % 2 === 0 ? "1 1 1 rg" : "0.961 0.945 0.922 rg", `24 ${y - 8} 564 24 re f`, "0.133 0.157 0.247 rg");
      row.forEach((cell, index) => {
        const maxLength = Math.max(5, Math.floor(columnWidth / 4.7));
        commands.push(`BT /F1 7 Tf ${28 + index * columnWidth} ${y} Td (${escapePdf(cell.slice(0, maxLength))}) Tj ET`);
      });
      y -= 25;
    });
    commands.push(`0.412 0.427 0.482 rg BT /F1 7 Tf 520 24 Td (Pagina ${pageIndex + 1}) Tj ET`);
    return commands.join("\n");
  });

  const pageObjectStart = 3;
  const fontObject = pageObjectStart + pages.length;
  const contentObjectStart = fontObject + 1;
  const pageRefs = pages.map((_, index) => `${pageObjectStart + index} 0 R`).join(" ");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>`,
    ...pages.map((_, index) => `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 ${fontObject} 0 R >> >> /Contents ${contentObjectStart + index} 0 R >>`),
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ...pages.map((content) => `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`),
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index++) pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf);
}
