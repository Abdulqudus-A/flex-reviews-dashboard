import { promises as fs } from "fs";
import { join } from "path";
import { NormalizedReview } from "./types";

type Data = { reviews: NormalizedReview[] };

const file = join(process.cwd(), "db.json");
let cache: { data: Data } | null = null;

async function readFile(): Promise<Data> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as Data;
  } catch {
    return { reviews: [] };
  }
}

async function writeFile(data: Data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

export async function initDb() {
  if (!cache) {
    const data = await readFile();
    cache = { data };
    // ensure file exists
    await writeFile(cache.data);
  }
  return {
    data: cache.data,
    async write() {
      await writeFile(cache!.data);
    }
  };
}

export default { initDb };
