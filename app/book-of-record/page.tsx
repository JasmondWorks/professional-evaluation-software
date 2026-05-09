"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Award, Download } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

interface BookRecord {
  id: string;
  name: string;
  title?: string;
  imageUrl?: string;
  year?: string;
  description?: string;
}

export default function BookViewer() {
  const ITEMS_PER_PAGE = 6; // 3 records per page (LEFT + RIGHT)
  const [showCover, setShowCover] = useState(true);
  const [records, setRecords] = useState<BookRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/first-book-api/appraisal?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load records");

        setRecords(data.data);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("❌ Fetch failed:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentPage]);

  // Handle flipping animation
  const flip = (newPage: number) => {
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage(newPage);
      setIsFlipping(false);
    }, 450);
  };

  const prevPage = () => currentPage > 1 && flip(currentPage - 1);
  const nextPage = () =>
    currentPage < totalPages && flip(currentPage + 1);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-200 relative">

      {/* COVER PAGE */}
      <img
        onClick={() => setShowCover(false)}
        src="/1st-book.png"
        alt="Book Cover"
        className={clsx(
          "absolute top-0 left-0 h-full w-full object-cover cursor-pointer z-30 transition-transform duration-[800ms]",
          showCover ? "translate-x-0" : "-translate-x-full"
        )}
      />

      {/* MAIN BOOK */}
      <div className="relative w-[95%] h-[95%] bg-white rounded-lg flex overflow-hidden m-auto">

        {/* LEFT & RIGHT PAGES */}
        <div
          className={clsx(
            "w-1/2 border-r p-6 overflow-y-auto bg-[url('/paper.avif')] bg-cover bg-center",
            isFlipping && "animate-page-flip-left"
          )}
        >
          <PageContent
            loading={loading}
            records={records.slice(0, 3)}
            pageNumber={currentPage}
          />
        </div>

        <div
          className={clsx(
            "w-1/2 p-6 overflow-y-auto bg-[url('/paper.avif')] bg-cover bg-center",
            isFlipping && "animate-page-flip-right"
          )}
        >
          <PageContent
            loading={loading}
            records={records.slice(3, 6)}
            pageNumber={currentPage}
          />
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

/* -------- PAGE CONTENT COMPONENT -------- */

function PageContent({
  loading,
  records,
}: {
  loading: boolean;
  records: BookRecord[];
  pageNumber: number;
}) {
  if (loading)
    return <p className="text-center mt-20 text-gray-500">Loading...</p>;

  if (records.length === 0)
    return <p className="text-center mt-20 text-gray-400">No records on this page</p>;

  return (
    <div className="space-y-4">
      {records.map((rec) => (
        <div
          key={rec.id}
          className="border p-4 bg-white/80 backdrop-blur rounded-lg shadow hover:shadow-md transition cursor-pointer"
        >
          <Link href={`/reward/certificates/2nd/${encodeURIComponent(rec.name)}`}>
            <h3 className="text-lg font-bold text-gray-700">{rec.name}</h3>
            <p className="text-sm text-gray-500">{rec.title}</p>
          </Link>

          <div className="mt-3">
            <button className="text-pes flex items-center gap-2 text-sm font-medium">
              <Download size={16} /> Download
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
