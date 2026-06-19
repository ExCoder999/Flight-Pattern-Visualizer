import { NextResponse } from "next/server";
import { fetchHistoricalTrajectories, fetchLiveFlights } from "@/lib/api/flights";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "trajectories";

  try {
    if (type === "live") {
      const flights = await fetchLiveFlights();
      return NextResponse.json({ flights }, { status: 200 });
    }
    const trajectories = await fetchHistoricalTrajectories();
    return NextResponse.json({ trajectories }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
