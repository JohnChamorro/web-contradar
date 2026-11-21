-- ¿Es creíble el tope que las entidades declaran en su PAA? Se cruza con sus
-- procesos de mínima cuantía del año, de SECOP I y SECOP II: si el tope
-- declarado fuera basura, habría muchos procesos por encima.
--
-- Medido el 21-nov-2026 en dev (entidades con 3 o más procesos):
--   1.678 entidades · 60.366 procesos · 171 por encima del tope (0,28 %)
--   97,3 % de las entidades no tiene ninguno por encima.
with u as (
  select distinct on (codigo_entidad) codigo_entidad, ppto_minima_cuantia as tope
    from analytics.paa2_headers
   where anno = 2026 and codigo_entidad is not null
   order by codigo_entidad, fecha_ultima_modificacion desc nulls last, id desc
),
n as (select codigo_entidad, max(nit_entidad) as nit from analytics.paa2_items where anno >= 2025 group by 1),
e as (select n.nit, max(u.tope) as tope from u join n using (codigo_entidad) where u.tope > 0 group by 1),
m as (
  select h.entity_nit as nit, count(*) as procesos,
         count(*) filter (where h.estimated_value > e.tope * 1.001) as sobre
    from analytics.historical_processes h
    join e on e.nit = h.entity_nit
   where h.publish_date >= date '2026-01-01'
     and h.modality ilike '%nima cuant%' and h.estimated_value > 0
   group by 1
)
select count(*) as entidades, sum(procesos) as procesos, sum(sobre) as sobre_tope,
       round(100.0 * sum(sobre) / sum(procesos), 2) as pct_sobre,
       round(100.0 * count(*) filter (where sobre = 0) / count(*), 1) as pct_entidades_sin_ninguno
  from m where procesos >= 3;
