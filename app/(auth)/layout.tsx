import "../globals.css";
import type { Metadata } from "next";
import Image from "next/image";

// The auth screens inherit the platform's one typeface from the root layout.
// They used to set Lato here, so login and reset-password were the only pages
// in the product not set in it.

export const metadata: Metadata = {
  title: "PES | Authentication",
  description: "Performance Appraisal Software",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-gray-10 flex flex-row relative justify-center w-full max-w-screen min-h-screen"
    >
      {/* Illustration — shared across all auth screens */}
      <div className="illustration bg-pes-gradient hidden md:flex w-1/2 sticky top-0 h-screen">
        <Image
          src="/pes.svg"
          alt="PES"
          width={130}
          height={130}
          className="z-10 mx-auto my-auto"
        />
      </div>

      {/* Form column — each auth page renders its form here */}
      <div className="w-full md:w-1/2 min-h-screen flex flex-col justify-center p-8 sm:p-16 lg:p-28">
        {children}
      </div>
    </div>
  );
}
