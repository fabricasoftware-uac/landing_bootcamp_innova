"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  type MetricasAdmin,
  obtenerPostulacionesAdminAction,
  type PostulacionAdminDetalle,
} from "@/app/actions/admin";
import { AuthAdmin } from "@/components/admin/auth-admin";
import { ExpedienteModal } from "@/components/admin/expediente-modal";
import { MetricasDashboard } from "@/components/admin/metricas-dashboard";
import { TablaPostulaciones } from "@/components/admin/tabla-postulaciones";
import { createClient } from "@/lib/supabase/client";

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState<boolean | null>(null);
  const [postulaciones, setPostulaciones] = useState<PostulacionAdminDetalle[]>(
    [],
  );
  const [metricas, setMetricas] = useState<MetricasAdmin | null>(null);
  const [postulacionSeleccionada, setPostulacionSeleccionada] =
    useState<PostulacionAdminDetalle | null>(null);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // 1. Verificar sesión existente con Supabase Auth
  useEffect(() => {
    let unsubscribeFn: (() => void) | null = null;

    try {
      const supabase = createClient();

      const verificarSesion = async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          setAutenticado(Boolean(session));
        } catch {
          setAutenticado(false);
        }
      };

      verificarSesion();

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setAutenticado(Boolean(session));
      });
      unsubscribeFn = () => subscription.unsubscribe();
    } catch (err) {
      console.error("Error al inicializar sesión admin:", err);
      setAutenticado(false);
      setErrorCarga(
        err instanceof Error
          ? err.message
          : "Error de configuración de Supabase en este entorno.",
      );
    }

    return () => {
      if (unsubscribeFn) {
        unsubscribeFn();
      }
    };
  }, []);

  // 2. Cargar postulaciones y métricas
  const cargarPostulaciones = useCallback(async () => {
    setCargandoDatos(true);
    setErrorCarga(null);

    try {
      const res = await obtenerPostulacionesAdminAction();
      if (res.success && res.data) {
        setPostulaciones(res.data.postulaciones);
        setMetricas(res.data.metricas);

        // Si hay una postulación abierta en el modal, actualizarla con los datos frescos
        setPostulacionSeleccionada((prev) => {
          if (!prev) return null;
          return res.data?.postulaciones.find((p) => p.id === prev.id) || null;
        });
      } else {
        setErrorCarga(res.error || "No se pudieron obtener las postulaciones.");
      }
    } catch (err) {
      setErrorCarga(
        err instanceof Error
          ? err.message
          : "Error de red al consultar postulaciones.",
      );
    } finally {
      setCargandoDatos(false);
    }
  }, []);

  useEffect(() => {
    if (autenticado) {
      cargarPostulaciones();
    }
  }, [autenticado, cargarPostulaciones]);

  const handleCerrarSesion = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error cerrando sesión:", err);
    }
    setAutenticado(false);
    setPostulaciones([]);
    setMetricas(null);
  };

  // Estado de comprobación de sesión inicial
  if (autenticado === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f4ec]">
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-[#10384f]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#006b5c] border-t-transparent" />
          <span>Verificando permisos de acceso...</span>
        </div>
      </div>
    );
  }

  // Pantalla de autenticación si no está logueado
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-[#f5f4ec]">
        <header className="border-b border-[#10384f]/15 bg-white/70 px-6 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <img
                src="/images/redesign/cauca-innova-logo.png"
                width="140"
                height="70"
                alt="Cauca INNOVA"
                className="h-8 w-auto object-contain"
              />
            </a>
            <a
              href="/"
              className="text-xs font-bold text-[#10384f] hover:underline"
            >
              ← Portal Principal
            </a>
          </div>
        </header>

        {errorCarga && (
          <div className="mx-auto mt-6 max-w-md px-4">
            <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs font-semibold text-rose-800 shadow-sm">
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
                <span>⚠️</span> Configuración requerida
              </div>
              <p className="mt-1">{errorCarga}</p>
            </div>
          </div>
        )}

        <AuthAdmin alAutenticar={() => setAutenticado(true)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f4ec] text-[#10384f]">
      {/* Cabecera Superior del Panel */}
      <header className="sticky top-0 z-30 border-b border-[#10384f]/15 bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a href="/" title="Ir a la portada pública">
              <img
                src="/images/redesign/cauca-innova-logo.png"
                width="140"
                height="70"
                alt="Cauca INNOVA"
                className="h-8 w-auto object-contain"
              />
            </a>
            <div className="hidden sm:block border-l border-[#10384f]/20 pl-4">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#006b5c]">
                Bootcamp Cauca INNOVA 2026
              </span>
              <h1 className="text-sm font-black text-[#10384f]">
                Panel de Evaluación y Administración
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex rounded-lg border border-[#10384f]/20 px-3 py-1.5 text-xs font-semibold text-[#10384f] hover:bg-[#10384f]/5"
            >
              Ver Portal Público ↗
            </a>
            <button
              type="button"
              onClick={handleCerrarSesion}
              className="rounded-lg bg-[#10384f] px-3.5 py-1.5 text-xs font-bold text-[#f5f4ec] transition hover:bg-rose-700"
            >
              Cerrar Sesión ✕
            </button>
          </div>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        {/* Banner de Estado */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-[#10384f] sm:text-3xl">
              Expedientes de Postulaciones
            </h2>
            <p className="mt-1 text-xs text-[#10384f]/70 sm:text-sm">
              Revisión técnica, verificación de requisitos habilitantes y
              calificación ponderada oficial TDR.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#006b5c]/10 px-3 py-1 text-xs font-bold text-[#006b5c]">
              <span className="h-2 w-2 rounded-full bg-[#006b5c] animate-pulse" />
              Sincronización en Tiempo Real
            </span>
          </div>
        </div>

        {/* Métricas Consolidadas */}
        {metricas && <MetricasDashboard metricas={metricas} />}

        {errorCarga && (
          <div
            className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs font-semibold text-rose-800"
            role="alert"
          >
            {errorCarga}
          </div>
        )}

        {/* Tabla Maestra con Filtros y Exportación Excel */}
        {cargandoDatos && postulaciones.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-[#10384f]/15 bg-white p-12">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-[#006b5c]">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Cargando base de postulaciones...</span>
            </div>
          </div>
        ) : (
          <TablaPostulaciones
            postulaciones={postulaciones}
            alSeleccionarPostulacion={(p) => setPostulacionSeleccionada(p)}
            alRecargar={cargarPostulaciones}
          />
        )}
      </main>

      {/* Modal / Drawer de Expediente Digital */}
      {postulacionSeleccionada && (
        <ExpedienteModal
          postulacion={postulacionSeleccionada}
          alCerrar={() => setPostulacionSeleccionada(null)}
          alActualizar={() => {
            startTransition(() => {
              cargarPostulaciones();
            });
          }}
        />
      )}
    </div>
  );
}
