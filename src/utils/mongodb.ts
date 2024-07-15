import { MongoClient, ServerApiVersion } from "mongodb";

interface FavoriteDocument {
  userId: string;
  favorites: number[];
}

let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }

  const client = new MongoClient(uri, {
    serverApi: ServerApiVersion.v1,
  });

  await client.connect();
  cachedClient = client;
  return client;
}

export async function addFavorite(userId: string, showId: number) {
  const client = await connectToDatabase();
  const db = client.db("tv_shows");
  const collection = db.collection("favorites");

  await collection.updateOne(
    { userId },
    { $addToSet: { favorites: showId } },
    { upsert: true }
  );
}

export async function removeFavorite(userId: string, showId: number) {
  const client = await connectToDatabase();
  const db = client.db("tv_shows");
  const collection = db.collection<FavoriteDocument>("favorites");

  await collection.updateOne({ userId }, { $pull: { favorites: showId } });
}

export async function getFavorites(userId: string): Promise<number[]> {
  const client = await connectToDatabase();
  const db = client.db("tv_shows");
  const collection = db.collection("favorites");

  const result = await collection.findOne({ userId });
  return result?.favorites || [];
}
