/* Radar, el asistente (Web Radar, handoff/web-radar §2): lo que se mueve con JS.
   Parpadea cada 2,6–5 s, las pupilas siguen el mouse (los que llevan data-mira) y
   camina con `caminar()`. Solo variables CSS que terminan en transform. Con
   movimiento reducido no hace nada: Radar queda quieto. */

const reducido = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

let iniciado = false;

export function iniciarRadares() {
  if (iniciado || reducido()) return;
  iniciado = true;
  const bots = [...document.querySelectorAll<SVGElement>("[data-radar]")];
  bots.forEach((b) => {
    const parpadea = () => {
      window.setTimeout(() => {
        b.style.setProperty("--parpadeo", "0.1");
        window.setTimeout(() => b.style.setProperty("--parpadeo", "1"), 120);
        parpadea();
      }, 2600 + Math.random() * 2400);
    };
    parpadea();
  });
  const miran = bots.filter((b) => b.hasAttribute("data-mira"));
  if (!miran.length || !matchMedia("(hover: hover)").matches) return;
  let x = 0, y = 0, pendiente = false;
  addEventListener("pointermove", (e) => {
    x = (e.clientX / innerWidth - 0.5) * 2;
    y = (e.clientY / innerHeight - 0.5) * 2;
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => {
      pendiente = false;
      miran.forEach((b) => { b.style.setProperty("--mx", x.toFixed(2)); b.style.setProperty("--my", y.toFixed(2)); });
    });
  }, { passive: true });
}

/** Un paso de la caminata: `fase` crece con el scroll (cada unidad, un paso). */
export function caminar(b: SVGElement | null, fase: number) {
  if (!b || reducido()) return;
  const s = Math.sin(fase * Math.PI * 2);
  b.style.setProperty("--hop", (-Math.abs(s) * 5).toFixed(2));
  b.style.setProperty("--pie", s.toFixed(2));
}
