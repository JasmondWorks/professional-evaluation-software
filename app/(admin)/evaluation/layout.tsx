'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Layout({ children, }: { children: React.ReactNode }){
   const pathname = usePathname()
   console.log(pathname)

    return (
        <main className="w-full">
            <div className="bg-white pt-6 px-4">
                <h1 className="text-2xl font-bold text-gray-800">
                    Determination of Supervisory / staff
                </h1>
            </div>
            {/* This is the evaluations page */}
            <ul className="w-full bg-white flex flex-start border-b border-gray-100">
                <Link className={ `px-4 border-b-2 py-4 border-${ pathname == `/evaluation` ? 'pes' : '' }` } href={ `/evaluation`}>Data fitting</Link>
                <Link className={ `px-4 border-b-2 py-4 border-${ pathname.includes(`/evaluation/staff`) ? 'pes' : '' }` } href={ `/evaluation/staff`}>Staff determination</Link>
            </ul>
            {
                children
            }
        </main>
    )
}