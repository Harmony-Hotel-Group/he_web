#!/usr/bin/env bash
# scripts/accessibility-scan.sh
# Escanea la app he_web en dev con axe-core contra WCAG 2.1 AA
#
# Uso: npm run a11y:scan
# o: bash scripts/accessibility-scan.sh

set -euo pipefail

PORT="${PORT:-4321}"
URL="http://localhost:${PORT}"
TAGS="wcag2a,wcag2aa,wcag22aa"

echo "🚀 Iniciando servidor de desarrollo en puerto ${PORT}..."
pnpm dev > /tmp/he_web_dev.log 2>&1 &
DEV_PID=$!

# Asegurar que el proceso se mate al salir
cleanup() {
  echo "🛑 Deteniendo servidor (PID ${DEV_PID})..."
  kill "${DEV_PID}" > /dev/null 2>&1 || true
  wait "${DEV_PID}" > /dev/null 2>&1 || true
}
trap cleanup EXIT

# Esperar a que el puerto esté listo
echo "⏳ Esperando a que el servidor esté listo..."
ATTEMPTS=0
MAX_ATTEMPTS=60

while [ ${ATTEMPTS} -lt ${MAX_ATTEMPTS} ]; do
  if curl -s -o /dev/null -w "%{http_code}" "${URL}" | grep -q "^2"; then
    echo "✅ Servidor listo en ${URL}"
    break
  fi
  ATTEMPTS=$((ATTEMPTS + 1))
  sleep 1
done

if [ ${ATTEMPTS} -ge ${MAX_ATTEMPTS} ]; then
  echo "❌ Tiempo agotado: servidor no respondió en ${MAX_ATTEMPTS}s"
  echo "   Últimas líneas del log:"
  tail -n 30 /tmp/he_web_dev.log || true
  exit 1
fi

# Ejecutar axe-core
echo "🔍 Ejecutando axe-core contra ${URL}"
echo "   Tags: ${TAGS}"
echo ""

set +e
pnpm exec node scripts/accessibility-scan.mjs "${URL}"
AXE_EXIT_CODE=$?
set -e

echo ""
if [ ${AXE_EXIT_CODE} -eq 0 ]; then
  echo "✅ Escaneo completado: sin violaciones de accesibilidad detectadas."
elif [ ${AXE_EXIT_CODE} -eq 1 ]; then
  echo "⚠️  Escaneo completado con violaciones (código 1)."
  echo "   Recuerda: axe-core detecta ~30% de los issues; complementar con testing manual."
else
  echo "❌ Error en escaneo (código ${AXE_EXIT_CODE})."
fi

exit ${AXE_EXIT_CODE}
