import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const dataPath = path.join(
      process.cwd(),
      "..",
      "data",
      "video_analysis",
      "video_analysis.json"
    );

    const data = await readFile(dataPath, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json(
      { error: "Video analysis data not found" },
      { status: 404 }
    );
  }
}
