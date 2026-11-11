"use client";

import type { MetricasAdmin } from "@/app/actions/admin";
import type { PostulacionEstado } from "@/lib/supabase/types";

export type FiltroEstado = PostulacionEstado | "todos";

export type ConteosEstado = Record<FiltroEstado, number>;

interface MetricasDashboardProps {
  metricas: MetricasAdmin | null;
  conteos: ConteosEstado;
  filtro: FiltroEstado;
  alFiltrar: (filtro: FiltroEstado) => void;
  cargando: boolean;
}

const FILTROS: { id: FiltroEstado; etiqueta: string }[] = [
  { id: "todos", etiqueta: "Todas" },
  { id: "pendiente", etiqueta: "En revisión" },
  { id: "habilitado", etiqueta: "Habilitadas" },
  { id: "no_habilitado", etiqueta: "No habilitadas" },
  { id: "seleccionado", etiqueta: "Seleccionadas" },
];

function SinCifra({ cargando }: { cargando: boolean }) {
  if (cargando) return <span className="adm-esqueleto adm-esqueleto-cifra" />;
  return (
    <span className="adm-sin-cifra">
      <span aria-hidden="true">—</span>
      <span className="sr-only">Sin datos</span>
    </span>
  );
}

function Cupos({
  metricas,
  cargando,
}: {
  metricas: MetricasAdmin | null;
  cargando: boolean;
}) {
  const totales = metricas?.cupos_totales ?? 10;
  const metaSuperior = metricas?.meta_superior ?? 6;
  const metaBasicaMedia = metricas?.meta_basica_media ?? 3;
  const ocupadosSuperior = metricas?.seleccionados_superior ?? 0;
  const ocupadosBasicaMedia = metricas?.seleccionados_basica_media ?? 0;
  const ocupados = metricas?.seleccionados ?? 0;
  const metaSuperiorAlcanzada = ocupadosSuperior >= metaSuperior;
  const metaBasicaMediaAlcanzada = ocupadosBasicaMedia >= metaBasicaMedia;

  const bloques = Array.from({ length: totales }, (_, i) => ({
    id: `cupo-${i + 1}`,
    lleno: i < ocupados,
  }));

  return (
    <div
      className="adm-cupos"
      title={`${ocupados} de ${totales} cupos asignados (hasta 10)`}
    >
      <div className="adm-cupos-resumen">
        <p className="adm-cupos-texto">
          <span>Cupos</span>
          {metricas ? (
            <strong>
              {ocupados} <span>de {totales}</span>
            </strong>
          ) : (
            <SinCifra cargando={cargando} />
          )}
        </p>
        <div
          className="adm-cupos-bloques"
          role="img"
          aria-label={
            metricas
              ? `${ocupados} de ${totales} cupos asignados (hasta 10)`
              : `${totales} cupos`
          }
        >
          {bloques.map((b) => (
            <span key={b.id} data-lleno={b.lleno} />
          ))}
        </div>
      </div>

      <div
        className="adm-cupos-metas"
        role="group"
        aria-label="Metas de selección por nivel institucional: 6 universidades y 3 colegios"
      >
        <span
          className="adm-cupos-pildora"
          data-cumplida={metaSuperiorAlcanzada}
          title={
            metaSuperiorAlcanzada
              ? `Meta alcanzada: ${ocupadosSuperior} de ${metaSuperior} universidades seleccionadas`
              : `Universidades: ${ocupadosSuperior} de ${metaSuperior} cupos`
          }
        >
          <span className="adm-cupos-pildora-etiqueta">Universidades:</span>{" "}
          <strong className="adm-cupos-pildora-valor">
            {ocupadosSuperior} de {metaSuperior}
          </strong>
          {metaSuperiorAlcanzada && (
            <>
              <span className="adm-cupos-pildora-icono" aria-hidden="true">
                ✓
              </span>
              <span className="sr-only">Meta alcanzada</span>
            </>
          )}
        </span>

        <span
          className="adm-cupos-pildora"
          data-cumplida={metaBasicaMediaAlcanzada}
          title={
            metaBasicaMediaAlcanzada
              ? `Meta alcanzada: ${ocupadosBasicaMedia} de ${metaBasicaMedia} colegios seleccionados`
              : `Colegios: ${ocupadosBasicaMedia} de ${metaBasicaMedia} cupos`
          }
        >
          <span className="adm-cupos-pildora-etiqueta">Colegios:</span>{" "}
          <strong className="adm-cupos-pildora-valor">
            {ocupadosBasicaMedia} de {metaBasicaMedia}
          </strong>
          {metaBasicaMediaAlcanzada && (
            <>
              <span className="adm-cupos-pildora-icono" aria-hidden="true">
                ✓
              </span>
              <span className="sr-only">Meta alcanzada</span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}

export function MetricasDashboard({
  metricas,
  conteos,
  filtro,
  alFiltrar,
  cargando,
}: MetricasDashboardProps) {
  return (
    <section aria-label="Resumen de postulaciones" className="adm-franja">
      <Cupos metricas={metricas} cargando={cargando} />
      <div className="adm-conteos">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            className="adm-conteo"
            data-estado={f.id}
            aria-pressed={filtro === f.id}
            onClick={() => alFiltrar(f.id)}
          >
            <span className="adm-conteo-etiqueta">{f.etiqueta}</span>
            {metricas ? (
              <span className="adm-conteo-valor">{conteos[f.id]}</span>
            ) : (
              <SinCifra cargando={cargando} />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
