import { db } from "@/src/db";
import { comments } from "@/src/db/schemas/posts.sql";
import { NextResponse } from "next/server";
import { and, count, eq, gte, lt } from "drizzle-orm";

export async function GET() {
  try {
    // Get total comments count
    const totalComments = await db
      .select({ count: count() })
      .from(comments)
      .where(eq(comments.status, "approved"));

    // Calculate date ranges
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);

    // Get comments count for current week
    const currentWeekComments = await db
      .select({ count: count() })
      .from(comments)
      .where(
        and(
          eq(comments.status, "approved"),
          gte(comments.created_at, oneWeekAgo),
          lt(comments.created_at, now)
        )
      );

    // Get comments count for previous week
    const previousWeekComments = await db
      .select({ count: count() })
      .from(comments)
      .where(
        and(
          eq(comments.status, "approved"),
          gte(comments.created_at, twoWeeksAgo),
          lt(comments.created_at, oneWeekAgo)
        )
      );

    const currentWeekCount = currentWeekComments[0].count;
    const previousWeekCount = previousWeekComments[0].count;
    const isUp = currentWeekCount > previousWeekCount;

    return NextResponse.json({
      total: totalComments[0].count,

      weeklyGrowth: currentWeekCount,
      isUp,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch comments analytics" },
      { status: 500 }
    );
  }
}