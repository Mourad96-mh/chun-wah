import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireSession } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * Signed direct-upload for videos.
 *
 * The image upload streams the file through this server to Cloudinary, which is
 * fine at 5 MB but not for video: serverless platforms cap the request body
 * (Vercel ~4.5 MB). So videos are uploaded straight from the browser to
 * Cloudinary — this route only hands back a short-lived signature so the
 * api_secret never leaves the server.
 */
function isConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

export async function POST() {
  try {
    await requireSession();

    if (!isConfigured()) {
      return NextResponse.json(
        {
          error:
            "L'upload vidéo n'est pas configuré (clés Cloudinary absentes). Collez l'URL d'une vidéo en attendant.",
        },
        { status: 503 },
      );
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'chunwah/videos';

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET as string,
    );

    return NextResponse.json({
      timestamp,
      folder,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/upload/sign]', err);
    return NextResponse.json({ error: 'Signature impossible.' }, { status: 500 });
  }
}
