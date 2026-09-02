import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

// interface DownloadRequest extends NextApiRequest {
//   query: {
//     fileName?: string;
//     [key: string]: any;
//   };
// }

// interface ErrorResponse {
//   error: string;
// }

// export async function GET(
//   req: NextRequest,
//   res: NextResponse
// ): Promise<void> {
//   const { fileName } = req.query;

//   if (!fileName) {
//     return res.status(400).json({ error: 'Missing filename parameter' });
//   }

//   const filePath = path.join(process.cwd(), 'public', 'downloadables', fileName);

//   try {
//     const fileData = await fs.readFile(filePath);
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'); // Adjust content type based on file type
//     res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
//     res.send(fileData);
//   } catch (error) {
//     console.error('Error downloading file:', error);
//     res.status(500).json({ error: 'Failed to download file' });
//   }
// }

// Deliberately public: serves the blank forms under public/downloadables, which
// are the same files for everyone. The path is containment-checked below.
export async function GET(req: Request, { params }: { params: { filename: string } }) {
    const { filename } = params;

    if (!filename) {
        return NextResponse.json({ error: 'Missing filename parameter' }, { status: 400 });
    }

    // The name was interpolated straight into the path. Resolve it and require
    // the result to still sit inside the downloadables directory, so no amount
    // of "..", encoded or otherwise, walks out of it.
    const root = path.resolve(process.cwd(), 'public', 'downloadables');
    const filePath = path.resolve(root, filename);
    if (filePath !== root && !filePath.startsWith(root + path.sep)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    try {
        const fileData = await fs.readFile(filePath);
        // The file was previously handed back through NextResponse.json, which
        // serialised the buffer as a JSON object of byte indices — the download
        // has never actually worked.
        return new NextResponse(new Uint8Array(fileData), {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`,
            },
        });
    } catch (error) {
        console.error('Error downloading file:', error);
        return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
    }
}
