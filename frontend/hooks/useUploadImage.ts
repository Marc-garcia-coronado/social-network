import { useCallback } from "react";

export const useUploadImage = () => {
  const uploadImage = useCallback(async (file: File): Promise<string> => {
    if (!file) {
      throw new Error("No hay archivo para subir la imagen");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Error al subir la imagen");
    }

    const data = await response.json();
    return data.secure_url; // Retorna la URL segura de la imagen subida
  }, []);

  return { uploadImage };
};