import { NextResponse, type NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireSession } from '@/lib/auth';

export const runtime = 'nodejs';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

function isConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

export async function POST(request: NextRequest) {
  try {
    await requireSession();

    if (!isConfigured()) {
      return NextResponse.json(
        {
          error:
            "L'upload n'est pas configuré (clés Cloudinary absentes). Collez une URL d'image en attendant.",
        },
        { status: 503 },
      );
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });
    }

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format non supporté. Utilisez JPG, PNG, WebP ou AVIF.' },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'Image trop lourde (5 Mo maximum).' },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'chunwah',
            resource_type: 'image',
            // Cap dimensions and let Cloudinary pick the best format/quality.
            transformation: [
              { width: 1600, height: 1600, crop: 'limit' },
              { quality: 'auto', fetch_format: 'auto' },
            ],
          },
          (error, uploaded) => {
            if (error || !uploaded) reject(error ?? new Error('Upload échoué'));
            else resolve(uploaded as { secure_url: string });
          },
        )
        .end(buffer);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/upload]', err);
    return NextResponse.json({ error: "Échec de l'upload." }, { status: 500 });
  }
}
