import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const dataDir = path.resolve(process.cwd(), "..", "data", "parsed");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const episodePath = path.join(dataDir, `${id}.json`);

  try {
    const raw = await readFile(episodePath, "utf-8");
    const episode = JSON.parse(raw);
    return NextResponse.json(episode.scenes || []);
  } catch (error) {
    return NextResponse.json(
      { error: "Episode scenes not found" },
      { status: 404 }
    );
  }
}
