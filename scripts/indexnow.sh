#!/usr/bin/env bash
# Avisa a IndexNow (Bing, Yandex, Seznam, Naver…) de las URLs que cambiaron.
# Google NO usa IndexNow: para Google está el sitemap y Search Console.
#
# Uso, DESPUÉS de que el despliegue esté en vivo:
#   scripts/indexnow.sh                         # URLs con lastmod de hoy en el sitemap publicado
#   scripts/indexnow.sh --desde 2026-10-01      # URLs con lastmod desde esa fecha
#   scripts/indexnow.sh https://contradar.com.co/precios/ …   # URLs concretas
#   scripts/indexnow.sh --todas                 # todo el sitemap (primera vez)
#
# La clave es pública por diseño: el buscador comprueba que /<clave>.txt
# exista en el dominio, y eso prueba que el envío es nuestro.
set -euo pipefail

HOST="contradar.com.co"
CLAVE="6cd3f559f2eafbb26561dc2ce203cead"
SITEMAP="https://$HOST/sitemap-index.xml"

urls_del_sitemap() {
  # Lee el índice y cada sitemap hijo; imprime "lastmod url" por línea.
  curl -fsSL "$SITEMAP" | grep -o '<loc>[^<]*</loc>' | sed -E 's#</?loc>##g' | while read -r hijo; do
    curl -fsSL "$hijo" | tr -d '\n' | grep -o '<url>[^/]*<loc>[^<]*</loc>\(<lastmod>[^<]*</lastmod>\)\?' \
      | sed -E 's#.*<loc>([^<]*)</loc>(<lastmod>([^<]*)</lastmod>)?#\3 \1#'
  done
}

URLS=()
case "${1:-}" in
  --todas)
    mapfile -t URLS < <(urls_del_sitemap | awk '{print $NF}') ;;
  --desde|"")
    DESDE="${2:-$(date +%F)}"
    mapfile -t URLS < <(urls_del_sitemap | awk -v d="$DESDE" 'NF==2 && substr($1,1,10) >= d {print $2}') ;;
  *)
    URLS=("$@") ;;
esac

if [ ${#URLS[@]} -eq 0 ]; then
  echo "No hay URLs que enviar (¿el sitemap publicado ya tiene el lastmod nuevo?)." >&2
  exit 0
fi

printf 'Enviando %d URL(s):\n' "${#URLS[@]}"; printf '  %s\n' "${URLS[@]}"

LISTA=$(printf '"%s",' "${URLS[@]}"); LISTA="[${LISTA%,}]"
CUERPO=$(printf '{"host":"%s","key":"%s","keyLocation":"https://%s/%s.txt","urlList":%s}' "$HOST" "$CLAVE" "$HOST" "$CLAVE" "$LISTA")

CODIGO=$(curl -s -o /dev/stderr -w '%{http_code}' -X POST "https://api.indexnow.org/indexnow" \
  -H 'Content-Type: application/json; charset=utf-8' --data "$CUERPO")
# 200 = recibido · 202 = recibido, clave pendiente de validar · 403 = clave no encontrada en el dominio
# 422 = URL fuera del host · 429 = demasiados envíos
echo "IndexNow respondió HTTP $CODIGO"
[ "$CODIGO" = 200 ] || [ "$CODIGO" = 202 ]
