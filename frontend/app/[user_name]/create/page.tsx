"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDemo } from "@/components/CalendarComponent";
import { useUserContext } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
import { Topic } from "@/lib/types";
import { useUploadImage } from "@/hooks/useUploadImage";

type QueryParamsType = {
  data: Array<Topic>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

const getTopicsFn = async (id: number) => {
  const response = await fetch(`http://localhost:3000/api/users/${id}/topics`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${document.cookie.replace(
        /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
        "$1"
      )}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "No se ha podido obtener los topics");
  }

  return data;
};

const postSchema = z.object({
  title: z.string().min(1, "Debe tener más de 1 carácter de longitud"),
  picture: z
    .any()
    .refine((file) => file instanceof File, {
      message: "Foto obligatoria",
    })
    .refine((file) => file?.size < 5 * 1024 * 1024, {
      // Límite de 5MB
      message: "El tamaño del archivo debe ser menor a 5MB",
    })
    .refine((file) => ["image/jpeg", "image/png"].includes(file?.type), {
      message: "Solo están permitidos los archivos JPEG y PNG",
    }),
  topicID: z.number().nullable(),
});

const eventSchema = z.object({
  name: z.string().min(1, "Debe tener más de 1 carácter de longitud"),
  description: z.string().optional(),
  location: z.string().min(2, "Debe tener más de 2 carácteres de longitud"),
  date: z.date(),
  picture: z
    .any()
    .refine((file) => file instanceof File, {
      message: "Foto obligatoria",
    })
    .refine((file) => file?.size < 5 * 1024 * 1024, {
      // Límite de 5MB
      message: "El tamaño del archivo debe ser menor a 5MB",
    })
    .refine((file) => ["image/jpeg", "image/png"].includes(file?.type), {
      message: "Solo están permitidos los archivos JPEG y PNG",
    }),
  topicID: z.number().nullable(),
});

type FormPostData = z.infer<typeof postSchema>;
type FormEventData = z.infer<typeof eventSchema>;

const createPostFn = async (body: FormPostData) => {
  const { uploadImage } = useUploadImage();

  if (!body.picture) {
    throw new Error("No hay archivo para subir la imagen");
  }

  const imageURL = await uploadImage(body.picture);

  const response = await fetch("http://localhost:3000/api/posts", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${document.cookie.replace(
        /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
        "$1"
      )}`,
    },
    body: JSON.stringify({
      title: body.title,
      topic_id: body.topicID,
      picture: imageURL,
    }),
  });

  if (!response.ok) {
    throw new Error("fallo al crear el post");
  }

  return { status: response.status, message: "post creado" };
};

const createEventFn = async (body: FormEventData) => {
  const response = await fetch("http://localhost:3000/api/events", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${document.cookie.replace(
        /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
        "$1"
      )}`,
    },
    body: JSON.stringify({
      name: body.name,
      description: body.description ?? "",
      topic_id: body.topicID,
      picture: body.picture.name,
      location: body.location,
      date: body.date,
    }),
  });

  if (!response.ok) {
    throw new Error("fallo al crear el post");
  }

  return { status: response.status, message: "evento creado" };
};

