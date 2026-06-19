import { NextResponse } from "next/server";
import { fetchWeatherGrid } from "@/lib/api/weather";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const weatherPoints = await fetchWeatherGrid();
    return NextResponse.json({ weatherPoints }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
