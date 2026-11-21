-- Tope de mínima cuantía que cada entidad declara en su PAA de SECOP II.
-- Una fila por entidad (código de SECOP II): su último plan del año.
-- Solo lectura. Corre contra la base curada de desarrollo (`contradar`).
--
-- Por qué solo SECOP II, a pesar de la regla «SECOP I y SECOP II, siempre las
-- dos»: el PAA con el tope declarado solo existe en SECOP II
-- (`analytics.paa2_headers`); en la base no hay cabeceras de PAA de SECOP I
-- (medido el 21-nov-2026: no existe `paa1_headers`). La validación del dato
-- (validacion.sql) sí cruza con los procesos de las dos plataformas.
\set anno 2026
with ultimo as (
  select distinct on (codigo_entidad)
         codigo_entidad, nombre_entidad, ppto_minima_cuantia, ppto_menor_cuantia,
         fecha_publicacion, fecha_ultima_modificacion
    from analytics.paa2_headers
   where anno = :anno and codigo_entidad is not null
   order by codigo_entidad, fecha_ultima_modificacion desc nulls last,
            (case when version ~ '^[0-9]+$' then version::int else 0 end) desc, id desc
),
nit as (
  select codigo_entidad, max(nit_entidad) as nit
    from analytics.paa2_items
   where anno >= :anno - 1 and codigo_entidad is not null
   group by 1
)
select u.codigo_entidad, u.nombre_entidad, n.nit,
       u.ppto_minima_cuantia, u.ppto_menor_cuantia,
       coalesce(u.fecha_ultima_modificacion, u.fecha_publicacion) as fecha
  from ultimo u
  left join nit n using (codigo_entidad)
 order by u.nombre_entidad
