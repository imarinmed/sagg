import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const pathSegments = (await params).path;
    
    if (pathSegments.length < 2) {
      return NextResponse.json(
        { error: "Invalid screenshot path" },
        { status: 400 }
      );
    }

    const [episodeId, filename] = pathSegments;
    
    const screenshotPath = path.join(
      process.cwd(),
      "..",
      "data",
      "video_analysis",
      "screenshots",
      filename
    );

    try {
      await stat(screenshotPath);
    } catch {
      return NextResponse.json(
        { error: "Screenshot not found" },
        { status: 404 }
      );
    }

    const imageBuffer = await readFile(screenshotPath);
    
    const ext = path.extname(filename).toLowerCase();
    const contentType =
      ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : ext === ".png"
        ? "image/png"
        : ext === ".webp"
        ? "image/webp"
        : "application/octet-stream";

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load screenshot" },
      { status: 500 }
    );
  }
}
