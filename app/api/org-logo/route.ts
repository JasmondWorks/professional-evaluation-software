// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import prisma from '../prisma.dev';
import { authorize, tokenFromRequest } from '../_lib/authGuard';

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else {
  cloudinary.config({ secure: true });
}

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/** The two marks page 1 of the specification requires on the software and on
 *  every award document, Book of Records and Hall of Fame record.
 *
 *  One route rather than two because the upload, the validation, the size
 *  limits and the Cloudinary handling are identical — only the column and the
 *  stored public_id differ. `mark` defaults to 'logo' so every existing caller
 *  keeps working unchanged. */
const MARKS = {
  logo: { column: 'logo_url', slug: 'org', label: 'logo' },
  'coat-of-arms': { column: 'coat_of_arms_url', slug: 'coa', label: 'coat of arms' },
} as const;

type MarkKey = keyof typeof MARKS;

function markFrom(value: unknown): MarkKey | null {
  if (value === null || value === undefined || value === '') return 'logo';
  return typeof value === 'string' && value in MARKS ? (value as MarkKey) : null;
}

/** Upload the signed-in admin's organization logo. Only an org admin may
 *  change branding, so this is restricted to the admin tiers rather than any
 *  signed-in user (unlike the personal profile photo). */
export async function POST(req: Request) {
  try {
    const auth = authorize(tokenFromRequest(req), { roles: ['admin', 'super-admin'] });
    if (!auth.ok) return auth.response;

    if (!process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_API_KEY) {
      return NextResponse.json(
        { error: 'Image uploads are not configured on this server.' },
        { status: 500 },
      );
    }

    const claims: any = auth.user;
    if (!claims.orgId) {
      return NextResponse.json({ error: 'Your account has no organization.' }, { status: 400 });
    }

    const form = await req.formData();

    const mark = markFrom(form.get('mark'));
    if (!mark) {
      return NextResponse.json({ error: 'Unknown mark.' }, { status: 400 });
    }
    const spec = MARKS[mark];

    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Choose an image to upload.' }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: 'That file type is not supported. Use a JPG, PNG, WEBP or GIF.' },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'That image is larger than 5MB. Choose a smaller one.' },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploaded = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'pes/org-logos',
            // One of each mark per organization, replaced in place. The slug
            // keeps the coat of arms from overwriting the logo.
            public_id: `${spec.slug}_${claims.orgId}`,
            overwrite: true,
            invalidate: true,
            resource_type: 'image',
            transformation: [
              { width: 512, height: 512, crop: 'fit' },
              { quality: 'auto', fetch_format: 'auto' },
            ],
          },
          (err, result) => (err ? reject(err) : resolve(result)),
        )
        .end(buffer);
    });

    const url: string = uploaded.secure_url;
    await prisma.org.update({
      where: { id: claims.orgId },
      data: { [spec.column]: url },
    });

    // `logo` is kept in the response for both marks: it is what every existing
    // caller reads, and renaming it would break the logo uploader for the sake
    // of a tidier key. `mark` says which one came back.
    return NextResponse.json({ logo: url, mark });
  } catch (err) {
    console.error('org-logo upload failed:', err);
    return NextResponse.json(
      { error: 'The image could not be uploaded. Try again.' },
      { status: 500 },
    );
  }
}

/** Remove the organization's logo. */
export async function DELETE(req: Request) {
  try {
    const auth = authorize(tokenFromRequest(req), { roles: ['admin', 'super-admin'] });
    if (!auth.ok) return auth.response;

    const claims: any = auth.user;
    if (!claims.orgId) {
      return NextResponse.json({ error: 'Your account has no organization.' }, { status: 400 });
    }

    const mark = markFrom(new URL(req.url).searchParams.get('mark'));
    if (!mark) {
      return NextResponse.json({ error: 'Unknown mark.' }, { status: 400 });
    }
    const spec = MARKS[mark];

    try {
      await cloudinary.uploader.destroy(`pes/org-logos/${spec.slug}_${claims.orgId}`, {
        invalidate: true,
      });
    } catch {
      // The database is the source of truth for whether a mark is shown, so a
      // failed remote delete must not block clearing it here.
    }

    await prisma.org.update({
      where: { id: claims.orgId },
      data: { [spec.column]: null },
    });
    return NextResponse.json({ logo: null, mark });
  } catch (err) {
    console.error('org-logo delete failed:', err);
    return NextResponse.json(
      { error: 'The image could not be removed. Try again.' },
      { status: 500 },
    );
  }
}
