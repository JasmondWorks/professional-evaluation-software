import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import prisma from '../prisma.dev';
import { authorize, tokenFromRequest } from '../_lib/authGuard';

// The SDK reads CLOUDINARY_URL (cloudinary://key:secret@cloud) on its own, but
// configure explicitly so a deployment that sets the three separate variables
// works too.
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

/** Upload the signed-in user's profile photo.
 *
 *  A person may only ever change their own picture, so the target is taken from
 *  the verified token rather than from the request body. */
export async function POST(req: Request) {
  try {
    const auth = authorize(tokenFromRequest(req), {});
    if (!auth.ok) return auth.response;

    if (!process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_API_KEY) {
      return NextResponse.json(
        { error: 'Image uploads are not configured on this server.' },
        { status: 500 },
      );
    }

    const form = await req.formData();
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

    const claims: any = auth.user;
    const me = await prisma.pesuser.findFirst({
      where: {
        org: claims.org ?? undefined,
        OR: [{ name: claims.name }, { email: claims.email }],
      },
      select: { id: true, image: true },
    });
    if (!me) return NextResponse.json({ error: 'Your account could not be found.' }, { status: 404 });

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploaded = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'pes/avatars',
            // One image per person, replaced in place, so old photos do not pile
            // up in the account.
            public_id: `user_${me.id}`,
            overwrite: true,
            invalidate: true,
            resource_type: 'image',
            transformation: [
              { width: 512, height: 512, crop: 'fill', gravity: 'face' },
              { quality: 'auto', fetch_format: 'auto' },
            ],
          },
          (err, result) => (err ? reject(err) : resolve(result)),
        )
        .end(buffer);
    });

    const url: string = uploaded.secure_url;
    await prisma.pesuser.update({ where: { id: me.id }, data: { image: url } });

    return NextResponse.json({ image: url });
  } catch (err) {
    console.error('profile-image upload failed:', err);
    return NextResponse.json(
      { error: 'The image could not be uploaded. Try again.' },
      { status: 500 },
    );
  }
}

/** Remove the photo and fall back to initials again. */
export async function DELETE(req: Request) {
  try {
    const auth = authorize(tokenFromRequest(req), {});
    if (!auth.ok) return auth.response;

    const claims: any = auth.user;
    const me = await prisma.pesuser.findFirst({
      where: {
        org: claims.org ?? undefined,
        OR: [{ name: claims.name }, { email: claims.email }],
      },
      select: { id: true },
    });
    if (!me) return NextResponse.json({ error: 'Your account could not be found.' }, { status: 404 });

    try {
      await cloudinary.uploader.destroy(`pes/avatars/user_${me.id}`, { invalidate: true });
    } catch {
      // The database is the source of truth for whether a photo is shown, so a
      // failed remote delete must not block clearing it here.
    }

    await prisma.pesuser.update({ where: { id: me.id }, data: { image: null } });
    return NextResponse.json({ image: null });
  } catch (err) {
    console.error('profile-image delete failed:', err);
    return NextResponse.json({ error: 'The photo could not be removed. Try again.' }, { status: 500 });
  }
}
