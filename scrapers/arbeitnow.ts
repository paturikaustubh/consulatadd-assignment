import type { ScrapeJob, ScraperResult } from "@/types/jobs";
import { toStr, parseSalary } from "./utils";

export class ArbeitnowScraper {
  private endpoints = [
    "https://arbeitnow.com/api/job-board-api",
    "https://www.arbeitnow.com/api/job-board-api",
    "https://arbeitnow.com/api/jobs",
    "https://www.arbeitnow.com/api/jobs",
  ];

  public async scrape(): Promise<ScraperResult> {
    try {
      let data: unknown = null;
      for (const url of this.endpoints) {
        try {
          const res = await fetch(url, {
            headers: { "User-Agent": "job-scraper/1.0" },
          });
          if (!res.ok) continue;
          data = await res.json();
          if (data != null) break;
        } catch {
          // try next
        }
      }

      if (!data) return { jobs: [], totalJobs: 0 };

      // endpoints vary: sometimes {data: [...]}, sometimes array
      const items: unknown[] = Array.isArray(data)
        ? (data as unknown[])
        : Array.isArray((data as any).data)
          ? (data as any).data
          : Array.isArray((data as any).jobs)
            ? (data as any).jobs
            : [];

      const jobs: ScrapeJob[] = items.map((itRaw) => {
        const it = (itRaw ?? {}) as Record<string, unknown>;
        const job_id = toStr(it.id) || toStr(it.slug) || crypto.randomUUID();
        const title = toStr(it.title || it.position || "");
        const company = toStr(it.company || it.company_name || "");
        const location = toStr(it.location);
        const img = toStr(it.logo || "") || undefined;
        const salary = "Not Disclosed";
        const url = toStr(it.url || "");
        const description = toStr(it.description || "");

        return {
          job_id,
          title,
          company,
          location,
          source: "arbeitnow",
          salary,
          img,
          url,
          description,
        } as ScrapeJob;
      });

      return { jobs, totalJobs: jobs.length };
    } catch {
      return { jobs: [], totalJobs: 0 };
    }
  }
}
