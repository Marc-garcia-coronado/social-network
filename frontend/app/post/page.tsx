"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Suspense } from "react";
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
  topicID: z.number(),
});

type FormPostData = z.infer<typeof postSchema>;

type PostFormProps = {
  className?: string;
};

const PostForm = ({ className }: PostFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormPostData>({
    resolver: zodResolver(postSchema),
  });

  const onSubmit = (data: FormPostData) => {
    console.log("File uploaded: ", data.picture);
  };

  const getTopicsFn = async () => {
    const response = await fetch(`http://localhost:3000/api/users/1/topics`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No se ha podido hacer login");
    }

    return data;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["topics"],
    queryFn: getTopicsFn,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("picture", file);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="title">Titulo:</Label>
        <Input type="text" id="title" {...register("title")} />
        {errors.title && <p className="text-red-600">{errors.title.message}</p>}
      </div>
      <div>
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
      <div>
        <Label htmlFor="topic">Topic:</Label>
        <Suspense fallback="loading...">
          {!isLoading && data.forEach((topic: Topic) => {
            <li key={topic.id} onClick={() => setValue("topicID", topic.id)}>{topic.name}</li>
          })}
        </Suspense>
      </div>
      <Button type="submit">Crear</Button>
    </form>
  );
};
