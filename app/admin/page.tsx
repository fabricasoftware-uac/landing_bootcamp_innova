"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type MetricasAdmin,
  obtenerPostulacionesAdminAction,
  type PostulacionAdminDetalle,
} from "@/app/actions/admin";
import { AuthAdmin } from "@/components/admin/auth-admin";
import { PanelPostulaciones } from "@/components/admin/panel-postulaciones";
import { createClient } from "@/lib/supabase/client";
import "./admin.css";

const MENSAJE_SIN_SERVICIO =
  "No pudimos iniciar sesión en este momento. Inténtalo de nuevo en unos minutos.";

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState<boolean | null>(null);
  const [postulaciones, setPostulaciones] = useState<PostulacionAdminDetalle[]>(
    [],
  );
  const [metricas, setMetricas] = useState<MetricasAdmin | null>(null);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

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
      // Sin configuración mostramos el login normal; el aviso es amable y genérico.
      setErrorCarga(MENSAJE_SIN_SERVICIO);
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
      } else {
        setErrorCarga(res.error || "No se pudieron obtener las postulaciones.");
      }
    } catch (err) {
      console.error("Error al consultar postulaciones:", err);
      setErrorCarga(
        "No pudimos cargar las postulaciones. Revisa tu conexión e inténtalo de nuevo.",
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
    setErrorCarga(null);
    setPostulaciones([]);
    setMetricas(null);
  };

  // Estado de comprobación de sesión inicial
  if (autenticado === null) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-nube">
        <p className="text-pequeno font-semibold" role="status">
          Comprobando la sesión…
        </p>
      </div>
    );
  }

  // Pantalla de autenticación si no está logueado
  if (!autenticado) {
    return (
      <main className="bg-papel">
        <AuthAdmin
          alAutenticar={() => setAutenticado(true)}
          avisoInicial={errorCarga}
        />
      </main>
    );
  }

  return (
    <PanelPostulaciones
      postulaciones={postulaciones}
      metricas={metricas}
      cargando={cargandoDatos || (metricas === null && errorCarga === null)}
      error={errorCarga}
      sesion="Comité Técnico Evaluador"
      alRecargar={cargarPostulaciones}
      alCerrarSesion={handleCerrarSesion}
    />
  );
}
