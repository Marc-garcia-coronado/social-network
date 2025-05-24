import { Event } from "@/lib/types";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";

type EventComponentLandingProps = {
  event: Event;
};

export default function EventComponentLanding({
  event,
}: EventComponentLandingProps) {
  return (
    <div className="flex flex-col w-[350px] md:w-[400px] min-h-[350px] overflow-hidden border-transparent rounded-md shadow border dark:border-white/[0.2] dark:bg-black">
      <Image
        src={event?.picture ? event.picture : "/globe.svg"}
        alt={event?.description || "Evento"}
        width={1000}
        height={1000}
        className="w-full max-h-40 rounded-t-md object-cover"
      />
      <Badge className="w-fit mt-5 mx-5">{event?.topic.name}</Badge>
      <div className="px-5 py-1 flex flex-col ">
        <h2 className="capitalize font-bold my-3">{event?.name}</h2>
        <div className="flex gap-2 items-center">
          <Label htmlFor="desc">Descripción:</Label>
          <p id="desc">{event?.description}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Label htmlFor="location">Localización:</Label>
          <p id="location">{event?.location}</p>
        </div>
        <div className="flex gap-2 items-center mb-5">
          <Label htmlFor="date">Fecha del evento:</Label>
          <p id="date">{new Date(event?.date).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
