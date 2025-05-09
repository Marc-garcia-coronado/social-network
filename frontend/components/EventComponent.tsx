"use client";

import { Event } from "@/lib/types";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./ui/button";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useUserContext } from "@/contexts/UserContext";
import { Check, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";

type EventComponentProps = {
  event: Event;
  apuntado?: boolean;
  token: string;
};

type UpdateSubscribedToEventType = {
  state: boolean;
  eventID: number;
  userID: number;
  token: string;
};

const updateSubscribedToEvent = async ({
  state,
  eventID,
  userID,
  token,
}: UpdateSubscribedToEventType): Promise<any> => {
  const uri = !state
    ? `http://localhost:3000/api/users/${userID}/events/${eventID}/unsubscribe`
    : `http://localhost:3000/api/users/${userID}/events/${eventID}/subscribe`;

  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (token) {
    headers.append("Authorization", "Bearer " + token);
  }

  const res = await fetch(uri, {
    method: state ? "POST" : "DELETE",
    credentials: "include",
    headers,
  });

  if (!res.ok) {
    const msg = state
      ? "no se ha podido suscribir al evento"
      : "no se ha podido desuscribir al evento";
    throw new Error(msg);
  }

  return res.json();
};

export default function EventComponent({
  event,
  apuntado = false,
  token,
}: EventComponentProps) {
  const [isApuntado, setIsApuntado] = useState<boolean>(apuntado);
  const { user } = useUserContext();

  const mutation = useMutation({
    mutationFn: updateSubscribedToEvent,
    onError: () => {
      return toast({
        variant: "destructive",
        description:
          "Ha habido un error al cambiar el estado de la suscripcion",
      });
    },
    onSuccess: () => {
      return toast({
        title: isApuntado
          ? "Apuntado correctamente"
          : "Desapuntado correctamente",
        description: isApuntado
          ? "¡Te has apuntado correctamente al evento!"
          : "¡Te has desapuntado correctamente al evento!",
      });
    },
  });

  const handleChangeIsApuntado = () => {
    const newState = !isApuntado;
    setIsApuntado(newState);
    mutation.mutate({
      state: newState,
      eventID: event.id,
      userID: user?.id ?? 0,
      token,
    });
  };

  return (
    <li className="flex flex-col w-[350px] md:w-full min-h-[350px] overflow-hidden mx-auto border-transparent rounded-md shadow ">
      <Image
        src={event.picture ? event.picture : "/globe.svg"}
        alt={event.description}
        width={30}
        height={30}
        className="w-full max-h-40 rounded-t-md object-cover"
      />
      <Badge className="w-fit mt-5 mx-5">{event.topic.name}</Badge>
      <div className="px-5 py-1 flex flex-col ">
        <h2 className="capitalize font-bold my-3">{event.name}</h2>
        <div className="flex gap-2 items-center">
          <Label htmlFor="desc">Descripción:</Label>
          <p id="desc">{event.description}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Label htmlFor="location">Localización:</Label>
          <p id="location">{event.location}</p>
        </div>
        <div className="flex gap-2 items-center mb-5">
          <Label htmlFor="date">Fecha del evento:</Label>
          <p id="date">{new Date(event.date).toLocaleDateString()}</p>
        </div>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Button
              type="button"
              className={`self-center mb-3
                ${isApuntado ? "bg-lime-400 hover:bg-lime-500 text-black" : "bg-transparent border-2 text-black border-black hover:bg-black hover:text-white"}
              `}
              onClick={() => handleChangeIsApuntado()}
            >
              {!isApuntado ? <p>Apuntarse</p> : <p>Desapuntarse</p>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isApuntado ? <p>Desapuntarse</p> : <p>Apuntarse</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </li>
  );
}
