import type { ScraperResult, ScrapeJob } from "@/types/jobs";
import { toStr, parseSalary } from "./utils";

export class RemotiveScraper {
  private endpoint = "https://remotive.com/api/remote-jobs";

  public async scrape(): Promise<ScraperResult> {
    try {
      const res = await fetch(this.endpoint, {
        headers: { "User-Agent": "job-scraper/1.0" },
      });
      if (!res.ok) return { jobs: [], totalJobs: 0 };
      const json = (await res.json()) as unknown;

      // remotive: { jobs: [...] }
      const jobsArr = Array.isArray((json as any)?.jobs)
        ? ((json as any).jobs as unknown[])
        : [];

      const jobs: ScrapeJob[] = jobsArr.map((itRaw) => {
        const it = (itRaw ?? {}) as Record<string, unknown>;
        const job_id = toStr(it.id) || toStr(it.guid) || crypto.randomUUID();
        const title = toStr(it.title || "");
        const company = toStr(it.company_name || it.company || "");
        const location = toStr(it.candidate_required_location || "Remote");
        const img = toStr(it.company_logo || "") || undefined;
        const salary = parseSalary(it.salary as string);
        const url = toStr(it.url || "");
        const description = toStr(it.description || "");

        return {
          job_id,
          title,
          company,
          location,
          source: "remotive",
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
