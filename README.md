# Cauca INNOVA · Bootcamp de Semilleros de Investigación 2026

Plataforma oficial de divulgación, postulación en línea y evaluación técnica para el **Bootcamp de Semilleros de Investigación Cauca INNOVA**, convocado por la **Gobernación del Cauca** (Secretaría de Desarrollo Económico y Competitividad) en alianza con la **Corporación Universitaria Autónoma del Cauca (Uniautónoma)**.

* **Fecha Oficial del Evento:** 15 de noviembre de 2026 (Jornada única presencial de formación, mentoría y prototipado).
* **Cupos Convocatoria:** 6 semilleros de investigación seleccionados (18 estudiantes participantes en total, 3 por equipo).
* **Público Objetivo:** Estudiantes activos de colegios (Educación Básica y Media) y universidades o tecnológicos (Educación Superior) del departamento del Cauca.

---

## 🗺️ Mapa de Rutas de la Aplicación

| Ruta | Acceso | Descripción y Funcionalidad |
| :--- | :---: | :--- |
| **`/`** | Público | **Portal Principal / Landing Page:** Portada editorial tipo póster con parallax desacoplado, introducción omisible, agenda temática, descarga de Términos de Referencia oficiales y simulador de prototipado en laboratorio. |
| **`/postulacion`** | Público | **Formulario Multi-paso de Inscripción:** Wizard interactivo de 5 pasos con validación en tiempo real (Zod), registro de tutor, equipo de 3 estudiantes, justificación de intereses, carga segura de soportes al bucket privado de Supabase Storage y generación de radicado oficial (`INNOVA-2026-XXXX`). |
| **`/admin`** | Restringido | **Panel de Evaluación y Administración:** Tablero de métricas en tiempo real (cupos ocupados, distribución colegios/universidades), buscador reactivo, expediente digital con enlaces temporales seguros (Signed URLs), calificación ponderada oficial TDR (Motivación 30%, Pertinencia 30%, Diversidad 20%, Representación 20%) y exportación a Excel (.xlsx). |

---

## 🛠️ Stack Tecnológico

* **Framework:** Next.js 16 (App Router con Server Components y Server Actions)
* **Librería UI:** React 19 y Tailwind CSS v4
* **Lenguaje:** TypeScript estricto
* **Base de Datos & Backend:** Supabase (PostgreSQL 15+, Row Level Security estricto y Supabase Storage)
* **Autenticación & Autorización:** Supabase Auth con claim `app_metadata.role = 'admin'`
* **Validación de Esquemas:** Zod con refinamiento dinámico para menores de edad
* **Reportes & Exportación:** ExcelJS para libros nativos de cálculo estructurados en 3 hojas
* **Animaciones:** GSAP y @gsap/react con soporte de accesibilidad (`prefers-reduced-motion`)
* **Linter & Formateador:** Biome
* **Testing:** Vitest para pruebas unitarias y de integración

---

## ⚙️ Variables de Entorno Requeridas

Cree un archivo `.env.local` en la raíz del proyecto tomando como referencia [`.env.example`](file:///Users/salomontilla/Fabrica_Software/bootcamp_innova/.env.example):

```env
# URL base del proyecto Supabase (Dashboard -> Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# Llave anónima pública (segura para exponer en cliente mediante prefijo NEXT_PUBLIC_)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key

# Llave de rol de servicio (SECRETA: uso exclusivo en servidor / Server Actions)
# NUNCA exponer en cliente ni prefijar con NEXT_PUBLIC_
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-role-key
```

---

## 🚀 Comandos del Proyecto

Se requiere **Node.js 22 o superior** y el gestor de paquetes **pnpm** (o npm como alternativa).

```sh
# 1. Instalar dependencias
pnpm install

# 2. Iniciar servidor de desarrollo en http://127.0.0.1:3000
pnpm dev

# 3. Ejecutar suite de pruebas unitarias y de integración
pnpm test

# 4. Validar formato y calidad de código con Biome
pnpm lint

# 5. Comprobar tipos TypeScript
pnpm typecheck

# 6. Compilar build optimizado para producción
pnpm build

# 7. Iniciar servidor compilado en producción
pnpm start
```

---

## 📚 Documentación Técnica Especializada

Para consultar el detalle técnico y operativo, remítase a los siguientes documentos:

* 📖 **[Manual Operativo de Administración y Evaluación (`docs/manual-administracion.md`)](file:///Users/salomontilla/Fabrica_Software/bootcamp_innova/docs/manual-administracion.md):**  
  Guía paso a paso para el comité técnico evaluador: acceso seguro, interpretación de métricas, búsqueda/filtrado, apertura de expedientes, previsualización de documentos confidenciales con Signed URLs de 5 minutos, aplicación de la rúbrica de calificación TDR y exportación a Excel.

* 🏗️ **[Arquitectura Integral del Sistema (`docs/arquitectura-sistema.md`)](file:///Users/salomontilla/Fabrica_Software/bootcamp_innova/docs/arquitectura-sistema.md):**  
  Diagramas Mermaid (`flowchart TD`, `sequenceDiagram`, `erDiagram`), diccionario de datos de las cuatro tablas (`postulaciones`, `integrantes`, `documentos_postulacion`, `evaluaciones`), políticas de Row Level Security (RLS) a prueba de IDOR/BOLA, cumplimiento de la Ley 1581 (Habeas Data) y Código de la Infancia, y flujo transaccional con reversión preventiva (rollback).

* 📄 **[Términos de Referencia Originales (`docs/terms-source.md`)](file:///Users/salomontilla/Fabrica_Software/bootcamp_innova/docs/terms-source.md):**  
  Transcripción y análisis analítico del documento rector de la convocatoria.
