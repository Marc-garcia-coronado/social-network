"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Topic } from "@/lib/types";

export default function SelectComponent({
  topics,
  value,
  onChange,
  className = "",
}: {
  topics: Topic[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`${className}`}>
        <SelectValue placeholder="Escoge deporte..." />
      </SelectTrigger>
      <SelectContent>
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
