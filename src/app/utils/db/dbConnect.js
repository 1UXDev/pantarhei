import mongoose from "mongoose";

// Get connection string from .env
const MONGODB_URI = process.env.MONGODB_URI;

// handle if connect did not work
if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

// use whats in cache
let cached = global.mongoose;

// if there is nothing in cache, assign conn and promise null
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// try to connect
async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
