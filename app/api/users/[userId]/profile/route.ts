import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  _request: Request,
  { params }: { params: { userId: string } },
) {
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        userId: userId,
      },
      select: {
        username: true,
      },
    });
    return NextResponse.json({ username: user?.username });
  } catch {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
}
