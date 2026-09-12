// The signup form is retired.
//
// An organization is created by the storefront calling /api/storefront/provision
// after a payment completes: it creates the organization and its administrator
// and emails a link to choose a password. There is nothing for a person to fill
// in here any more, and a form that cannot succeed is worse than no form.
//
// The route is kept rather than deleted because the old checkout links point at
// it, and they will for as long as anyone's inbox holds one.

import Link from 'next/link';
import Image from 'next/image';

export const metadata = { title: 'PES | Sign Up' };

export default function SignupRetired() {
  return (
    <main className="w-full min-h-screen flex items-center justify-center p-8 bg-gray-10">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-line shadow-sm p-10 text-center">
        <div className="my-2 text-pes text-3xl font-extrabold flex justify-center">
          <Image src="/Vector.svg" alt="PES" width={48} height={48} />
          <p className="ms-2 my-auto">PES</p>
        </div>

        <h1 className="mt-6 text-xl font-semibold text-strong">
          Accounts are created for you
        </h1>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          When a PES plan is purchased, we set up the organization and its
          administrator straight away and email them a link to choose a
          password. There is no form to fill in.
        </p>

        <div className="mt-7 rounded-lg bg-canvas border border-line px-4 py-3 text-left">
          <p className="text-sm text-body">
            <strong>Already paid but no email?</strong> Check spam first, then
            request a new link from the sign-in page — it works even if the
            original has expired.
          </p>
        </div>

        <div className="mt-7 flex items-center justify-center gap-3">
          <Link href="/login" className="text-sm font-medium text-pes">
            Go to sign in
          </Link>
          <span className="text-line">•</span>
          <Link href="/help" className="text-sm font-medium text-pes">
            Read the user guide
          </Link>
        </div>
      </div>
    </main>
  );
}
