"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas px-6 text-center">
      <p className="font-semibold text-sm tracking-[0.2em] text-pes-700 mb-10 sm:mb-14">
        PES
      </p>

      <p className="font-mono text-[7rem] sm:text-[9rem] leading-none font-bold text-pes-100 select-none">
        404
      </p>
      <h1 className="text-3xl sm:text-4xl font-semibold text-strong tracking-tight -mt-1 sm:-mt-2">
        We couldn't find this page
      </h1>

      <p className="text-body max-w-md mt-6">
        Whatever you were looking for isn't here — the link may be outdated, or
        the page has moved since you last visited.
      </p>

      <div className="flex items-center gap-3 mt-10">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Go back
        </Button>
        <Button href="/" variant="primary">
          Go home
        </Button>
      </div>
    </div>
  );
}
