import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { Monk } from "@/database/types";
import { withCache, getCacheHeaders, invalidateCache } from "@/lib/api/cache";
import { asyncHandler, errorResponse, successResponse, ApiError } from "@/lib/api/errors";
import { withPerformanceTracking } from "@/lib/api/performance";

// ============================================
// OPTIMIZED GET - Fetch all monks
// ============================================
const getMonksHandler = asyncHandler(async (request: Request) => {
  const url = new URL(request.url);
  const cacheKey = `monks:list:${url.searchParams.toString()}`;

  // Use cache with 15-minute TTL
  const monks = await withCache(
    cacheKey,
    async () => {
      const { db } = await connectToDatabase();

      // Fetch from 'users' collection where role is 'monk'
      // Projection: Select only necessary fields for the list view to reduce payload size
      const monksData = await db.collection("users").find(
        { role: "monk" },
        {
          projection: {
            _id: 1,
            name: 1,
            title: 1,
            image: 1,
            specialties: 1,
            isSpecial: 1,
            yearsOfExperience: 1,
            bio: 1
          }
        }
      ).toArray() as unknown as Monk[];

      // Serialize _id to string to avoid serialization issues in Next.js response
      let serializedMonks = monksData.map(monk => ({
        ...monk,
        _id: monk._id?.toString() ?? ""
      }));

      // SORTING: Special monks (Admin designated) first
      serializedMonks.sort((a, b) => {
        const isASpecial = a.isSpecial === true;
        const isBSpecial = b.isSpecial === true;

        if (isASpecial && !isBSpecial) return -1;
        if (!isASpecial && isBSpecial) return 1;
        return 0;
      });

      return serializedMonks;
    },
    900 // 15 minutes cache
  );

  // Return with cache headers for CDN/browser caching
  return new NextResponse(JSON.stringify(monks), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...getCacheHeaders(900),
    },
  });
});

// ============================================
// OPTIMIZED POST - Create/Update monk profile
// ============================================
const postMonkHandler = asyncHandler(async (request: Request) => {
  const { db } = await connectToDatabase();
  const data = await request.json();

  if (!data.clerkId) {
    throw new ApiError("Missing clerkId.", 400, 'MISSING_CLERK_ID');
  }

  const { _id, ...updateFields } = data;

  // IMPORTANT: Set role directly to "monk" and remove monkStatus
  const result = await db.collection("users").updateOne(
    { clerkId: data.clerkId },
    {
      $set: {
        ...updateFields,
        role: "monk", // Now directly set to monk
        monkStatus: "approved", // Optional, but helps ensure state is consistent if old data had it
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
        karma: 0,
        meditationDays: 0,
        totalMerits: 0,
      },
    },
    { upsert: true }
  );

  // Invalidate monks list cache
  invalidateCache('monks:list:*');

  return successResponse(
    { message: "Monk profile saved.", result },
    200
  );
});

// Export with performance tracking
export const GET = withPerformanceTracking(getMonksHandler, '/api/monks GET');
export const POST = withPerformanceTracking(postMonkHandler, '/api/monks POST');