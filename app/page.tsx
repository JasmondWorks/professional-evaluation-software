"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";
import { getAccessToken } from "@/app/utils/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = getAccessToken();
    const authed = token && token !== "undefined" && token !== "null";
    // `replace` so the splash never lands in the browser history.
    router.replace(authed ? "/dashboard" : "/login");
  }, [router]);

  return (
    <main className="fixed inset-0 grid place-items-center overflow-hidden bg-pes text-white">
      {/* Depth: a soft brand glow + a faint deepening toward the edges. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-radial from-pes-600/50 via-pes to-pes-900" />
        <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 h-[40rem] w-[40rem] rounded-full bg-white/10 blur-[120px]" />
      </div>

      <div
        className="relative flex flex-col items-center gap-9 px-6 motion-safe:[animation:pes-rise_0.6s_ease-out]"
        role="status"
        aria-label="Loading PES"
      >
        <Image
          src="/pes.svg"
          alt="PES"
          width={220}
          height={220}
          priority
          className="h-auto w-40 sm:w-48 drop-shadow-[0_8px_40px_rgb(0_0_0/0.25)]"
        />

        {/* Refined three-dot loading indicator. */}
        <div className="flex items-center gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-white/90 motion-safe:[animation:pes-dot_1.3s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 0.16}s` }}
            />
          ))}
        </div>
        <span className="sr-only">Loading, please wait…</span>
      </div>
    </main>
  );
}
