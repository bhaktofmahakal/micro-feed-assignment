"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function Toolbar() {
  const router = useRouter();
  const params = useSearchParams();
  const mine = params.get("mine") === "true";

  const setMine = (value: boolean) => {
    const q = new URLSearchParams(params.toString());
    if (value) q.set("mine", "true"); else q.delete("mine");
    router.push(`/?${q.toString()}`);
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={() => setMine(false)} disabled={!mine}>All</button>
      <button onClick={() => setMine(true)} disabled={mine}>Mine</button>
    </div>
  );
}