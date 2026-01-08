import { NextResponse } from "next/server";
import { getMoonPhase } from "@/lib/moon";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const moonData = getMoonPhase();

    return NextResponse.json({
      data: {
        phase: moonData.phase,
        illumination: moonData.illumination,
        age: moonData.age,
        nextPhases: {
          newMoon: moonData.nextPhases.newMoon.toISOString(),
          firstQuarter: moonData.nextPhases.firstQuarter.toISOString(),
          fullMoon: moonData.nextPhases.fullMoon.toISOString(),
          lastQuarter: moonData.nextPhases.lastQuarter.toISOString(),
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Moon API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate moon phase", timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
