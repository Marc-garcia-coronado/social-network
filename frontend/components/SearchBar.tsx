"use client";

import { Input } from "./ui/input";

export default function SearchBar({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}) {
  return (
    <div className={`${className} mb-6 text-center`}>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar eventos..."
        className="border px-4 py-2 rounded-md w-1/2"
      />
    </div>
  );
}
