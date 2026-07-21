import { NextResponse, type NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/db';
import { Admin } from '@/models/Admin';
import { createSessionToken, setSessionCookie } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
    }

    await dbConnect();
    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });

    // Same message and roughly the same work either way, so the response does
    // not reveal whether the address exists.
    const hash = admin?.passwordHash ?? '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvaliduu';
    const ok = await bcrypt.compare(password, hash);

    if (!admin || !ok) {
      return NextResponse.json(
        { error: 'E-mail ou mot de passe incorrect.' },
        { status: 401 },
      );
    }

    const token = await createSessionToken({
      sub: String(admin._id),
      email: admin.email,
      name: admin.name ?? '',
    });
    await setSessionCookie(token);

    admin.lastLoginAt = new Date();
    await admin.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[auth/login]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
