"use client";

import { Input } from "./ui/input";

export default function SearchBar({
  value,
  placeholder,
  onChange,
  className = "",
}: {
  value: string;
  placeholder: string;
  onChange: (val: string) => void;
  className?: string;
}) {
  return (
    <div className={`${className} text-center`}>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-full bg-gray-100 focus:outline-none focus:ring-1 focus:ring-black text-center text-black"
      />
    </div>
  );
}
