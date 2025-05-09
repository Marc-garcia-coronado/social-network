"use client";

import { useState } from "react";

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Buscar evento..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border rounded-full bg-gray-100 focus:outline-none focus:ring-1 focus:ring-black text-center text-black"
      />
    </div>
  );
}
