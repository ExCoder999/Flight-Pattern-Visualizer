import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED_LAYERS = new Set([
  "temp_new",
  "precipitation_new",
  "wind_new",
  "clouds_new",
  "pressure_new",
]);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ params: string[] }> }
) {
  const { params: slugs } = await params;
  const [layer, z, x, y] = slugs;

  if (!ALLOWED_LAYERS.has(layer)) {
    return new NextResponse("Invalid layer", { status: 400 });
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    return new NextResponse("No OWM API key configured", { status: 503 });
  }

  try {
    const url = `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 1800 } });

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
