// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { fail, viewerFrom } from '../_auth';

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

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/** Supporting evidence for an appraisal entry.
 *
 *  The model requires research to be submitted "with evidence duly uploaded by
 *  each lecturer", and the academic questionnaire asks for training certificates.
 *  Files are stored per organization so one org can never reach another's. */
export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);

    if (!process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_API_KEY) {
      return NextResponse.json(
        { error: 'File uploads are not configured on this server.' },
        { status: 500 },
      );
    }

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Choose a file to upload.' }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: 'That file type is not supported. Use a PDF, Word document, or an image.' },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'That file is larger than 10MB. Choose a smaller one.' },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeOrg = viewer.org.replace(/[^a-zA-Z0-9_-]/g, '_');

    const uploaded = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `pes/appraisal-evidence/${safeOrg}`,
            // PDFs and documents are not images, so let Cloudinary decide.
            resource_type: 'auto',
          },
          (err, result) => (err ? reject(err) : resolve(result)),
        )
        .end(buffer);
    });

    return NextResponse.json({
      url: uploaded.secure_url,
      name: file.name,
    });
  } catch (err) {
    return fail(err);
  }
}
