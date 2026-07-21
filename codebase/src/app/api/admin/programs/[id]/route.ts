import { NextResponse, type NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { dbConnect } from '@/lib/db';
import { Program } from '@/models/Program';
import { requireSession } from '@/lib/auth';
import { uniqueSlug } from '@/lib/slug';
import { PROGRAMS_TAG } from '@/lib/programs';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

function parseBenefits(input: unknown): string[] {
  if (Array.isArray(input)) return input.map((b) => String(b).trim()).filter(Boolean);
  return String(input ?? '')
    .split('\n')
    .map((b) => b.trim())
    .filter(Boolean);
}

export async function GET(_request: NextRequest, { params }: Ctx) {
  try {
    await requireSession();
    await dbConnect();

    const { id } = await params;
    const program = await Program.findById(id).lean();
    if (!program) {
      return NextResponse.json({ error: 'Cours introuvable.' }, { status: 404 });
    }
    return NextResponse.json({ program });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/programs/:id GET]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    await requireSession();
    await dbConnect();

    const { id } = await params;
    const program = await Program.findById(id);
    if (!program) {
      return NextResponse.json({ error: 'Cours introuvable.' }, { status: 404 });
    }

    const body = await request.json();

    if (body.name !== undefined) program.name = String(body.name).trim();
    if (body.slug !== undefined) {
      // Recompute uniqueness, letting this doc keep its own slug.
      program.slug = await uniqueSlug(Program, String(body.slug || program.name), id);
    }
    if (body.tagline !== undefined) program.tagline = String(body.tagline).trim();
    if (body.intro !== undefined) program.intro = String(body.intro).trim();
    if (body.benefits !== undefined) program.benefits = parseBenefits(body.benefits);
    if (body.ageRange !== undefined) program.ageRange = String(body.ageRange).trim();
    if (body.level !== undefined) program.level = String(body.level).trim();
    if (body.duration !== undefined) program.duration = String(body.duration).trim();
    if (body.image !== undefined) program.image = String(body.image).trim();
    if (body.imageAlt !== undefined) program.imageAlt = String(body.imageAlt).trim();
    if (body.order !== undefined && Number.isFinite(Number(body.order))) {
      program.order = Number(body.order);
    }
    if (body.status !== undefined) {
      program.status = body.status === 'published' ? 'published' : 'draft';
    }

    if (!program.name) {
      return NextResponse.json({ error: 'Le nom du cours est obligatoire.' }, { status: 400 });
    }

    await program.save();
    revalidateTag(PROGRAMS_TAG);

    return NextResponse.json({ program });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/programs/:id PUT]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  try {
    await requireSession();
    await dbConnect();

    const { id } = await params;
    const program = await Program.findByIdAndDelete(id);
    if (!program) {
      return NextResponse.json({ error: 'Cours introuvable.' }, { status: 404 });
    }

    revalidateTag(PROGRAMS_TAG);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[admin/programs/:id DELETE]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
