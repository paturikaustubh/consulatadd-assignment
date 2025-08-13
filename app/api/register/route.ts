import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const saltRounds = 10;

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  try {
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
    return NextResponse.json({ userId: newUser.userId });
  } catch {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }
}
