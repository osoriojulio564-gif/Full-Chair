import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { salonName, firstName, lastName, email, phone, password } = await req.json();
    if (!salonName || !firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const existing = await prisma.staffMember.findFirst({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const slug = salonName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);

    const salon = await prisma.salon.create({
      data: { name: salonName, slug, email, phone },
    });

    const hashed = await hashPassword(password);
    const staff = await prisma.staffMember.create({
      data: { salonId: salon.id, email, password: hashed, firstName, lastName, phone, role: "OWNER" },
    });

    const days = [1, 2, 3, 4, 5, 6];
    await Promise.all(
      days.map((d) =>
        prisma.staffSchedule.create({
          data: { staffId: staff.id, dayOfWeek: d, startTime: "09:00", endTime: "18:00" },
        })
      )
    );

    const token = createToken({ id: staff.id, email, firstName, lastName, role: "OWNER", salonId: salon.id });
    const response = NextResponse.json({ success: true });
    response.cookies.set("session-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
