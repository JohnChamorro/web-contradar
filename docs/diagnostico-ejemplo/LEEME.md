# Ejemplo del diagnóstico en /diagnostico/

La imagen junto al campo del NIT es la pantalla REAL del resultado de la app
(`components/diagnostico/d2027/Resultado2027.tsx`), pintada con una respuesta
inventada en vez de la del servidor. Nada de lo que se ve es de una empresa real.

- **Empresa:** Constructora Cordillera del Sur S.A.S., NIT 901234567. El 2-nov-2026
  ni el nombre ni el NIT existían en `analytics.provider_totals` (2,6 M proveedores).
- **Competidores y licitación:** Consorcio Vial Alto Puracé, Ingenieros Asociados
  del Patía, Pavimentos Quilcacé, Unión Temporal Acueductos del Macizo, Estructuras
  Munchique y la Alcaldía de Villa Central. Comprobados igual: sin coincidencias.
- **Cifras que cuadran:** 116 procesos = 31 ganadas + 71 que le ganaron + 14 sin
  resultado (5 en evaluación, 3 canceladas, 6 sin resultado publicado); tasa 27 de 98
  decididas; 9 contratos parecidos en Cauca, el mayor de $2.150 M.

## Regenerarla (en tu PC, con la app de dev en :3000)

```bash
cd docs/diagnostico-ejemplo
~/eulertech/contradar/backend/.venv/bin/python capturar.py ./     # cord-light.png y cord-dark.png
cp recortar.mjs ../../recortar-tmp.mjs && (cd ../.. && node recortar-tmp.mjs docs/diagnostico-ejemplo public/capturas/diagnostico); rm ../../recortar-tmp.mjs
```

`capturar.py` intercepta `/api/v1/public/diagnostico/901234567` y responde con
`respuesta.json`; también contesta `/avance` y `/visit` sin tocar el servidor. Si el
diseño del resultado cambia en la app, se vuelve a correr y la web se actualiza sola.
Los PNG no se guardan en el repo.
