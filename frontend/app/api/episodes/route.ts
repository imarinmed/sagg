import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const dataDir = path.resolve(process.cwd(), "..", "data", "parsed");

export async function GET() {
  const episodesPath = path.join(dataDir, "episodes.json");

  try {
    const raw = await readFile(episodesPath, "utf-8");
    const episodes = JSON.parse(raw);
    return NextResponse.json(episodes);
  } catch (error) {
    return NextResponse.json(
      { error: "episodes.json not found or invalid" },
      { status: 404 }
    );
  }
}
