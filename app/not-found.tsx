import { SiluetaCauca } from "@/components/sitio/pieza-cauca";

export default function NoEncontrada() {
  return (
    <main className="grid min-h-svh place-items-center bg-azul p-5 text-papel">
      <div className="w-full max-w-xl">
        <SiluetaCauca clase="w-16 text-lima" />
        <h1 className="mt-6 text-titulo">Esta hoja no está en el expediente</h1>
        <p className="mt-4 text-entrada">
          La página que buscas no existe o cambió de lugar.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a className="boton boton-lima" href="/">
            Ir al inicio
          </a>
          <a className="boton boton-suave" href="/postulacion">
            Postular equipo
          </a>
        </div>
      </div>
    </main>
  );
}
