import { NextResponse, type NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { dbConnect } from '@/lib/db';
import { Program } from '@/models/Program';
import { requireSession } from '@/lib/auth';
import { uniqueSlug } from '@/lib/slug';
import { PROGRAMS_TAG } from '@/lib/programs';

export const runtime = 'nodejs';

/** Split a textarea (one benefit per line) into a clean string[]. */
function parseBenefits(input: unknown): string[] {
  if (Array.isArray(input)) return input.map((b) => String(b).trim()).filter(Boolean);
  return String(input ?? '')
    .split('\n')
    .map((b) => b.trim())
    .filter(Boolean);
}

export async function GET() {
  try {
    await requireSession();
    await dbConnect();

    const programs = await Program.find({}).sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json({ programs });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/programs GET]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireSession();
    await dbConnect();

    const body = await request.json();
    const name = String(body.name ?? '').trim();
    if (!name) {
      return NextResponse.json({ error: 'Le nom du cours est obligatoire.' }, { status: 400 });
    }

    const slug = await uniqueSlug(Program, String(body.slug || name));

    const program = await Program.create({
      slug,
      order: Number.isFinite(Number(body.order)) ? Number(body.order) : 100,
      name,
      tagline: String(body.tagline ?? '').trim(),
      intro: String(body.intro ?? '').trim(),
      benefits: parseBenefits(body.benefits),
      ageRange: String(body.ageRange ?? '').trim(),
      level: String(body.level ?? '').trim(),
      duration: String(body.duration ?? '').trim(),
      image: String(body.image ?? '').trim(),
      imageAlt: String(body.imageAlt ?? '').trim(),
      status: body.status === 'published' ? 'published' : 'draft',
    });

    revalidateTag(PROGRAMS_TAG);

    return NextResponse.json({ program }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/programs POST]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
