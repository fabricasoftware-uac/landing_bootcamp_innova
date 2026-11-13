"use client";

import { AnimatePresence } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  MetricasAdmin,
  PostulacionAdminDetalle,
} from "@/app/actions/admin";
import {
  ACCIONES_REALES,
  type AccionesPanel,
} from "@/components/admin/acciones";
import { DialogoConfirmarEliminar } from "@/components/admin/dialogo-confirmar-eliminar";
import {
  descargarExcel,
  descargarPdf,
  horaCorta,
} from "@/components/admin/dominio";
import type { BorradorEvaluacion } from "@/components/admin/expediente-evaluacion";
import { ExpedienteModal } from "@/components/admin/expediente-modal";
import {
  IconoBuscar,
  IconoDescarga,
  IconoRefrescar,
} from "@/components/admin/iconos";
import { MarcoAdmin } from "@/components/admin/marco-admin";
import {
  type ConteosEstado,
  type FiltroEstado,
  MetricasDashboard,
} from "@/components/admin/metricas-dashboard";
import {
  type ColumnaOrden,
  type Orden,
  ordenarPostulaciones,
  TablaPostulaciones,
} from "@/components/admin/tabla-postulaciones";

type P = PostulacionAdminDetalle;
type FiltroNivel = P["institucion_tipo"] | "todos";

interface PanelPostulacionesProps {
  postulaciones: P[];
  metricas: MetricasAdmin | null;
  cargando: boolean;
  error: string | null;
  sesion: string;
  acciones?: AccionesPanel;
  alRecargar: () => void;
  alCerrarSesion?: () => void;
}

const ORDEN_INICIAL: Orden = { columna: "fecha", ascendente: false };

function coincideBusqueda(p: P, consulta: string): boolean {
  if (consulta === "") return true;
  return [
    p.radicado_codigo,
    p.semillero_nombre,
    p.institucion_nombre,
    p.tutor_nombre,
  ].some((campo) => campo.toLowerCase().includes(consulta));
}

function contarPorEstado(lista: P[]): ConteosEstado {
  const conteos: ConteosEstado = {
    todos: lista.length,
    pendiente: 0,
    habilitado: 0,
    no_habilitado: 0,
    seleccionado: 0,
  };
  for (const p of lista) conteos[p.estado] += 1;
  return conteos;
}

function textoPendientes(pendientes: number): string {
  if (pendientes === 0) return "No queda nada por revisar";
  if (pendientes === 1) return "Queda 1 postulación por revisar";
  return `Quedan ${pendientes} postulaciones por revisar`;
}

function textoCupos(libres: number): string {
  if (libres === 0) return "todos los cupos asignados";
  return libres === 1 ? "1 cupo libre" : `${libres} cupos libres`;
}

/** La frase de la pantalla: lo que falta por hacer antes de la jornada. */
function fraseSituacion(metricas: MetricasAdmin): string {
  if (metricas.total === 0) return "Aún no se ha radicado ninguna postulación.";
  const libres = Math.max(metricas.cupos_totales - metricas.seleccionados, 0);
  return `${textoPendientes(metricas.pendientes)} y ${textoCupos(libres)}.`;
}

