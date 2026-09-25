import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const [plistPath, nodePath, projectDirectory, logDirectory] = process.argv.slice(2);
if (!plistPath || !nodePath || !projectDirectory || !logDirectory) {
  throw new Error("Parâmetros insuficientes para configurar o LaunchAgent.");
}

const escapeXml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const backupScript = join(projectDirectory, "scripts", "backup-production-db.mjs");
const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.ivmm.database-backup</string>
  <key>ProgramArguments</key>
  <array>
    <string>${escapeXml(nodePath)}</string>
    <string>${escapeXml(backupScript)}</string>
  </array>
  <key>WorkingDirectory</key>
  <string>${escapeXml(projectDirectory)}</string>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>2</integer>
    <key>Minute</key>
    <integer>30</integer>
  </dict>
  <key>StandardOutPath</key>
  <string>${escapeXml(join(logDirectory, "backup.log"))}</string>
  <key>StandardErrorPath</key>
  <string>${escapeXml(join(logDirectory, "backup-error.log"))}</string>
</dict>
</plist>
`;

await writeFile(plistPath, plist, { mode: 0o600 });
