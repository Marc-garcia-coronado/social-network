"use client";
import { useUserContext } from "@/contexts/UserContext";
import Dock from "@/src/blocks/Components/Dock/Dock";
import { House, CalendarPlus2, Plus, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DockComponent = () => {
  const router = useRouter();
  const { user } = useUserContext();
  let currentRouter = window.location.pathname.split('/')[2] || 'Home';
  currentRouter =
    currentRouter.charAt(0).toUpperCase() + currentRouter.slice(1);
  const [activeLink, setActiveLink] = useState<string>(currentRouter);
  const items = [
    {
      icon: <House color={activeLink === "Home" ? "black" : "white"} />,
      label: "Home",
      onClick: () => {
        setActiveLink("Home");
        router.push(`/${user?.user_name}/home`);
      },
      className: activeLink === "Home" ? "bg-lime-400" : "",
    },
    {
      icon: (
        <CalendarPlus2 color={activeLink === "Events" ? "black" : "white"} />
      ),
      label: "Events",
      onClick: () => {
        setActiveLink("Events");
        router.push(`/${user?.user_name}/events`);
      },
      className: activeLink === "Events" ? "bg-lime-400" : "",
    },
    {
      icon: <Plus color={activeLink === "Post" ? "black" : "white"} />,
      label: "Post",
      onClick: () => {
        setActiveLink("Post");
        router.push(`/${user?.user_name}/post`);
      },
      className: activeLink === "Post" ? "bg-lime-400" : "",
    },
    {
      icon: <UserRound color={activeLink === "Profile" ? "black" : "white"} />,
      label: "Profile",
      onClick: () => {
        setActiveLink("Profile");
        router.push(`/${user?.user_name}/profile` || "/404");
      },
      className: activeLink === "Profile" ? "bg-lime-400" : "",
    },
  ];

  return (
    <Dock
      items={items}
      panelHeight={68}
      baseItemSize={50}
      magnification={70}
      spring={{ mass: 0.1, stiffness: 150, damping: 12 }}
    />
  );
};

export default DockComponent;
