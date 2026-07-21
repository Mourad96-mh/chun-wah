import mongoose from 'mongoose';

/**
 * Cached connection.
 *
 * Next.js hot-reloads modules in dev and reuses lambda instances in prod, so a
 * naive connect() would open a new pool on every reload and exhaust Atlas's
 * connection limit. The promise is stashed on globalThis to survive both.
 */

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

export async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.',
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Let the next call retry instead of caching a rejected promise forever.
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
