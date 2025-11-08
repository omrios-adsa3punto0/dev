// src/services/storageHelpers.ts
import { storage } from "../firebaseConfig";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

/**
 * Sube un archivo a Firebase Storage y opcionalmente elimina el anterior.
 * @param file Archivo a subir
 * @param path Ruta en storage (ej: contracts/{accountId}/{contractId}/{fieldName}_{timestamp})
 * @param previousUrl URL anterior (si quieres borrar el archivo previo)
 * @returns URL de descarga del archivo subido
 */
export async function uploadAndReplaceFile(
  file: File,
  path: string,
  previousUrl?: string
): Promise<string> {
  try {
    // 🔹 Borrar anterior si existe
    if (previousUrl) {
      try {
        const prevRef = ref(storage, previousUrl);
        await deleteObject(prevRef);
      } catch (err) {
        console.warn("No se pudo borrar archivo anterior:", err);
      }
    }

    // 🔹 Subir nuevo archivo
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);

    // 🔹 Obtener URL pública
    return await getDownloadURL(storageRef);
  } catch (err) {
    console.error("Error en uploadAndReplaceFile:", err);
    throw err;
  }
}
