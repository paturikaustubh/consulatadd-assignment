import { NextResponse } from "next/server";
import type { ScrapeJob, JobPreview, JobsResponse, Job } from "@/types/jobs";
import { RemoteOKScraper } from "@/scrapers/remoteok";
import { RemotiveScraper } from "@/scrapers/remotive";
import { ArbeitnowScraper } from "@/scrapers/arbeitnow";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const paginatedCache: { [pageSize: number]: { [page: number]: JobsResponse } } =
  {};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.max(
    1,
    parseInt(searchParams.get("pageSize") || "10", 10),
  );
  const refreshHeader = request.headers.get("refresh")?.toLowerCase();

  // If refresh requested, scrape and upsert to DB
  if (refreshHeader === "y") {
    const scrapers = [
      new RemoteOKScraper(),
      new RemotiveScraper(),
      new ArbeitnowScraper(),
    ];

    const settled = await Promise.allSettled(scrapers.map((s) => s.scrape()));

    const collected: ScrapeJob[] = [];
    for (const p of settled) {
      if (p.status === "fulfilled") {
        collected.push(...p.value.jobs);
      }
    }

    const seen = new Set<string>();
    const deduped: ScrapeJob[] = [];
    for (const j of collected) {
      const key =
        j.source && j.job_id
          ? `${j.source}:${j.job_id}`
          : `${j.title}|${j.company}|${j.location}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(j);
      }
    }

    // Filter out jobs that are missing a URL
    const validJobs = deduped.filter((job) => job.url);

    // Upsert into JobData table
    await prisma.$transaction(
      validJobs.map((job) => {
        const job_id = `${job.source}:${job.job_id}`;
        return prisma.jobData.upsert({
          where: { job_id: job_id },
          update: {
            title: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary,
            source: job.source,
            url: job.url as string,
            description: job.description,
          },
          create: {
            job_id: job_id,
            title: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary,
            source: job.source,
            url: job.url as string,
            description: job.description,
          },
        });
      }),
    );

    // Clear all paginated cache entries after a full refresh
    for (const ps in paginatedCache) {
      delete paginatedCache[ps];
    }
  }

  // Check in-memory paginated cache first
  if (paginatedCache[pageSize] && paginatedCache[pageSize][page]) {
    return NextResponse.json(paginatedCache[pageSize][page]);
  }

  // Fetch from DB if not in cache or after refresh
  const totalJobs = await prisma.jobData.count();
  const start = (page - 1) * pageSize;
  const paginatedDbJobs: Job[] = await prisma.jobData.findMany({
    skip: start,
    take: pageSize,
  });

  const paginated: JobPreview[] = paginatedDbJobs.map(
    (job) =>
      ({
        id: job.id,
        job_id: job.job_id,
        title: job.title,
        company: job.company,
        location: job.location.split(","),
        salary: job.salary
          ? isNaN(Number(job.salary))
            ? job.salary
            : Number(job.salary)
          : undefined,
        applied: job.applied,
      }) as JobPreview,
  );

  const allDbJobs = await prisma.jobData.findMany({
    select: {
      title: true,
      location: true,
    },
  });

  const uniqueTitles = Array.from(new Set(allDbJobs.map((j) => j.title))).sort(
    (a, b) => a.localeCompare(b),
  );
  const uniqueLocations = Array.from(
    new Set(allDbJobs.flatMap((j) => j.location.split(","))),
  ).sort((a, b) => a.localeCompare(b));

  const jobTitles = uniqueTitles.map((t) => ({
    id: crypto.randomUUID(),
    label: t,
  }));

  const response: JobsResponse = {
    jobs: paginated,
    totalJobs,
    jobTitles,
    locations: uniqueLocations,
  };

  // Store in paginated cache
  if (!paginatedCache[pageSize]) {
    paginatedCache[pageSize] = {};
  }
  paginatedCache[pageSize][page] = response;

  return NextResponse.json(response);
}
