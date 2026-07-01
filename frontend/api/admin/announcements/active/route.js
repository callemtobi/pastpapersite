// app/api/announcements/active/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Announcement from "@/models/Announcement";

export async function GET() {
  try {
    await connectDB();
    const announcements = await Announcement.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({
      success: true,
      announcements,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
