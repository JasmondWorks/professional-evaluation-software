"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  console.log(pathname);

  return (
    <main className="flex flex-col w-full h-full bg-gray-100">
      {/* This is the evaluations page */}
      {/* <ul className="w-full bg-white flex flex-start">
                <Link className={ `px-4 border-b-2 py-4 border-${ pathname == `/evaluation/staff` ? 'pes' : '' }` } href={ `/evaluation/staff`}>Non-academic staff</Link>
                <Link className={ `px-4 border-b-2 py-4 border-${ pathname == `/evaluation/staff/academic` ? 'pes' : '' }` } href={ `/evaluation/staff/academic`}>Academic staff</Link>
            </ul> */}
      {
        <>
          <div className="flex ms-auto w-fit p-4">
            <Link
              className="me-4 hover:underline hover:text-pes"
              href="/evaluation/staff"
            >
              Plain Estimating
            </Link>
            <Link
              className="me-4 hover:underline hover:text-pes"
              href="/evaluation/staff/factored"
            >
              Factored Estimating
            </Link>
            <Link
              className="me-4 hover:underline hover:text-pes"
              href="/evaluation/staff/sampling"
            >
              Work Sampling
            </Link>
          </div>
          {children}
        </>
      }
    </main>
  );
}
