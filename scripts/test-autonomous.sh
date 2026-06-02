#!/usr/bin/env bash
# scripts/test-autonomous.sh - Pruebas e2e autónomas con reporte
# Uso: ./scripts/test-autonomous.sh

set -e

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPORT_FILE="$BASE_DIR/test-results/autonomous-report.md"
SERVER_PID=""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[AUTO-TEST]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Limpiar proceso previo
cleanup() {
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
    fi
}
trap cleanup EXIT

# Verificar build existe
if [ ! -d "$BASE_DIR/dist" ]; then
    log "Construyendo proyecto..."
    cd "$BASE_DIR" && pnpm build
fi

# Iniciar servidor preview
log "Iniciando servidor preview..."
cd "$BASE_DIR" && pnpm preview &
SERVER_PID=$!

# Esperar a que el servidor esté listo
for i in {1..30}; do
    if curl -s http://localhost:4321 | grep -q "Booking"; then
        log "Servidor listo ✓"
        break
    fi
    if [ $i -eq 30 ]; then
        error "Servidor no respondió en 30s"
        exit 1
    fi
    sleep 1
done

# Ejecutar tests e2e
log "Ejecutando pruebas e2e..."
export BASE_URL="http://localhost:4321"
pnpm exec playwright test --reporter=list

# Generar reporte
log "Generando reporte..."
mkdir -p "$BASE_DIR/test-results"

# Extraer resultados
PASSED=$(find "$BASE_DIR/test-results" -name "*.png" 2>/dev/null | wc -l || echo 0)

cat > "$REPORT_FILE" << EOF
# Reporte Autónomo - $(date)

## Estado del sitio
- URL: http://localhost:4321
- Build: $(git -C "$BASE_DIR" rev-parse --short HEAD 2>/dev/null || echo "unknown")

## Tests ejecutados
$(pnpm exec playwright test --reporter=json 2>&1 | head -100)

## Screenshots generados
$(ls "$BASE_DIR/test-results/"*.png 2>/dev/null | xargs -I{} echo "- {}")

## Próximos pasos sugeridos
- Revisar errores de accesibilidad con axe-core
- Verificar responsive en móviles
- Validar formulario de reservas

---
*Generado por agente autónomo*
EOF

log "Reporte guardado en $REPORT_FILE"
log "Abrir reporte HTML: test-results/html/index.html"