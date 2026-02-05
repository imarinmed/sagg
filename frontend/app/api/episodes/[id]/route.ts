import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const dataDir = path.resolve(process.cwd(), "..", "data", "parsed");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const episodesPath = path.join(dataDir, "episodes.json");

  try {
    const { id } = await params;
    const raw = await readFile(episodesPath, "utf-8");
    const episodes = JSON.parse(raw);
    const episode = episodes.find((item: { id: string }) => item.id === id);

    if (!episode) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 });
    }

    return NextResponse.json(episode);
  } catch (error) {
    return NextResponse.json(
      { error: "episodes.json not found or invalid" },
      { status: 404 }
    );
  }
}
