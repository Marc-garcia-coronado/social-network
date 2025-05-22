export const uploadImage = async (file: File): Promise<string> => {
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
    const errorData = await response.json();
    console.error("Error al subir la imagen:", errorData);
    throw new Error("Error al subir la imagen");
  }

  const data = await response.json();
  return data.secure_url;
};