// Reads the caller's token, so this can never be a static route.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev';
import { authorize, tokenFromRequest } from '../_lib/authGuard';
import {
  AUDITOR_QUESTIONS,
  RECOGNITION_QUESTION_INDEX,
} from '@/app/lib/auditor/questions';

// An auditor's own recognition consent: reading it, and changing their mind.
//
// Consent is collected once, as the last question on the public accept form,
// and until now nothing could ever change it again — no route, no screen. For a
// flag that decides whether every other organization on the platform can see
// this person's uploaded certificates, write-once was the wrong lifetime: an
// auditor who answered in haste, or whose circumstances changed, had no way out
// except asking an admin to edit the database.
//
// Only the auditor may change it. An admin cannot grant consent on someone
// else's behalf — that would make the flag a statement about what the
// organization wants rather than what the auditor agreed to, which is the one
// thing it is for. The routes that read credentials
// (app/lib/auditor/credentialAccess.ts) evaluate the flag per request, so a
// revocation takes effect on the next page load with no backfill needed.
//
// Revoking hides the documents platform-wide but not from the organization that
// invited them: the auditor handed those certificates to that organization
// directly when accepting its invitation, and that organization still has to be
// able to vet the person it engaged.

/** The auditor's submission, found by the email on their token.
 *
 *  `auditor_responses` has no user_id — the row is written before any account
 *  exists — so email is the only join, and it is unique on that table. */
async function submissionFor(email: string) {
  return prisma.auditor_responses.findUnique({
    where: { email },
    select: { id: true, recognition_consent: true, responses: true, status: true },
  });
}

function guard(req: NextRequest) {
  // Role-gated to auditors, with the admin bypass switched off.
  //
  // `hasAccess` defaults `allowAdmins` to true, so every admin tier satisfies
  // any rule unless a route says otherwise — `{ roles: ['auditor'] }` alone
  // reads like a restriction and is not one. Consent is the auditor's own act
  // by design, so an admin must not pass this gate even though the lookup below
  // is keyed on the caller's own email and could not reach another person's row
  // anyway. The guard should mean what it says.
  const auth = authorize(tokenFromRequest(req), {
    roles: ['auditor'],
    allowAdmins: false,
  });
  if (!auth.ok) return { ok: false as const, response: auth.response };

  const email = (auth.user as any)?.email;
  if (!email) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Sign in again to continue.' }, { status: 400 }),
    };
  }
  return { ok: true as const, email: String(email) };
}

export async function GET(req: NextRequest) {
  const g = guard(req);
  if (!g.ok) return g.response;

  try {
    const row = await submissionFor(g.email);
    if (!row) {
      return NextResponse.json({ error: 'No auditor submission for this account.' }, { status: 404 });
    }

    return NextResponse.json({
      consent: row.recognition_consent,
      question: AUDITOR_QUESTIONS[RECOGNITION_QUESTION_INDEX],
    });
  } catch (err) {
    console.error('auditor-consent read failed:', err);
    return NextResponse.json({ error: 'Could not read your consent setting.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const g = guard(req);
  if (!g.ok) return g.response;

  try {
    const body = await req.json().catch(() => null);
    const consent = body?.consent;
    if (typeof consent !== 'boolean') {
      return NextResponse.json({ error: 'Send consent as true or false.' }, { status: 400 });
    }

    const row = await submissionFor(g.email);
    if (!row) {
      return NextResponse.json({ error: 'No auditor submission for this account.' }, { status: 404 });
    }

    // The stored answers are the record of what they were asked and said, and
    // the flag is derived from them — so changing the flag without the answer
    // would leave the two disagreeing, and `hasRecognitionConsent` reading the
    // array would contradict the column. Both move together.
    const responses = Array.isArray(row.responses) ? [...(row.responses as unknown[])] : [];
    if (responses.length > RECOGNITION_QUESTION_INDEX) {
      responses[RECOGNITION_QUESTION_INDEX] = consent ? 'Yes' : 'No';
    }

    await prisma.auditor_responses.update({
      where: { id: row.id },
      data: {
        recognition_consent: consent,
        ...(responses.length > RECOGNITION_QUESTION_INDEX
          ? { responses: responses as any }
          : {}),
      },
    });

    return NextResponse.json({ consent });
  } catch (err) {
    console.error('auditor-consent update failed:', err);
    return NextResponse.json({ error: 'Your consent setting could not be saved.' }, { status: 500 });
  }
}
