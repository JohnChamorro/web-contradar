/**
 * Arranca `astro dev` y precalienta las rutas en cuanto el servidor está listo.
 *
 * Por qué: en dev, Vite transforma el grafo de módulos bajo demanda. La PRIMERA
 * petición al servidor paga ese coste entero —medido: 10,5 s— y las siguientes
 * bajan a ~1,4 s. No es por ruta: justo después de que /precios pagara los
 * 10,5 s, /funcionalidades en frío costó 1,49 s. El coste es del servidor, no
 * de la página.
 *
 * Antes lo pagabas tú, navegando. Ahora lo paga el arranque, en segundo plano,
 * mientras te acomodas. El servidor queda igual de utilizable: si abres el
 * navegador antes de que termine, simplemente te toca la espera que habrías
 * tenido de todos modos.
 *
 * Esto NO acelera el dev server, solo mueve la espera a donde no molesta. El
 * arreglo de fondo sería migrar a Tailwind 4 con @tailwindcss/vite.
 *
 * Los argumentos se pasan tal cual: `npm run dev -- --port 4400 --host`.
 */
import { spawn } from "node:child_process";

const RUTAS = ["/", "/precios/", "/funcionalidades/", "/sectores/", "/ayuda/", "/nosotros/"];

const hijo = spawn("astro", ["dev", ...process.argv.slice(2)], {
  stdio: ["inherit", "pipe", "inherit"],
  shell: process.platform === "win32",
});

let yaCalenté = false;

hijo.stdout.on("data", (trozo) => {
  const texto = trozo.toString();
  process.stdout.write(texto);

  // La línea "Local http://localhost:PUERTO/" es la señal de que ya acepta peticiones.
  const m = texto.match(/http:\/\/localhost:(\d+)/);
  if (!m || yaCalenté) return;
  yaCalenté = true;
  calentar(`http://localhost:${m[1]}`);
});

async function calentar(base) {
  const t0 = Date.now();
  process.stdout.write(`\n  precalentando ${RUTAS.length} rutas…\n`);
  for (const ruta of RUTAS) {
    try {
      // Secuencial a propósito: en paralelo compiten por el mismo transformador
      // de Vite y no se gana nada, solo se satura la CPU.
      await fetch(base + ruta);
    } catch {
      // Un fallo aquí es irrelevante: es una optimización, no una dependencia.
      // Si el servidor aún no responde, la ruta se compilará cuando la pidas.
    }
  }
  process.stdout.write(`  listo en ${((Date.now() - t0) / 1000).toFixed(1)} s — ya navegas sin la espera inicial\n\n`);
}

for (const señal of ["SIGINT", "SIGTERM"]) {
  process.on(señal, () => hijo.kill(señal));
}
hijo.on("exit", (codigo) => process.exit(codigo ?? 0));
