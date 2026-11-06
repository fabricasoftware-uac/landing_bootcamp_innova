/**
 * Comprime y escala imágenes (JPEG/PNG) en el navegador del cliente antes de enviarlas al servidor.
 * Esto reduce fotos pesadas de celulares (4 a 8 MB) a ~150-300 KB, garantizando que el formulario
 * no supere los límites de payload (4.5 MB) de funciones Serverless en Vercel ni el bodySizeLimit de Next.js.
 */
export async function comprimirImagenEnNavegador(file: File): Promise<File> {
  if (typeof window === "undefined" || !file.type.startsWith("image/")) {
    return file;
  }

  // Si ya es liviana (<= 800 KB), mantenerla intacta
  if (file.size <= 800 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDimension = 1600;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              resolve(file);
              return;
            }
            const cleanName = `${file.name.replace(/\.[^/.]+$/, "")}.jpg`;
            const compressedFile = new File([blob], cleanName, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          0.82,
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
