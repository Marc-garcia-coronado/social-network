"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Input } from "./ui/input";

function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

export default function SearchBar({
  initialSearch = "",
  className = "",
}: {
  initialSearch?: string;
  className?: string;
}) {
  const [query, setQuery] = useState(initialSearch);
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateQuery = useCallback(
    debounce((q: string) => {
      const params = new URLSearchParams(searchParams?.toString());
      if (q) {
        params.set("q", q);
      } else {
        params.delete("q");
      }
      router.push(`?${params.toString()}`);
    }, 300),
    [router, searchParams]
  );

  useEffect(() => {
    updateQuery(query);
  }, [query, updateQuery]);

  return (
    <div className={`${className} mb-6 text-center`}>
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar eventos..."
        className={`${className} border px-4 py-2 rounded-md w-1/2`}
      />
    </div>
  );
}
