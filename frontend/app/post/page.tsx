"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserContext } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function Page() {
  return (
    <div>
      <PostForm />
    </div>
  );
}

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

type FormPostData = z.infer<typeof postSchema>;

type PostFormProps = {
  className?: string;
};

const PostForm = ({ className }: PostFormProps) => {
  const { user } = useUserContext();
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

  const getTopicsFn = async (id: number) => {
    const response = await fetch(
      `http://localhost:3000/api/users/${id}/topics`,
      {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${document.cookie.replace(
            /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
            "$1"
          )}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No se ha podido hacer login");
    }

    return data;
  };

  const {
    data: topics,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["topics", user?.id],
    queryFn: () => getTopicsFn(user!.id),
    enabled: !!user?.id,
  });

  const createPostFn = async (body: FormPostData) => {
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
        picture: body.picture.name,
      }),
    });

    if (!response.ok) {
      throw new Error("fallo al crear el post");
    }

    return { status: response.status, message: "post creado" };
  };

  const mutation = useMutation({
    mutationFn: createPostFn,
    onSuccess: () => {
      reset()
      toast({
        description: `✅ Se ha creado el post exitosamente`,
      })
    },
  });

  const onSubmit = (data: FormPostData) => {
    mutation.mutate(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("picture", file);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`${className} max-w-96 h-screen mx-auto flex flex-col items-center justify-center`}
    >
      <h2 className="text-4xl font-bold text-center mb-6">Crear Post</h2>
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
              <p>Loading...</p>
            ) : (
              topics?.map((topic: Topic) => (
                <li
                  key={topic.id}
                  onClick={() =>
                    setValue(
                      "topicID",
                      watch("topicID") === topic.id ? null : topic.id
                    )
                  }
                >
                  <Badge
                    className={`${
                      watch("topicID") === topic.id
                        ? "bg-yellow-600 hover:bg-yellow-500"
                        : ""
                    } cursor-pointer py-2 px-4`}
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
        {isError && <p className="text-red-600">{error.message}</p>}
        <Button type="submit" disabled={isError || isLoading || typeof watch("topicID") !== "number" } className="w-full">
          Crear
        </Button>
      </div>
    </form>
  );
};
