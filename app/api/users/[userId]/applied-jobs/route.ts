import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  _request: NextRequest,
  { params }: { params: { userId: string } },
) {
  const { userId } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { userId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const jobIdQuery = _request.nextUrl.searchParams.get("jobId");

    if (jobIdQuery) {
      const jobId = parseInt(jobIdQuery, 10);
      if (isNaN(jobId)) {
        return NextResponse.json({ error: "Invalid Job ID" }, { status: 400 });
      }

      const appliedJob = await prisma.appliedJob.findUnique({
        where: {
          jobDataId_userId: {
            jobDataId: jobId,
            userId: user.id,
          },
        },
      });
      return NextResponse.json(!!appliedJob); // Return true if applied, false otherwise
    } else {
      // Existing logic to return all applied jobs
      const appliedJobs = await prisma.appliedJob.findMany({
        where: {
          userId: user.id,
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: true,
              location: true,
              salary: true,
            },
          },
        },
      });

      const appliedJobIds = appliedJobs
        .map((applied) => applied.job)
        .map((job) => ({ ...job, location: job.location.split(",") }));
      return NextResponse.json(appliedJobIds);
    }
  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch applied jobs" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const { jobId } = await req.json();
    const { userId } = await params;

    if (!jobId || !userId) {
      return NextResponse.json(
        { error: "jobId and userId are required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const job = await prisma.jobData.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const existingApplied = await prisma.appliedJob.findUnique({
      where: {
        jobDataId_userId: {
          jobDataId: jobId,
          userId: user.id,
        },
      },
    });

    if (existingApplied) {
      return NextResponse.json(
        { error: "Job already marked as applied" },
        { status: 409 },
      );
    }

    const appliedJob = await prisma.appliedJob.create({
      data: {
        userId: user.id,
        jobDataId: job.id,
      },
    });

    return NextResponse.json(appliedJob, { status: 201 });
  } catch (error) {
    console.error("Error marking job as applied:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