function useExportar(acciones: AccionesPanel) {
  const [exportandoExcel, setExportandoExcel] = useState(false);
  const [exportandoPdf, setExportandoPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportarExcel = async () => {
    setError(null);
    setExportandoExcel(true);
    try {
      const res = await acciones.exportarExcel();
      if (res.success && res.data) {
        descargarExcel(res.data.base64, res.data.nombreArchivo);
      } else {
        setError(
          res.error ||
            "No pudimos generar el archivo de Excel. Inténtalo de nuevo.",
        );
      }
    } catch (err) {
      console.error("Error al descargar el Excel:", err);
      setError(
        "No pudimos descargar el archivo de Excel. Revisa tu conexión e inténtalo de nuevo.",
      );
    } finally {
      setExportandoExcel(false);
    }
  };

  const exportarPdf = async () => {
    setError(null);
    setExportandoPdf(true);
    try {
      const res = await acciones.exportarPdf();
      if (res.success && res.data) {
        descargarPdf(res.data.base64, res.data.nombreArchivo);
      } else {
        setError(
          res.error ||
            "No pudimos generar el documento PDF. Inténtalo de nuevo.",
        );
      }
    } catch (err) {
      console.error("Error al descargar el PDF:", err);
      setError(
        "No pudimos descargar el documento PDF. Revisa tu conexión e inténtalo de nuevo.",
      );
    } finally {
      setExportandoPdf(false);
    }
  };

  return {
    exportarExcel,
    exportandoExcel,
    exportarPdf,
    exportandoPdf,
    error,
  };
}

function useHoraActualizacion(postulaciones: P[]): string | null {
  const [hora, setHora] = useState<string | null>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: la hora cambia cuando llegan datos nuevos.
  useEffect(() => {
    setHora(horaCorta(new Date()));
  }, [postulaciones]);
  return hora;
}

interface CabeceraProps {
  metricas: MetricasAdmin | null;
  hora: string | null;
  cargando: boolean;
  conError: boolean;
  exportandoExcel: boolean;
  exportandoPdf: boolean;
  alRecargar: () => void;
  alExportarExcel: () => void;
  alExportarPdf: () => void;
}

function Cabecera({
  metricas,
  hora,
  cargando,
  conError,
  exportandoExcel,
  exportandoPdf,
  alRecargar,
  alExportarExcel,
  alExportarPdf,
}: CabeceraProps) {
  const sinDatos = conError
    ? "Los expedientes no están disponibles por ahora."
    : "Consultando expedientes…";
  return (
    <header className="adm-cabecera">
      <div className="adm-cabecera-texto">
        <h1>Postulaciones</h1>
        <p>{metricas ? fraseSituacion(metricas) : sinDatos}</p>
      </div>
      <div className="adm-cabecera-acciones">
        {hora && metricas && !cargando && (
          <span className="adm-hora">Actualizado {hora}</span>
        )}
        <button
          type="button"
          className="adm-boton adm-boton-suave"
          onClick={alRecargar}
          disabled={cargando}
          aria-label="Actualizar"
        >
          <IconoRefrescar />
          <span className="adm-solo-ancho">
            {cargando ? "Actualizando…" : "Actualizar"}
          </span>
        </button>
        <button
          type="button"
          className="adm-boton adm-boton-suave border-emerald-300 text-emerald-800 hover:bg-emerald-50"
          onClick={alExportarPdf}
          disabled={exportandoPdf}
          title="Descarga el acta oficial en PDF con los 10 semilleros seleccionados"
        >
          <IconoDescarga />
          {exportandoPdf ? "Generando PDF…" : "Acta Seleccionados (.pdf)"}
        </button>
        <button
          type="button"
          className="adm-boton adm-boton-primario"
          onClick={alExportarExcel}
          disabled={exportandoExcel}
          title="Descarga un archivo Excel completo con cuatro hojas"
        >
          <IconoDescarga />
          {exportandoExcel ? "Generando Excel…" : "Exportar a Excel"}
        </button>
      </div>
    </header>
  );
}

interface BarraFiltrosProps {
  busqueda: string;
  nivel: FiltroNivel;
  metricas: MetricasAdmin | null;
  visibles: number;
  total: number;
  alBuscar: (valor: string) => void;
  alElegirNivel: (nivel: FiltroNivel) => void;
}

function BarraFiltros({
  busqueda,
  nivel,
  metricas,
  visibles,
  total,
  alBuscar,
  alElegirNivel,
}: BarraFiltrosProps) {
  return (
    <div className="adm-filtros">
      <div className="adm-busqueda">
        <IconoBuscar />
        <input
          type="search"
          value={busqueda}
          onChange={(e) => alBuscar(e.target.value)}
          placeholder="Buscar postulación"
          aria-label="Buscar postulaciones"
        />
      </div>
      <select
        className="adm-selector"
        value={nivel}
        aria-label="Filtrar por nivel"
        onChange={(e) => alElegirNivel(e.target.value as FiltroNivel)}
      >
        <option value="todos">Nivel: todos</option>
        <option value="basica_media">
          Básica y media{metricas ? ` (${metricas.basica_media})` : ""}
        </option>
        <option value="superior">
          Educación superior{metricas ? ` (${metricas.superior})` : ""}
        </option>
      </select>
      <p className="adm-total" aria-live="polite">
        {visibles} de {total}
      </p>
    </div>
  );
}

/** Lista de trabajo del expediente: se congela al abrir para que guardar no la mueva. */
function useExpediente(postulaciones: P[]) {
  const [abierto, setAbierto] = useState<{ id: string; ids: string[] } | null>(
    null,
  );
  const actual = abierto
    ? (postulaciones.find((p) => p.id === abierto.id) ?? null)
    : null;
  const indice = abierto && actual ? abierto.ids.indexOf(actual.id) : -1;

  const moverA = (destino: number) => {
    const id = abierto?.ids[destino];
    if (abierto && id) setAbierto({ ...abierto, id });
  };

  return {
    actual,
    indice,
    total: abierto?.ids.length ?? 0,
    abrir: (id: string, ids: string[]) => setAbierto({ id, ids }),
    cerrar: () => setAbierto(null),
    moverA,
  };
}

export function PanelPostulaciones({
  postulaciones,
  metricas,
  cargando,
  error,
  sesion,
  acciones = ACCIONES_REALES,
  alRecargar,
  alCerrarSesion,
}: PanelPostulacionesProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [filtroNivel, setFiltroNivel] = useState<FiltroNivel>("todos");
  const [orden, setOrden] = useState<Orden>(ORDEN_INICIAL);
  const [postulacionAEliminar, setPostulacionAEliminar] = useState<P | null>(
    null,
  );
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);
  const borradores = useRef(new Map<string, BorradorEvaluacion>());
  const hora = useHoraActualizacion(postulaciones);
  const {
    exportarExcel,
    exportandoExcel,
    exportarPdf,
    exportandoPdf,
    error: errorExportar,
  } = useExportar(acciones);
  const expediente = useExpediente(postulaciones);

  const solicitarEliminar = (postulacion: P) => {
    setErrorEliminar(null);
    setPostulacionAEliminar(postulacion);
  };

  const cancelarEliminar = () => {
    if (!eliminando) {
      setPostulacionAEliminar(null);
      setErrorEliminar(null);
    }
  };

  const confirmarEliminar = async () => {
    if (!postulacionAEliminar) return;
    setErrorEliminar(null);
    setEliminando(true);
    try {
      const res = await acciones.eliminarPostulacion(postulacionAEliminar.id);
      if (res.success) {
        if (expediente.actual?.id === postulacionAEliminar.id) {
          expediente.cerrar();
        }
        setPostulacionAEliminar(null);
        alRecargar();
      } else {
        setErrorEliminar(
          res.error ||
            "No se pudo eliminar la postulación. Inténtalo de nuevo.",
        );
      }
    } catch (err) {
      console.error("Error al eliminar postulación:", err);
      setErrorEliminar(
        "Ocurrió un error inesperado al intentar eliminar la postulación.",
      );
    } finally {
      setEliminando(false);
    }
  };

  // Los conteos respetan búsqueda y nivel; el estado es lo que ellos mismos filtran.
  const enAlcance = useMemo(() => {
    const consulta = busqueda.trim().toLowerCase();
    return postulaciones.filter(
      (p) =>
        coincideBusqueda(p, consulta) &&
        (filtroNivel === "todos" || p.institucion_tipo === filtroNivel),
    );
  }, [postulaciones, busqueda, filtroNivel]);

  const visibles = useMemo(() => {
    const filtradas =
      filtroEstado === "todos"
        ? enAlcance
        : enAlcance.filter((p) => p.estado === filtroEstado);
    return ordenarPostulaciones(filtradas, orden);
  }, [enAlcance, filtroEstado, orden]);

  const ordenarPor = (columna: ColumnaOrden) =>
    setOrden((previo) => ({
      columna,
      ascendente: previo.columna === columna ? !previo.ascendente : true,
    }));

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroEstado("todos");
    setFiltroNivel("todos");
  };

  return (
    <MarcoAdmin sesion={sesion} alCerrarSesion={alCerrarSesion}>
      <Cabecera
        metricas={metricas}
        hora={hora}
        cargando={cargando}
        conError={error !== null}
        exportandoExcel={exportandoExcel}
        exportandoPdf={exportandoPdf}
        alRecargar={alRecargar}
        alExportarExcel={exportarExcel}
        alExportarPdf={exportarPdf}
      />

      {errorExportar && (
        <p className="adm-aviso" role="alert">
          {errorExportar}
        </p>
      )}
      {error && postulaciones.length > 0 && (
        <p className="adm-aviso" role="alert">
          {error}{" "}
          <button type="button" onClick={alRecargar}>
            Reintentar
          </button>
        </p>
      )}

      <MetricasDashboard
        metricas={metricas}
        conteos={contarPorEstado(enAlcance)}
        filtro={filtroEstado}
        alFiltrar={setFiltroEstado}
        cargando={cargando && postulaciones.length === 0}
      />

      <BarraFiltros
        busqueda={busqueda}
        nivel={filtroNivel}
        metricas={metricas}
        visibles={visibles.length}
        total={postulaciones.length}
        alBuscar={setBusqueda}
        alElegirNivel={setFiltroNivel}
      />

      <TablaPostulaciones
        postulaciones={visibles}
        totalSinFiltrar={postulaciones.length}
        orden={orden}
        cargando={cargando}
        error={error}
        alOrdenar={ordenarPor}
        alSeleccionarPostulacion={(p) =>
          expediente.abrir(
            p.id,
            visibles.map((v) => v.id),
          )
        }
        alSolicitarEliminar={solicitarEliminar}
        alReintentar={alRecargar}
        alLimpiarFiltros={limpiarFiltros}
      />

      <AnimatePresence>
        {expediente.actual && (
          <ExpedienteModal
            key="expediente"
            postulacion={expediente.actual}
            posicion={expediente.indice}
            total={expediente.total}
            acciones={acciones}
            borradores={borradores.current}
            alMover={expediente.moverA}
            alCerrar={expediente.cerrar}
            alActualizar={alRecargar}
            alSolicitarEliminar={solicitarEliminar}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {postulacionAEliminar && (
          <DialogoConfirmarEliminar
            key="dialogo-eliminar"
            postulacion={postulacionAEliminar}
            eliminando={eliminando}
            error={errorEliminar}
            alConfirmar={confirmarEliminar}
            alCancelar={cancelarEliminar}
          />
        )}
      </AnimatePresence>
    </MarcoAdmin>
  );
}
