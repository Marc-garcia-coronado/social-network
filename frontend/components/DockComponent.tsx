"use client";
import { useUserContext } from "@/contexts/UserContext";
import Dock from "@/src/blocks/Components/Dock/Dock";
import { House, CalendarPlus2, Plus, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const DockComponent = () => {
  const router = useRouter();
  const { user } = useUserContext();
  const [activeLink, setActiveLink] = useState<string>("Home");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname.split("/")[2] || "Home";
      const current = path.charAt(0).toUpperCase() + path.slice(1);
      setActiveLink(current);
    }
  }, []);

  const items = [
    {
      icon: <House color={activeLink === "Home" ? "black" : "black"} />,
      label: "Home",
      onClick: () => {
        setActiveLink("Home");
        router.push(`/${user?.user_name}/home`);
      },
      className: activeLink === "Home" ? "bg-lime-400" : "bg-white",
    },
    {
      icon: <CalendarPlus2 color={activeLink === "Events" ? "black" : "black"} />,
      label: "Events",
      onClick: () => {
        setActiveLink("Events");
        router.push(`/${user?.user_name}/events`);
      },
      className: activeLink === "Events" ? "bg-lime-400" : "bg-white",
    },
    {
      icon: <Plus color={activeLink === "Create" ? "black" : "black"} />,
      label: "Create",
      onClick: () => {
        setActiveLink("Create");
        router.push(`/${user?.user_name}/create`);
      },
      className: activeLink === "Create" ? "bg-lime-400" : "bg-white",
    },
    {
      icon: <UserRound color={activeLink === "Profile" ? "black" : "black"} />,
      label: "Profile",
      onClick: () => {
        setActiveLink("Profile");
        router.push(`/${user?.user_name}/profile` || "/404");
      },
      className: activeLink === "Profile" ? "bg-lime-400" : "bg-white",
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
