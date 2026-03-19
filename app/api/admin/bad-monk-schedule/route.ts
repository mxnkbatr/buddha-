import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { generateBadMonkSchedule, mergeBlockedSlots } from "@/lib/bad-monk-schedule";

/**
 * POST /api/admin/bad-monk-schedule
 *
 * Generate forced schedules for all bad monks (or a specific one).
 * Body (optional): { monkId?: string }
 */
export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // No body is fine — process all bad monks
    }

    // Build query
    const query: any = { role: "monk", isBadMonk: true };
    if (body.monkId) {
      const { ObjectId } = await import("mongodb");
      query._id = ObjectId.isValid(body.monkId)
        ? new ObjectId(body.monkId)
        : body.monkId;
    }

    // Find bad monks
    const badMonks = await db.collection("users").find(query).toArray();

    if (badMonks.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No bad monks found to process.",
        processed: 0,
      });
    }

    const defaultSchedule = [
      { day: "Monday", start: "00:00", end: "23:59", active: true },
      { day: "Tuesday", start: "00:00", end: "23:59", active: true },
      { day: "Wednesday", start: "00:00", end: "23:59", active: true },
      { day: "Thursday", start: "00:00", end: "23:59", active: true },
      { day: "Friday", start: "00:00", end: "23:59", active: true },
      { day: "Saturday", start: "00:00", end: "23:59", active: false },
      { day: "Sunday", start: "00:00", end: "23:59", active: false },
    ];

    let processed = 0;
    const results: { monkId: string; name: string; blockedDays: number; totalSlots: number }[] = [];

    for (const monk of badMonks) {
      const schedule = monk.schedule || defaultSchedule;

      // Generate forced blocks
      const forcedSlots = generateBadMonkSchedule(schedule);

      // Merge with existing manual blocks
      const merged = mergeBlockedSlots(monk.blockedSlots || [], forcedSlots);

      // Save to database
      await db.collection("users").updateOne(
        { _id: monk._id },
        { $set: { blockedSlots: merged, updatedAt: new Date() } }
      );

      // Count fully blocked days for reporting
      const dateSet = new Set(forcedSlots.map(s => s.date));
      results.push({
        monkId: monk._id.toString(),
        name: monk.name?.mn || monk.name?.en || "Unknown",
        blockedDays: dateSet.size,
        totalSlots: forcedSlots.length,
      });

      processed++;
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processed} bad monk(s).`,
      processed,
      results,
    });

  } catch (error: any) {
    console.error("Bad Monk Schedule Error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}
