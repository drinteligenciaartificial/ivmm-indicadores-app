import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { gzip as gzipCallback } from "node:zlib";
import pg from "pg";

const gzip = promisify(gzipCallback);
const { Client } = pg;
const serviceName = "ivmm-render-database";

function databaseUrl() {
  if (process.env.IVMM_DATABASE_URL) return process.env.IVMM_DATABASE_URL;
  if (process.platform !== "darwin") {
    throw new Error("Defina IVMM_DATABASE_URL para executar o backup fora do macOS.");
  }

  return execFileSync("security", [
    "find-generic-password",
    "-a",
    process.env.USER || "ivmm",
    "-s",
    serviceName,
    "-w",
  ], { encoding: "utf8" }).trim();
}

function quoteIdentifier(value) {
  return `"${value.replaceAll('"', '""')}"`;
}

const client = new Client({
  connectionString: databaseUrl(),
  ssl: { rejectUnauthorized: false },
});

await client.connect();

try {
  const tableResult = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  const tables = {};
  for (const { table_name: tableName } of tableResult.rows) {
    const result = await client.query(`SELECT * FROM ${quoteIdentifier(tableName)}`);
    tables[tableName] = result.rows;
  }

  const generatedAt = new Date();
  const payload = {
    format: "ivmm-postgres-json-v1",
    generatedAt: generatedAt.toISOString(),
    tableCount: tableResult.rowCount,
    tables,
  };

  const outputDirectory = process.env.IVMM_BACKUP_DIR
    || join(homedir(), "Documents", "IVMM Backups");
  await mkdir(outputDirectory, { recursive: true });

  const timestamp = generatedAt.toISOString().replaceAll(":", "-").replace(".000Z", "Z");
  const outputPath = join(outputDirectory, `ivmm-production-${timestamp}.json.gz`);
  await writeFile(outputPath, await gzip(Buffer.from(JSON.stringify(payload))));

  console.log(`Backup concluído: ${outputPath}`);
  console.log(`${tableResult.rowCount} tabelas exportadas.`);
} finally {
  await client.end();
}
