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
        title: "Suscrito correctamente!",
        description: "¡Se ha suscrito correctamente al evento!",
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
    <li className="flex flex-col w-5/6 mx-auto border-transparent rounded-md shadow ">
      <Image
        src={event.picture ? event.picture : "/globe.svg"}
        alt={event.description}
        width={30}
        height={30}
        className="w-full max-h-40 rounded-t-md object-cover"
      />
      <div className="px-2 py-3">
        <h2 className="capitalize font-bold">{event.name}</h2>
        <div className="flex gap-2">
          <label htmlFor="desc">Descripción:</label>
          <p id="desc">{event.description}</p>
        </div>
        <p>{event.topic.name}</p>
        <p>{event.user?.email}</p>
        <p>{event.location}</p>
        <p>{event.createdAt}</p>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Button
              type="button"
              className={`self-center mb-3
                ${!isApuntado ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              `}
              onClick={() => handleChangeIsApuntado()}
            >
              {isApuntado ? <X /> : <Check />}
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
