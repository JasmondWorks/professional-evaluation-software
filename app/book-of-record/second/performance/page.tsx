'use client'
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Award, Download } from "lucide-react";
import Link from "next/link";

interface HallOfFameMember {
  id: string;
  name: string;
  title?: string;
  imageUrl?: string;
  year?: string;
}

const hallOfFameMembers: HallOfFameMember[] = [
  { id: "1", name: "Dr. Ada Nkem", title: "Pioneer of Quantum Computing Research", year: "2020" },
  { id: "2", name: "Engr. Michael Adebayo", title: "Founder, Nova Robotics", year: "2019" },
  { id: "3", name: "Prof. Chioma Eze", title: "Renowned AI Ethicist", year: "2021" },
  { id: "4", name: "Dr. Tunde Balogun", title: "Cybersecurity Visionary", year: "2018" },
  { id: "5", name: "Engr. Ifeoma Okoro", title: "Software Architect, Stellar Systems", year: "2022" },
  { id: "6", name: "Dr. Emmanuel Ojo", title: "Data Science Innovator", year: "2017" },
  { id: "7", name: "Mrs. Grace Umeh", title: "Humanitarian and Tech Advocate", year: "2023" },
  { id: "8", name: "Mr. Chidi Anozie", title: "IoT Systems Engineer", year: "2016" },
  { id: "9", name: "Dr. Mariam Sule", title: "Astrophysicist and Educator", year: "2024" },
  { id: "10", name: "Engr. Obinna Nwosu", title: "Blockchain Innovator", year: "2025" },
  { id: "11", name: "Dr. Oluwaseun Adeyemi", title: "Renewable Energy Pioneer", year: "2020" },
  { id: "12", name: "Prof. Ngozi Iwuala", title: "Neuroscience Researcher", year: "2019" },
  { id: "13", name: "Engr. Folake Adeniji", title: "Civil Engineering Excellence", year: "2021" },
  { id: "14", name: "Dr. Yusuf Mohammed", title: "Medical AI Specialist", year: "2018" },
  { id: "15", name: "Mrs. Amaka Okonkwo", title: "EdTech Innovator", year: "2022" },
  { id: "16", name: "Mr. Babajide Oladipo", title: "Fintech Disruptor", year: "2017" },
  { id: "17", name: "Dr. Zainab Abubakar", title: "Agricultural Tech Leader", year: "2023" },
  { id: "18", name: "Engr. Kunle Adewale", title: "Smart City Architect", year: "2016" },
  { id: "19", name: "Prof. Oluchi Mbanefo", title: "Quantum Physics Expert", year: "2024" },
  { id: "20", name: "Dr. Ibrahim Yakubu", title: "Healthcare Innovation", year: "2025" },
  { id: "21", name: "Engr. Chiamaka Nnadi", title: "Aerospace Engineering", year: "2020" },
  { id: "22", name: "Dr. Segun Ogunleye", title: "Climate Tech Researcher", year: "2019" },
  { id: "23", name: "Mrs. Fatima Bello", title: "Social Impact Technology", year: "2021" },
  { id: "24", name: "Mr. Emeka Obi", title: "Cloud Architecture Expert", year: "2018" },
  { id: "25", name: "Dr. Blessing Nwankwo", title: "Biomedical Engineer", year: "2022" },
  { id: "26", name: "Prof. Akin Falola", title: "Theoretical Physics", year: "2017" },
  { id: "27", name: "Engr. Sade Olusanya", title: "Telecommunications Pioneer", year: "2023" },
  { id: "28", name: "Dr. Musa Abdullahi", title: "Machine Learning Architect", year: "2016" },
  { id: "29", name: "Mrs. Nneka Ezeh", title: "Digital Health Advocate", year: "2024" },
  { id: "30", name: "Mr. Kehinde Ashiru", title: "AR/VR Innovator", year: "2025" },
  { id: "31", name: "Dr. Adaeze Chukwu", title: "Materials Science Expert", year: "2020" },
  { id: "32", name: "Engr. Biodun Ajayi", title: "Green Energy Specialist", year: "2019" },
  { id: "33", name: "Prof. Hauwa Sani", title: "Computer Vision Research", year: "2021" },
  { id: "34", name: "Dr. Chukwudi Onwurah", title: "Nanotech Pioneer", year: "2018" },
  { id: "35", name: "Mrs. Olabisi Coker", title: "Digital Banking Leader", year: "2022" },
  { id: "36", name: "Mr. Uche Okeke", title: "DevOps Excellence", year: "2017" },
  { id: "37", name: "Dr. Rashida Yusuf", title: "Public Health Informatics", year: "2023" },
  { id: "38", name: "Engr. Tolu Osinowo", title: "Automation Systems", year: "2016" },
  { id: "39", name: "Prof. Chinwe Okoro", title: "Computational Biology", year: "2024" },
  { id: "40", name: "Dr. Damilola Adeyemi", title: "Genomics Research", year: "2025" },
];

export default function Home() {
  const ITEMS_PER_PAGE = 10;
  const [showCover, setShowCover] = useState(true);
  const [members, setMembers] = useState<HallOfFameMember[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

// Fetch data from backend
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/second-book-api/performance?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch records");

      setMembers(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("❌ Failed to fetch records:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [currentPage]);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      {/* Cover Image */}
      <img onClick={() => setShowCover(false)} src="/2nd-book.png" alt="first book"  className={`${ showCover ? 'translate-x-0': '-translate-x-full' } transition-transform duration-[700ms] ease-in-out absolute h-full w-full top-0 left-0 z-20`}/>


      {/* Main Content */}
      <div className="relative flex flex-col bg-white shadow-2xl rounded-xl w-full max-w-4xl h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pes to-pes text-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8" />
              <h2 className="text-2xl font-bold">1st Book of Record(Performance)</h2>
            </div>
            <div className="text-sm bg-white/20 px-4 py-2 rounded-full">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {members.map((member, idx) => (
                <Link
                  href={`/reward/certificates/3rd/${encodeURIComponent(member.name)}`}
                  key={member.id}
                  className="w-full border rounded-lg p-5 transition-all duration-200"
                >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-pes transition-colors">
                        {member.name}
                      </h3>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <span className="inline-block bg-white text-pes text-sm font-medium px-3 py-1 rounded-full">
                      <Download/>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Pagination Footer */}
        <div className="border-t bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-2 bg-pes hover:bg-pes disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-all duration-200 disabled:shadow-none"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 bg-pes hover:bg-pes disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-all duration-200 disabled:shadow-none"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Page Numbers */}
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageClick(page)}
                className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                  page === currentPage
                    ? 'bg-pes text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-pes border border-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}