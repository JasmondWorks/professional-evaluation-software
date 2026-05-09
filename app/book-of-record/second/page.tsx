'use client';

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

interface RecordType {
  id: string;
  name: string;
  title?: string;
  description?: string;
  date_achieved?: string;
}

export default function SecondBookViewer() {
  const ITEMS_PER_PAGE = 6;
  const [showCover, setShowCover] = useState(true);
  const [records, setRecords] = useState<RecordType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/second-book-api/appraisal?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to load records");

        setRecords(data.data);
        setTotalPages(data.totalPages);
      } catch (e) {
        console.error("❌ Error loading book:", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [currentPage]);

  const flip = (page: number) => {
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage(page);
      setIsFlipping(false);
    }, 450);
  };

  const prevPage = () => currentPage > 1 && flip(currentPage - 1);
  const nextPage = () => currentPage < totalPages && flip(currentPage + 1);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-200 p-6 relative">

      {/* COVER */}
      <img
        onClick={() => setShowCover(false)}
        src="/2nd-book.png"
        alt="Book Cover"
        className={clsx(
          "absolute top-0 left-0 h-full w-full object-cover cursor-pointer z-30 transition-transform duration-[800ms]",
          showCover ? "translate-x-0" : "-translate-x-full"
        )}
      />

      {/* MAIN BOOK */}
      <div className="relative w-[90%] max-w-5xl h-[80vh] bg-white shadow-2xl rounded-lg flex overflow-hidden">

        {/* LEFT PAGE */}
        <div
          className={clsx(
            "w-1/2 border-r p-6 overflow-y-auto bg-[url('/paper-texture.png')] bg-cover bg-center",
            isFlipping && "animate-page-flip-left"
          )}
        >
          <PageContent records={records.slice(0, 3)} loading={loading} />
        </div>

        {/* RIGHT PAGE */}
        <div
          className={clsx(
            "w-1/2 p-6 overflow-y-auto bg-[url('/paper-texture.png')] bg-cover bg-center",
            isFlipping && "animate-page-flip-right"
          )}
        >
          <PageContent records={records.slice(3, 6)} loading={loading} />
        </div>

        {/* PAGE CONTROLS */}
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-pes text-white p-3 rounded-full disabled:bg-gray-500"
        >
          <ChevronLeft />
        </button>

        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-pes text-white p-3 rounded-full disabled:bg-gray-500"
        >
          <ChevronRight />
        </button>

        {/* FOOTER PAGE NUMBER */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white px-6 py-1 rounded-full shadow text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </div>

      </div>
    </div>
  );
}

function PageContent({
  loading,
  records,
}: {
  loading: boolean;
  records: RecordType[];
}) {
  if (loading) return <p className="text-center mt-20 text-gray-500">Loading...</p>;

  if (records.length === 0)
    return <p className="text-center mt-20 text-gray-400">No entries</p>;

  return (
    <div className="space-y-4">
      {records.map((rec) => (
        <div
          key={rec.id}
          className="border p-4 bg-white/80 backdrop-blur rounded-lg shadow hover:shadow-lg transition cursor-pointer"
        >
          <Link href={`/reward/certificates/2nd/${encodeURIComponent(rec.name)}`}>
            <h3 className="text-lg font-bold text-gray-800">{rec.name}</h3>
            <p className="text-sm text-gray-500">
              {rec.title || rec.description}
            </p>
          </Link>

          <button className="mt-3 text-pes flex items-center gap-2 text-sm font-medium">
            <Download size={16} /> Download
          </button>
        </div>
      ))}
    </div>
  );
}
