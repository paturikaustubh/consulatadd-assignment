import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server"; // Added import

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest, // Changed Request to NextRequest
  { params }: { params: { jobId: string } },
) {
  const { jobId } = await params;
  const jobIdInt = parseInt(jobId);

  if (isNaN(jobIdInt)) {
    return NextResponse.json({ error: "Invalid Job ID" }, { status: 400 });
  }

  try {
    const job = await prisma.jobData.findUnique({
      where: {
        id: jobIdInt,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    let isApplied = false;
    const userIdQuery = request.nextUrl.searchParams.get("userId");

    if (userIdQuery) {
      const user = await prisma.user.findUnique({
        where: { userId: userIdQuery },
      });

      if (user) {
        const appliedJob = await prisma.appliedJob.findUnique({
          where: {
            jobDataId_userId: {
              jobDataId: jobIdInt,
              userId: user.id,
            },
          },
        });
        isApplied = !!appliedJob;
      }
    }

    return NextResponse.json({ ...job, isApplied });
  } catch (error) {
    console.error("Error fetching job details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
