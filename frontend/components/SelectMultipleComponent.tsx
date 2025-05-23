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
  value: string[];
  onChange: (val: string[]) => void;
  className?: string;
}) {
  return (
    <Select
      value=""
      onValueChange={(val) => {
        if (value.includes(val)) {
          onChange(value.filter((v) => v !== val));
        } else {
          onChange([...value, val]);
        }
      }}
    >
      <SelectTrigger className={`${className}`}>
        <SelectValue placeholder="Selecciona temas..." />
      </SelectTrigger>
      <SelectContent>
      {Array.isArray(topics) && topics.length > 0 ? (
        topics.map((topic, index) => (
          <SelectItem key={`${topic.id}-${index}`} value={topic.id.toString()}>
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
