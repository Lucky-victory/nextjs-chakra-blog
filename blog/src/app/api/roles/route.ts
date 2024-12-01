import { db } from "@/src/db";
import { roles } from "@/src/db/schemas/users.sql";
import { checkPermission } from "@/src/middlewares/check-permission";
import { NextResponse } from "next/server";

export async function GET() {
  return await checkPermission("roles:read", async () => {
    try {
      const allRoles = await db.select().from(roles);
      return NextResponse.json({
        data: allRoles,
        message: "Roles fetched successfully...",
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch roles" },
        { status: 500 }
      );
    }
  });
}