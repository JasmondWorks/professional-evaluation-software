'use client'
import Link from "next/link";
import { ArrowLeft } from "iconsax-react";
import { usePathname } from "next/navigation";

export default function Layout({ children, }: { children: React.ReactNode }){
   const pathname = usePathname()

    return (
        <main className="w-full">
            <div className="bg-white pt-6 px-4">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-pes transition-colors mb-3"
                >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-strong">
                    Determination of Supervisory / staff
                </h1>
            </div>
            {/* This is the evaluations page */}
            <ul className="w-full bg-surface flex flex-start border-b border-line px-4">
                <Link
                    href="/evaluation"
                    className={`px-4 py-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                        pathname === `/evaluation`
                            ? 'border-pes text-pes-700'
                            : 'border-transparent text-muted hover:text-strong'
                    }`}
                >
                    Data fitting
                </Link>
                <Link
                    href="/evaluation/staff"
                    className={`px-4 py-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                        pathname.includes(`/evaluation/staff`)
                            ? 'border-pes text-pes-700'
                            : 'border-transparent text-muted hover:text-strong'
                    }`}
                >
                    Staff determination
                </Link>
            </ul>
            {
                children
            }
        </main>
    )
}