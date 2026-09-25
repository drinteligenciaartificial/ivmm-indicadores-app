#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="${0:A:h}"
PROJECT_DIR="${SCRIPT_DIR:h}"
PLIST_PATH="${HOME}/Library/LaunchAgents/com.ivmm.database-backup.plist"
LOG_DIR="${HOME}/Library/Logs/IVMM"
NODE_PATH="$(command -v node)"

echo "Cole a External Database URL exibida pelo Render e pressione Enter."
read -rs "DATABASE_URL?URL: "
echo

if [[ "${DATABASE_URL}" != postgresql://* && "${DATABASE_URL}" != postgres://* ]]; then
  echo "A URL informada não é uma conexão PostgreSQL válida." >&2
  exit 1
fi

security add-generic-password \
  -a "${USER}" \
  -s "ivmm-render-database" \
  -w "${DATABASE_URL}" \
  -U >/dev/null
unset DATABASE_URL

mkdir -p "${HOME}/Library/LaunchAgents" "${LOG_DIR}" "${HOME}/Documents/IVMM Backups"

node "${SCRIPT_DIR}/write-backup-launch-agent.mjs" \
  "${PLIST_PATH}" \
  "${NODE_PATH}" \
  "${PROJECT_DIR}" \
  "${LOG_DIR}"

launchctl bootout "gui/${UID}" "${PLIST_PATH}" 2>/dev/null || true
launchctl bootstrap "gui/${UID}" "${PLIST_PATH}"
launchctl kickstart -k "gui/${UID}/com.ivmm.database-backup"

echo "Backup diário configurado para 02:30."
echo "Arquivos: ${HOME}/Documents/IVMM Backups"
echo "Logs: ${LOG_DIR}"
