'use client'
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Award, Download } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

interface HallOfFameMember {
  id: string;
  name: string;
  title?: string;
  imageUrl?: string;
  year?: string;
}

export default function BookPerformance() {
  const ITEMS_PER_PAGE = 6; // 3 per left/right page
  const [showCover, setShowCover] = useState(true);
  const [members, setMembers] = useState<HallOfFameMember[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/first-book-api/performance?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch records");

        setMembers(data.data || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("❌ Failed to fetch records:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentPage]);

  const flipPage = (newPage: number) => {
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage(newPage);
      setIsFlipping(false);
    }, 450);
  };

  const prevPage = () => currentPage > 1 && flipPage(currentPage - 1);
  const nextPage = () => currentPage < totalPages && flipPage(currentPage + 1);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-200 p-4 relative">

      {/* COVER */}
      <img
        onClick={() => setShowCover(false)}
        src="/1st-book.png"
        alt="Book Cover"
        className={clsx(
          "absolute top-0 left-0 h-full w-full object-cover z-30 cursor-pointer transition-transform duration-[800ms]",
          showCover ? "translate-x-0" : "-translate-x-full"
        )}
      />

      {/* BOOK */}
      <div className="relative w-full max-w-5xl h-[90vh] bg-white shadow-2xl rounded-lg flex overflow-hidden">

        {/* LEFT PAGE */}
        <div
          className={clsx(
            "w-1/2 border-r p-6 overflow-y-auto bg-[url('/paper.avif')] bg-cover bg-center",
            isFlipping && "animate-page-flip-left"
          )}
        >
          <PageContent records={members.slice(0, 3)} loading={loading} />
        </div>

        {/* RIGHT PAGE */}
        <div
          className={clsx(
            "w-1/2 p-6 overflow-y-auto bg-[url('/paper.avif')] bg-cover bg-center",
            isFlipping && "animate-page-flip-right"
          )}
        >
          <PageContent records={members.slice(3, 6)} loading={loading} />
        </div>

        {/* PAGE CONTROLS */}
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-pes text-white p-3 rounded-full disabled:bg-gray-400 shadow-lg"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-pes text-white p-3 rounded-full disabled:bg-gray-400 shadow-lg"
        >
          <ChevronRight />
        </button>

        {/* FOOTER */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white px-6 py-1 rounded-full shadow text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </div>
      </div>
    </div>
  );
}

function PageContent({ records, loading }: { records: HallOfFameMember[]; loading: boolean }) {
  if (loading) return <p className="text-center mt-20 text-gray-500">Loading...</p>;
  if (!records.length) return <p className="text-center mt-20 text-gray-400">No records on this page</p>;

  return (
    <div className="space-y-4">
      {records.map((rec) => (
        <Link
          key={rec.id}
          href={`/reward/certificates/2nd/${encodeURIComponent(rec.name)}`}
          className="block border p-4 bg-white/80 backdrop-blur rounded-lg shadow hover:shadow-md transition cursor-pointer"
        >
          <h3 className="text-lg font-bold text-gray-700">{rec.name}</h3>
          <p className="text-sm text-gray-500">{rec.title}</p>
          <div className="mt-2">
            <button className="text-pes flex items-center gap-2 text-sm font-medium">
              <Download size={16} /> Download
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
}
