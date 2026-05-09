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

export async function GET(req: Request, { params }: { params: { filename: string } }) {
    const { filename } = params;

    if (!filename) {
        return NextResponse.json({ error: 'Missing filename parameter' }, { status: 400 });
    }

    const filePath = `public/downloadables/${filename}`;

    try {
        const fileData = await fs.readFile(filePath);
        return NextResponse.json(fileData, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('Error downloading file:', error);
        return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
    }
}
