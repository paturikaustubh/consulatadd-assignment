import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  _request: Request,
  { params }: { params: { userId: string } },
) {
  const { userId } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { userId: userId },
      include: {
        favJobs: {
          select: {
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
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const favJobIds = user.favJobs
      .map((fav) => fav.job)
      .map((job) => ({ ...job, location: job.location.split(",") }));
    return NextResponse.json(favJobIds);
  } catch (error) {
    console.error("Error fetching favorite jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorite jobs" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
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

    const existingFav = await prisma.favJob.findUnique({
      where: {
        jobDataId_userId: {
          jobDataId: jobId,
          userId: user.id,
        },
      },
    });

    if (existingFav) {
      return NextResponse.json(
        { error: "Job already in favorites" },
        { status: 409 },
      );
    }

    const favJob = await prisma.favJob.create({
      data: {
        userId: user.id,
        jobDataId: job.id,
      },
    });

    return NextResponse.json(favJob, { status: 201 });
  } catch (error) {
    console.error("Error creating favorite job:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
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

    const favJob = await prisma.favJob.findUnique({
      where: {
        jobDataId_userId: {
          jobDataId: jobId,
          userId: user.id,
        },
      },
    });

    if (!favJob) {
      return NextResponse.json(
        { error: "Favorite job not found" },
        { status: 404 },
      );
    }

    await prisma.favJob.delete({
      where: {
        id: favJob.id,
      },
    });

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error("Error deleting favorite job:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
