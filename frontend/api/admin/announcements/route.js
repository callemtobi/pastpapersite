// app/api/admin/announcements/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Announcement from "@/models/Announcement";

// GET - Fetch all announcements (admin)
export async function GET() {
  try {
    await connectDB();
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
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

// POST - Create announcement (admin)
export async function POST(request) {
  try {
    const { title, content, isActive } = await request.json();

    await connectDB();
    const announcement = await Announcement.create({
      title,
      content,
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json({
      success: true,
      announcement,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// PATCH - Update announcement (admin)
export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const { title, content, isActive } = await request.json();

    await connectDB();
    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { title, content, isActive },
      { new: true },
    );

    if (!announcement) {
      return NextResponse.json(
        { success: false, message: "Announcement not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      announcement,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// DELETE - Delete announcement (admin)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    await connectDB();
    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      return NextResponse.json(
        { success: false, message: "Announcement not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Announcement deleted",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
