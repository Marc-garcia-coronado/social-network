"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback } from "react";
import { Topic } from "@/lib/types";

export default function SelectComponent({
  topics,
  className = "",
}: {
  topics: Topic[];
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelect = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === "all") {
        params.delete("topic");
      } else {
        params.set("topic", value);
      }

      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <Select onValueChange={handleSelect}>
      <SelectTrigger className={`${className}`}>
        <SelectValue placeholder="Filtrar por..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all" className="font-bold">
          Todos
        </SelectItem>
        {Array.isArray(topics) && topics.length > 0 ? (
          topics.map((topic) => (
            <SelectItem key={topic.id} value={topic.id.toString()}>
              {topic.name}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="disabled" disabled>
            No hay topics
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
