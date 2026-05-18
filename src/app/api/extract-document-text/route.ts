import { NextResponse } from 'next/server';
import officeParser from 'officeparser';

export const runtime = 'nodejs';

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = /\.(pdf|pptx)(?:[?#].*)?$/i;

function normalizeExtractedText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: unknown };
    const url = typeof body.url === 'string' ? body.url.trim() : '';

    if (!url || !url.startsWith('https://')) {
      return NextResponse.json({ error: 'A public HTTPS file URL is required.' }, { status: 400 });
    }

    if (!SUPPORTED_EXTENSIONS.test(url.split('?')[0])) {
      return NextResponse.json({ error: 'Only PDF and PPTX files are supported.' }, { status: 400 });
    }

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json({ error: 'Could not download the document.' }, { status: 400 });
    }

    const contentLength = Number(response.headers.get('content-length') ?? 0);

    if (contentLength > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'Document is larger than 20 MB.' }, { status: 413 });
    }

    const arrayBuffer = await response.arrayBuffer();

    if (arrayBuffer.byteLength > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'Document is larger than 20 MB.' }, { status: 413 });
    }

    const parsedDocument = await officeParser.parseOffice(arrayBuffer);
    const text = normalizeExtractedText(parsedDocument.toText());

    return NextResponse.json({
      text,
      characterCount: text.length,
    });
  } catch (error) {
    console.error('Document text extraction failed:', error);
    return NextResponse.json({ error: 'Could not extract text from this document.' }, { status: 200 });
  }
}
