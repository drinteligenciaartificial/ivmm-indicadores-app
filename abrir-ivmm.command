#!/bin/zsh
set -e

cd "$(dirname "$0")"

PORT=3001
URL="http://127.0.0.1:${PORT}/login"

echo "IVMM - Gestão por Indicadores"
echo "Pasta: $(pwd)"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js nao encontrado."
  echo "Instale o Node.js LTS em https://nodejs.org/ e rode este arquivo novamente."
  echo ""
  read "REPLY?Pressione ENTER para fechar..."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm nao encontrado."
  echo "Reinstale o Node.js LTS em https://nodejs.org/ e rode este arquivo novamente."
  echo ""
  read "REPLY?Pressione ENTER para fechar..."
  exit 1
fi

echo "Preparando dependencias e banco local..."
npm install
npx prisma generate

NEEDS_SEED=0
if [[ ! -f prisma/dev.db ]]; then
  NEEDS_SEED=1
fi

npx prisma db push
if [[ "${NEEDS_SEED}" -eq 1 ]]; then
  npm run seed
fi

if lsof -nP -iTCP:${PORT} -sTCP:LISTEN >/dev/null 2>&1; then
  echo "O app ja esta rodando na porta ${PORT}."
  open "${URL}"
  echo "Aberto em: ${URL}"
  echo ""
  read "REPLY?Pressione ENTER para fechar..."
  exit 0
fi

echo ""
echo "Iniciando o sistema..."
npm run dev &
SERVER_PID=$!

for attempt in {1..45}; do
  if curl -fsS "http://127.0.0.1:${PORT}/login" >/dev/null 2>&1; then
    open "${URL}"
    echo "Aberto em: ${URL}"
    echo ""
    echo "Deixe esta janela aberta enquanto estiver usando o sistema."
    wait "${SERVER_PID}"
    exit 0
  fi

  if ! kill -0 "${SERVER_PID}" >/dev/null 2>&1; then
    echo ""
    echo "O servidor parou antes de abrir a pagina."
    echo "Veja a mensagem de erro acima."
    echo ""
    read "REPLY?Pressione ENTER para fechar..."
    exit 1
  fi

  sleep 1
done

echo ""
echo "O servidor demorou para responder."
echo "Tente abrir manualmente: ${URL}"
echo ""
read "REPLY?Pressione ENTER para fechar..."
wait "${SERVER_PID}"
