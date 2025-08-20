"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("query") ?? "");

  useEffect(() => {
    setQ(params.get("query") ?? "");
  }, [params]);

  return (
    <input
      value={q}
      placeholder="Search posts..."
      onChange={(e) => {
        const value = e.target.value;
        setQ(value);
        const s = new URLSearchParams(params.toString());
        if (value) s.set("query", value); else s.delete("query");
        router.push(`/?${s.toString()}`);
      }}
      style={{ padding: 8 }}
    />
  );
}