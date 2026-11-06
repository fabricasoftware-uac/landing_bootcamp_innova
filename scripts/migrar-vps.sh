#!/usr/bin/env bash
# ==============================================================================
# SCRIPT DE MIGRACIÓN AUTOMÁTICA A SUPABASE EN VPS (COOLIFY)
# Proyecto: Bootcamp Cauca INNOVA 2026
# ==============================================================================
set -euo pipefail

VPS_USER="${VPS_USER:-root}"
VPS_HOST="${VPS_HOST:-159.203.2.46}"
CONTAINER_NAME="${CONTAINER_NAME:-supabase-db-rrcszgspvc9asdfrwajnggdd}"
DB_NAME="${DB_NAME:-postgres}"
DB_USER="${DB_USER:-postgres}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
MIGRATIONS_DIR="${ROOT_DIR}/supabase/migrations"

echo "=========================================================="
echo "🚀 Sincronizador de Migraciones Supabase -> VPS"
echo "Proyecto: Bootcamp Cauca INNOVA 2026"
echo "Host: ${VPS_USER}@${VPS_HOST}"
echo "Contenedor DB: ${CONTAINER_NAME}"
echo "=========================================================="

if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo "❌ Error: Directorio de migraciones no encontrado en: $MIGRATIONS_DIR"
    exit 1
fi

# 1. Obtener lista de versiones ya aplicadas en el servidor
echo "🔍 Consultando migraciones aplicadas en el servidor..."
APPLIED_VERSIONS=$(ssh -o StrictHostKeyChecking=no "${VPS_USER}@${VPS_HOST}" \
    "docker exec ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -t -A -c 'SELECT version FROM supabase_migrations.schema_migrations;'")

# 2. Identificar migraciones pendientes
PENDING_FILES=()
for file in "$MIGRATIONS_DIR"/*.sql; do
    [ -e "$file" ] || continue
    filename=$(basename "$file")
    version="${filename%%_*}"
    
    # Comprobar si la versión ya existe
    if ! echo "$APPLIED_VERSIONS" | grep -qx "$version"; then
        PENDING_FILES+=("$file")
    fi
done

if [ ${#PENDING_FILES[@]} -eq 0 ]; then
    echo "✅ No hay migraciones pendientes. La base de datos está al día."
    exit 0
fi

echo "📋 Se encontraron ${#PENDING_FILES[@]} migración(es) pendiente(s):"
for file in "${PENDING_FILES[@]}"; do
    echo "   - $(basename "$file")"
done

read -p "¿Deseas aplicar estas migraciones en producción? (s/N): " confirm
if [[ ! "$confirm" =~ ^[sSyY]$ ]]; then
    echo "Operación cancelada por el usuario."
    exit 0
fi

# 3. Aplicar cada migración pendiente
for file in "${PENDING_FILES[@]}"; do
    filename=$(basename "$file")
    version="${filename%%_*}"
    name="${filename#${version}_}"
    name="${name%.sql}"
    
    echo "⏳ Aplicando migración: $filename..."
    
    SQL_CONTENT=$(cat "$file")
    WRAPPED_SQL=$(cat <<EOF
BEGIN;
${SQL_CONTENT}
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('${version}', '${name}')
ON CONFLICT (version) DO NOTHING;
COMMIT;
EOF
)

    ssh -o StrictHostKeyChecking=no "${VPS_USER}@${VPS_HOST}" \
        "docker exec -i ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -v ON_ERROR_STOP=1" <<< "$WRAPPED_SQL"

    if [ $? -eq 0 ]; then
        echo "✅ Migración $filename aplicada exitosamente."
    else
        echo "❌ Error aplicando $filename. Se detiene el proceso."
        exit 1
    fi
done

# 4. Recargar el caché de PostgREST
echo "🔄 Recargando caché de PostgREST..."
ssh -o StrictHostKeyChecking=no "${VPS_USER}@${VPS_HOST}" \
    "docker exec ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -c \"NOTIFY pgrst, 'reload schema';\""

echo "🎉 ¡Todas las migraciones se aplicaron con éxito y el esquema fue recargado!"
