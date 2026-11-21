-- Municipio y departamento de cada entidad del PAA, según sus procesos de
-- 2023 en adelante en el espejo de procesos.
--
-- Por qué SOLO SECOP II y con el NOMBRE además del NIT (justificación exigida
-- por la regla «SECOP I y SECOP II, siempre las dos»): aquí no se cuenta nada,
-- se ubica una entidad, y en SECOP I el NIT no la identifica. Medido el
-- 21-nov-2026: el NIT 890210945 es la Alcaldía de Guavatá (Santander) y en
-- SECOP I trae 783 procesos de Guayabal de Síquima (Cundinamarca); cruzando
-- solo por NIT, 2.923 entidades quedaban en un departamento distinto del que
-- ellas mismas ponen en su plan. El nombre del PAA es el mismo de SECOP II
-- porque sale de la misma plataforma.
with ent as (
  select distinct on (h.codigo_entidad) h.codigo_entidad,
         lower(regexp_replace(trim(h.nombre_entidad), '\s+', ' ', 'g')) as nombre, i.nit
    from analytics.paa2_headers h
    join (select codigo_entidad, max(nit_entidad) as nit from analytics.paa2_items
           where anno >= :anno - 1 group by 1) i using (codigo_entidad)
   where h.anno = :anno and i.nit ~ '^[0-9]{6,10}$'
   order by h.codigo_entidad, h.fecha_ultima_modificacion desc nulls last, h.id desc
),
p as (
  select e.codigo_entidad, h.department, h.city, count(*) as n
    from ent e
    join analytics.historical_processes h
      on h.entity_nit = e.nit
     and h.source = 'secop_ii'
     and h.publish_date >= date '2023-01-01'
     and lower(regexp_replace(trim(h.entity), '\s+', ' ', 'g')) = e.nombre
   where h.department is not null and h.department <> ''
   group by 1, 2, 3
),
d as (
  select codigo_entidad, department, sum(n) as n,
         sum(n) / sum(sum(n)) over (partition by codigo_entidad) as parte,
         row_number() over (partition by codigo_entidad order by sum(n) desc) as k
    from p group by 1, 2
),
c as (
  select codigo_entidad, department, city, n,
         n / sum(n) over (partition by codigo_entidad) as parte,
         row_number() over (partition by codigo_entidad order by n desc) as k
    from p where city is not null and city <> ''
)
select d.codigo_entidad, d.department as depto, round(d.parte, 3) as parte_depto,
       c.city as municipio, round(c.parte, 3) as parte_municipio, d.n as procesos
  from d left join c on c.codigo_entidad = d.codigo_entidad and c.k = 1 and c.department = d.department
 where d.k = 1
