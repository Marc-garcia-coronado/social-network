"use client";

import { InfiniteMovingCards } from "./ui/infinite-moving-cards";

export function InfiniteMovingCardsComponent() {
  return (
    <div className="rounded-md flex flex-col antialiased items-center justify-center relative overflow-hidden">
      <InfiniteMovingCards items={testimonials} direction="left" speed="slow" />
    </div>
  );
}

const testimonials = [
  {
    quote:
      "Gracias a FleXin conocí un grupo de running que sale cada semana desde el parque central. Empezamos siendo cinco y ahora ya somos más de veinte. La app me ayudó a mantenerme motivada, conocer gente nueva y cumplir mis objetivos personales de entrenamiento.",
    name: "Laura Gómez",
    title: "Apasionada del running",
  },
  {
    quote:
      "Organizamos un partido de fútbol 7 con gente nueva que conocí en la app, y fue un éxito total. Alquilamos una cancha, nos pusimos de acuerdo en minutos, y ahora jugamos cada jueves. Esta plataforma hace que conocer gente con tus mismos intereses sea fácil y seguro.",
    name: "Carlos Ruiz",
    title: "Jugador amateur de fútbol",
  },
  {
    quote:
      "Por fin encontré eventos de ciclismo cerca de mi zona gracias a esta aplicación. Antes era muy complicado enterarse de rutas o salidas organizadas, pero ahora participo casi cada fin de semana. Me ha devuelto las ganas de salir en grupo y compartir mi pasión por el ciclismo.",
    name: "Marta Sánchez",
    title: "Ciclista urbana",
  },
  {
    quote:
      "Me encanta seguir solo los deportes que realmente me interesan. El feed personalizado de esta red social me permite ver solo contenido de baloncesto y tenis, sin ruido. Además, puedo comentar, reaccionar y compartir ideas con otros fans. Se siente como una comunidad real.",
    name: "Javier Molina",
    title: "Fan del baloncesto y tenis",
  },
  {
    quote:
      "Empecé subiendo fotos de mis entrenamientos solo para llevar un registro personal, y terminé haciendo amigos con los mismos intereses. Algunos incluso se han convertido en compañeros de entreno semanales. Esta app me ayudó a salir de la rutina y conectar de verdad.",
    name: "Andrea López",
    title: "Entrenadora personal",
  },
];
