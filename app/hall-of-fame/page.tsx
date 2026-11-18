'use client';
import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Award, Download } from "lucide-react";
import Link from "next/link";
import { apiFetch } from '@/app/utils/apiFetch';
import { BackLink } from '@/app/components/ui';

interface HallOfFameMember {
  id: string;
  name: string;
  title?: string;
  imageUrl?: string;
  year?: string;
}

export default function HallOfFame() {
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState<HallOfFameMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await apiFetch('/api/hall-of-fame');
        const data = await res.json();

        // The response was assigned straight to `members` and then mapped over.
        // Any non-array reply — an expired token answering 401, the route's own
        // 400 for an account with no organization, a 500 — became
        // "members.map is not a function" and took the whole page down behind
        // the error boundary. Token expiry alone makes that a routine event,
        // and this page is one of the two the client is shown.
        if (!res.ok) throw new Error(data?.error || 'Could not load the Hall of Fame.');
        if (!Array.isArray(data)) throw new Error('Unexpected response.');

        setMembers(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching Hall of Fame:', err);
        setMembers([]);
        setError(err?.message || 'Could not load the Hall of Fame.');
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  return (
      // {/* LEFT GATE */}
    <>
      {/* This page is outside the (admin) route group, so it has no sidebar —
          the gates and the scroll are meant to fill the screen. Without this
          there was no way back, and no way in but the URL. */}
      <div className="absolute left-4 top-4 z-30">
        <BackLink href="/dashboard">Back to dashboard</BackLink>
      </div>

      <div
        className={`absolute bottom-0 left-0 w-1/2 h-[75vh] transition-transform duration-[2000ms] ease-in-out cursor-pointer z-20 ${
          isOpen ? '-translate-x-[75%]' : 'translate-x-0'
        }`}
        onClick={() => setIsOpen(true)}
      >
        <img src="gate-transparent.png" alt="gate left" className="w-full h-full" />
      </div>

      {/* RIGHT GATE */}
      <div
        className={`absolute bottom-0 right-0 w-1/2 h-[75vh]  transition-transform duration-[2000ms] ease-in-out cursor-pointer z-20 ${
          isOpen ? 'translate-x-[75%]' : 'translate-x-0'
        }`}
        onClick={() => setIsOpen(true)}
      >
        <img src="gate-transparent.png" alt="gate right" className="w-full h-full [transform:rotateY(180deg)]" />
      </div>

      {/* WHITE PAPER (scaling animation) */}
      <div
        className={`min-w-[70%] mx-auto h-[90%] relative z-10 transition-all duration-[1500ms] ease-in-out transform origin-center ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
        style={{
          backgroundImage: "url('/scroll2.png')",
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <h1 className="text-5xl font-bold text-center text-yellow-900 py-12 underline">
          HALL OF FAME
        </h1>

        <div className="flex flex-col items-center overflow-y-auto h-[calc(100vh-200px)]">
          {error ? (
            <p className="px-8 text-center text-lg text-yellow-900">{error}</p>
          ) : !loading && members.length === 0 ? (
            <p className="px-8 text-center text-lg text-yellow-900">
              No one has been inducted yet. A place here is earned by Very Outstanding
              performance across three years.
            </p>
          ) : null}
          {members?.map((member) => (
            <Link
                href={`/reward/certificates/1st/${encodeURIComponent(member.name)}`}
                key={member.id}
                className="w-full rounded-lg p-5 transition-all duration-200"
              >
              <div className="flex border-b border-yellow-700 items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-strong group-hover:text-pes transition-colors">
                      {member.name}
                    </h3>
                  </div>
                  {member.title && <p className="text-lg text-body">{member.title}</p>}
                  {member.year && <p className="text-sm text-yellow-700">{member.year}</p>}
                </div>
                <div className="shrink-0 ml-4">
                  <span className="inline-block bg-white text-pes text-sm font-medium px-3 py-1 rounded-full">
                    <Download/>
                  </span>
                </div>
              </div>
            </Link>
            // <div
            //   key={member.id}
            //   className="flex flex-col items-center space-y-2 p-4 text-black w-full"
            // >
            //   <p className="text-2xl font-semibold">{member.name}</p>
            //   {member.title && <p className="text-lg text-body">{member.title}</p>}
            //   {member.year && <p className="text-sm text-yellow-600">{member.year}</p>}
            // </div>
          ))}
        </div>
      </div>    
    </>
  );
}
