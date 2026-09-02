// Work sampling rows hang off a study, and only the study carries an org. So a
// position or observation cannot be checked against the caller directly — the
// study it belongs to has to be walked back to first. Without that, positions
// and observations were writable and deletable by anyone who could guess an id.

import { NextResponse } from 'next/server';
import prisma from '../prisma.dev';

/** The study's org, or null if the study does not exist. */
export async function orgOfStudy(studyId: number): Promise<string | null> {
  const study = await prisma.workSamplingStudy.findUnique({
    where: { id: studyId },
    select: { org: true },
  });
  return study?.org ?? null;
}

/** The org owning the study a position belongs to. */
export async function orgOfPosition(positionId: number): Promise<string | null> {
  const position = await prisma.workSamplingPosition.findUnique({
    where: { id: positionId },
    select: { study: { select: { org: true } } },
  });
  return position?.study?.org ?? null;
}

/** Same body whether the row is absent or belongs to another org: which study
 *  ids exist elsewhere is not something the caller should be able to learn. */
export const notYours = () =>
  NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