function FormPost({ data, isLoading, isError, error }: QueryParamsType) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormPostData>({
    resolver: zodResolver(postSchema),
  });

  const mutation = useMutation({
    mutationFn: createPostFn,
    onSuccess: () => {
      reset();
      toast({
        description: `✅ Se ha creado el post exitosamente`,
      });
    },
  });

  const onSubmit = (dataForm: FormPostData) => {
    mutation.mutate(dataForm);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("picture", file);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-4xl font-bold text-center mb-6">Crear Publicación</h2>
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="title">Titulo:</Label>
          <Input type="text" id="title" {...register("title")} />
          {errors.title && (
            <p className="text-red-600">{errors.title.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="file">Foto:</Label>
          <Input
            type="file"
            id="file"
            accept="image/png, image/jpeg"
            onChange={handleFileChange}
          />
          {errors.picture && (
            <p className="text-red-600">{errors.picture.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="topics">Selecciona el tema para el post:</Label>
          <ul className="list-none flex gap-4" id="topics">
            {isLoading ? (
              <li>Loading...</li>
            ) : (
              data?.map((topic: Topic) => (
                <li
                  key={topic.id}
                  onClick={() =>
                    setValue(
                      "topicID",
                      watch("topicID") === topic.id ? null : topic.id
                    )
                  }
                  className="cursor-pointer"
                >
                  <Badge
                    className={
                      watch("topicID") === topic.id
                        ? "bg-lime-500 text-white py-2 px-4"
                        : "py-2 px-4"
                    }
                  >
                    {topic.name}
                  </Badge>
                </li>
              ))
            )}
          </ul>
          {errors.topicID && (
            <p className="text-red-600">{errors.topicID.message}</p>
          )}
        </div>
        {isError && <p className="text-red-600">{error?.message}</p>}
        <Button
          type="submit"
          disabled={
            isError || isLoading || typeof watch("topicID") !== "number"
          }
          className="w-full"
        >
          Crear
        </Button>
      </div>
    </form>
  );
}

function FormEvent({ data, isLoading, isError, error }: QueryParamsType) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormEventData>({
    resolver: zodResolver(eventSchema),
  });

  const mutation = useMutation({
    mutationFn: createEventFn,
    onSuccess: () => {
      reset();
      toast({
        description: `✅ Se ha creado el evento exitosamente`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        description: `❌ Error al crear el evento: ${error.message}`,
      });
    },
  });

  const onSubmit = (dataForm: FormEventData) => {
    mutation.mutate(dataForm);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("picture", file);
    }
  };

  const selectedDate = watch("date");

  return (
    <form id="formEvents" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-4xl font-bold text-center mb-4">Crear Evento</h2>
      <div className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor="name">Nombre:</Label>
          <Input type="text" id="name" {...register("name")} />
          {errors.name && <p className="text-red-600">{errors.name.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="description">Descripción:</Label>
          <Input type="text" id="description" {...register("description")} />
          {errors.description && (
            <p className="text-red-600">{errors.description.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="location">Localización:</Label>
          <Input type="text" id="location" {...register("location")} />
          {errors.location && (
            <p className="text-red-600">{errors.location.message}</p>
          )}
        </div>
        <div className="flex justify-between align-top gap-5">
          <div className="w-1/2 flex flex-col space-y-1">
            <Label htmlFor="date">Fecha:</Label>
            <CalendarDemo
              value={selectedDate}
              onChangeAction={(date) => {
                if (date) {
                  setValue("date", date);
                }
              }}
            />
            {errors.date && (
              <p className="text-red-600">{errors.date.message}</p>
            )}
          </div>
          <div className="w-1/2 flex flex-col space-y-1">
            <Label htmlFor="file">Foto:</Label>
            <Input
              type="file"
              id="file"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
            />
            {errors.picture && (
              <p className="text-red-600">{errors.picture.message}</p>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="topics">Selecciona el tema para el evento:</Label>
          <ul className="list-none flex gap-4" id="topics">
            {isLoading ? (
              <li>Loading...</li>
            ) : (
              data?.map((topic: Topic) => (
                <li
                  key={topic.id}
                  onClick={() =>
                    setValue(
                      "topicID",
                      watch("topicID") === topic.id ? null : topic.id
                    )
                  }
                  className="cursor-pointer"
                >
                  <Badge
                    className={
                      watch("topicID") === topic.id
                        ? "bg-lime-500 text-white py-2 px-4"
                        : "py-2 px-4"
                    }
                  >
                    {topic.name}
                  </Badge>
                </li>
              ))
            )}
          </ul>
          {errors.topicID && (
            <p className="text-red-600">{errors.topicID.message}</p>
          )}
        </div>
        {isError && <p className="text-red-600">{error?.message}</p>}
        <Button
          type="submit"
          disabled={
            isError || isLoading || typeof watch("topicID") !== "number"
          }
          className="w-full"
        >
          Crear
        </Button>
      </div>
    </form>
  );
}

export default function Page() {
  const { user } = useUserContext();
  const [isLoginSelected, setIsLoginSelected] = useState<boolean>(true);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["topics", user?.id],
    queryFn: () => getTopicsFn(user!.id),
    enabled: !!user?.id,
  });

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-100 text-black ">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <div className="relative flex justify-between mb-5 bg-gray-200 rounded-sm overflow-hidden">
          <motion.div
            className="absolute top-0 bottom-0 w-1/2 bg-lime-500 hover:bg-lime-600 rounded-sm"
            animate={{ x: isLoginSelected ? "0%" : "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />

          <p
            className="relative flex-1 text-center py-3 cursor-pointer z-10"
            onClick={() => setIsLoginSelected(true)}
          >
            Publicación
          </p>

          <p
            className="relative flex-1 text-center py-3 cursor-pointer z-10"
            onClick={() => setIsLoginSelected(false)}
          >
            Evento
          </p>
        </div>
        {isLoginSelected ? (
          <FormPost
            data={data}
            isLoading={isLoading}
            error={error}
            isError={isError}
          />
        ) : (
          <FormEvent
            data={data}
            isLoading={isLoading}
            error={error}
            isError={isError}
          />
        )}
      </div>
    </div>
  );
}
