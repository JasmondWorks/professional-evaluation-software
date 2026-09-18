'use client';

// One award, filled in with the recipient's details and shown on its own.
//
// These pages are reached from the Books of Records, the Hall of Fame and a
// member of staff's own achievements, so the recipient's name arrives in the
// route. The organisation comes from the token, and the date is the day the
// award is looked at, which is what the templates' Date rule is for.
//
// The artwork and the print behaviour live in AwardArt; this is only the frame
// around it. Before, each of these pages carried its own copy of the image, its
// own hand-placed text, and an html2canvas download that wrote a PNG to a file
// named .pdf.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import { getAccessToken } from '@/app/utils/auth';
import AwardArt, { ArtKind, artLabel } from './AwardArt';

export default function AwardPage({
  kind,
  user,
  award,
}: {
  kind: ArtKind;
  /** The recipient, as it came through the route. */
  user: string;
  /** What the award is for. The templates leave a caption line for it. */
  award?: string;
}) {
  const [org, setOrg] = useState('');

  // The token is only there in the browser, so read it after mount rather than
  // during render; otherwise the server and client markup disagree.
  useEffect(() => {
    try {
      const token = getAccessToken();
      if (!token) return;
      const decoded: any = jwtDecode(token);
      setOrg(decoded?.org || '');
    } catch {
      setOrg('');
    }
  }, []);

  // Next gives the segment still encoded. decodeURIComponent handles every
  // escape, not just the spaces the old pages replaced by hand.
  let recipient = user;
  try {
    recipient = decodeURIComponent(user);
  } catch {
    recipient = user;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-canvas p-6">
      <AwardArt
        kind={kind}
        recipient={recipient}
        title={award || artLabel(kind)}
        issuer={org}
        date={new Date().toLocaleDateString()}
        size={960}
        printable
      />

      <Link href="/my-awards" className="text-sm text-pes underline">
        All of my awards
      </Link>
    </main>
  );
}
