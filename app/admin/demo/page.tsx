import { notFound } from "next/navigation";
import { PanelDemo, type VistaDemo } from "@/components/admin/panel-demo";
import "../admin.css";

const VISTAS: VistaDemo[] = ["datos", "cargando", "error", "vacio", "ingreso"];

/* Solo para revisar el diseño en desarrollo: en producción esta ruta no existe. */
export default async function AdminDemoPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string | string[] }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const { vista } = await searchParams;
  const elegida = VISTAS.find((v) => v === vista) ?? "datos";
  return <PanelDemo vista={elegida} />;
}
