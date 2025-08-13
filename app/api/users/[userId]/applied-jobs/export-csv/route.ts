import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server"; // Added import

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest, // Changed Request to NextRequest
  context: { params: { userId: string } },
) {
  const { userId } = await context.params;
  try {
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const appliedJobs = await prisma.appliedJob.findMany({
      where: {
        userId: user.id,
      },
      include: {
        job: true,
      },
    });

    if (appliedJobs.length === 0) {
      return NextResponse.json(
        { message: "No applied jobs to export" },
        { status: 200 },
      );
    }

    const headers = [
      "Job ID",
      "Title",
      "Company",
      "Location",
      "Salary",
      "Source",
      "URL",
      "Description",
      "Applied At",
    ];

    const escapeCsvField = (
      field: string | number | null | undefined,
    ): string => {
      if (field === null || field === undefined) {
        return '""';
      }
      let stringField = String(field);
      stringField = stringField.replace(/"/g, '""');
      if (
        stringField.includes(",") ||
        stringField.includes("\n") ||
        stringField.includes("\r") ||
        stringField.includes('"')
      ) {
        return `"${stringField}"`;
      }
      return stringField;
    };

    const csvRows = appliedJobs.map((appliedJob) => {
      const job = appliedJob.job;
      return [
        escapeCsvField(job.job_id),
        escapeCsvField(job.title),
        escapeCsvField(job.company),
        escapeCsvField(job.location),
        escapeCsvField(job.salary),
        escapeCsvField(job.source),
        escapeCsvField(job.url),
        escapeCsvField(job.description),
        escapeCsvField(
          appliedJob.createdAt
            ? new Date(appliedJob.createdAt).toLocaleDateString()
            : "",
        ),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="applied_jobs_${userId}_${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting applied jobs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
