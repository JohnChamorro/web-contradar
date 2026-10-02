#!/usr/bin/env bash
# Revisión de producción de ContRadar: web, app, Umami, SEO y seguridad.
# Solo hace consultas GET públicas: no envía nada ni cambia nada.
#
# Uso (en tu equipo):  scripts/verificar-produccion.sh
# Al final dice cuántas revisiones fallaron. Repítelo después de cada despliegue.
set -uo pipefail

WEB=https://contradar.com.co
APP=https://app.contradar.com.co
ANA=https://analitica.contradar.com.co
FALLAS=0
ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
mal()  { printf '  \033[31m✗\033[0m %s\n' "$1"; FALLAS=$((FALLAS+1)); }
seccion() { printf '\n\033[1m%s\033[0m\n' "$1"; }
codigo() { curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$1"; }
espera() { local c; c=$(codigo "$1"); [ "$c" = "$2" ] && ok "$1 → $c" || mal "$1 → $c (esperaba $2)"; }

seccion "1. Páginas de la web (deben dar 200)"
for r in / /precios/ /diagnostico/ /licitaciones-colombia/ /guias/ /guias/capacidad-residual/ \
         /guias/mejores-apps-licitaciones-colombia/ /herramientas/calculadora-capacidad-residual/ \
         /sectores/ /sectores/construccion/ /alternativas/ /nosotros/; do
  espera "$WEB$r" 200
done

seccion "2. Redirecciones (un solo salto, al destino correcto)"
r=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$WEB/guias/apps-para-licitaciones-colombia/")
[[ "$r" == 301* && "$r" == *mejores-apps-licitaciones-colombia/ ]] && ok "guía vieja → 301 a la comparativa" || mal "guía vieja: $r"
r=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "https://www.contradar.com.co/precios/")
[[ "$r" == 301\ $WEB/precios/ ]] && ok "www → 301 al dominio sin www" || mal "www: $r"
r=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$WEB/precios")
[[ "$r" == 30[18]\ $WEB/precios/ ]] && ok "sin barra final → redirige a /precios/" || mal "barra final: $r"
espera "$WEB/pagina-que-no-existe-$$/" 404

seccion "3. SEO técnico"
idx=$(curl -s "$WEB/sitemap-index.xml")
[[ "$idx" == *sitemap-paginas-0.xml* ]] && ok "sitemap-index lista sitemap-paginas-0.xml" || mal "sitemap-index sin sitemap-paginas-0.xml"
sm=$(curl -s "$WEB/sitemap-paginas-0.xml")
n=$(grep -o '<loc>' <<<"$sm" | wc -l); f=$(grep -o '<lastmod>[^<]*' <<<"$sm" | sort -u | wc -l)
[ "$n" -ge 40 ] && ok "sitemap: $n URL" || mal "sitemap: solo $n URL"
[ "$f" -gt 1 ] && ok "lastmod real: $f fechas distintas" || mal "lastmod: $f fecha(s) distinta(s) (¿clon superficial?)"
curl -s "$WEB/robots.txt" | grep -q "Sitemap: $WEB/sitemap-index.xml" && ok "robots.txt apunta al sitemap" || mal "robots.txt sin sitemap"
curl -s "$WEB/llms.txt" | head -1 | grep -q "^# ContRadar" && ok "llms.txt publicado" || mal "llms.txt"
[ "$(curl -s "$WEB/6cd3f559f2eafbb26561dc2ce203cead.txt")" = 6cd3f559f2eafbb26561dc2ce203cead ] && ok "clave de IndexNow publicada" || mal "clave de IndexNow"
home=$(curl -s "$WEB/")
grep -q '<link rel="canonical" href="https://contradar.com.co/">' <<<"$home" && ok "canonical de la portada" || mal "canonical de la portada"
grep -q 'name="keywords"' <<<"$home" && mal "la meta keywords volvió" || ok "sin meta keywords"
j=$(grep -o 'application/ld+json' <<<"$home" | wc -l); [ "$j" -ge 4 ] && ok "JSON-LD en la portada: $j bloques" || mal "JSON-LD: $j bloques"
grep -q 'App de licitaciones en Colombia' <<<"$home" && ok "H1 con «App de licitaciones en Colombia»" || mal "H1 sin la palabra clave"

seccion "4. Analítica (Umami)"
espera "$ANA/script.js" 200
tag=$(python3 -c "import sys,re;m=re.search(r'<script[^>]*?data-website-id[^>]*>',sys.stdin.read(),re.S);print(' '.join(m.group(0).split()) if m else '')" <<<"$home")
[[ "$tag" == *analitica.contradar.com.co/script.js* ]] && ok "la web carga el tracker de Umami" || mal "la web NO carga Umami (¿variables PUBLIC_UMAMI_* en Pages?)"
[[ "$tag" == *'script.js "'* ]] && mal "PUBLIC_UMAMI_SRC con espacio al final (sube el último commit de la web)" || ok "src del tracker sin espacios"
bundle=$(curl -s "$APP/" | grep -o '/assets/index-[^"]*\.js' | head -1)
curl -s "$APP$bundle" | grep -q 'analitica.contradar.com.co/script.js' && ok "la app trae el tracker de Umami" || mal "la app NO trae Umami (¿VITE_UMAMI_* y rebuild de web?)"

seccion "5. App"
h=$(curl -s --max-time 20 "$APP/health")
[[ "$h" == *'"status":"ok"'* ]] && ok "app /health ok" || mal "app /health: $h"
curl -s "$APP/robots.txt" | head -1 | grep -q '^# robots.txt de app' && ok "robots.txt propio de la app" || mal "robots.txt de la app"
curl -s "$APP/login" | grep -q 'noindex' && ok "app con noindex" || mal "la app no trae noindex"

seccion "6. Prueba gratis y seguridad"
csp=$(curl -sI "$WEB/" | grep -i '^content-security-policy')
[[ "$csp" == *"connect-src"*"app.contradar.com.co"* ]] && ok "CSP deja crear la prueba en la app" || mal "CSP bloquea el alta de la prueba (falta app. en connect-src)"
[[ "$csp" == *"analitica.contradar.com.co"* ]] && ok "CSP permite Umami" || mal "CSP sin analitica"
pre=$(curl -s -o /dev/null -w '%{http_code}' -X OPTIONS "$APP/api/v1/public/prueba/crear" -H "Origin: $WEB" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type,x-turnstile-token")
[ "$pre" = 200 ] && ok "CORS de la app acepta a la web" || mal "CORS de la app: $pre"
stats=$(curl -s "$APP/api/v1/public/stats")
[[ "$stats" == *total_procesos* ]] && ok "cifras en vivo (/public/stats) responden" || mal "/public/stats: $stats"

seccion "7. Certificados (días que les quedan)"
for d in contradar.com.co app.contradar.com.co analitica.contradar.com.co; do
  fin=$(echo | openssl s_client -connect "$d:443" -servername "$d" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
  if [ -n "$fin" ]; then
    dias=$(( ( $(date -d "$fin" +%s) - $(date +%s) ) / 86400 ))
    [ "$dias" -gt 14 ] && ok "$d: $dias días" || mal "$d: solo $dias días"
  else mal "$d: no pude leer el certificado"; fi
done

echo
if [ "$FALLAS" -eq 0 ]; then printf '\033[32mTodo bien.\033[0m\n'; else printf '\033[31m%d revisión(es) fallaron.\033[0m Mándame la salida.\n' "$FALLAS"; fi
exit "$FALLAS"
