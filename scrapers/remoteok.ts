import type { ScrapeJob, ScraperResult } from "@/types/jobs";
import { toStr, parseSalary } from "./utils";

export class RemoteOKScraper {
  private endpoint = "https://remoteok.com/api";

  public async scrape(): Promise<ScraperResult> {
    try {
      const res = await fetch(this.endpoint, {
        headers: { "User-Agent": "job-scraper/1.0" },
      });
      if (!res.ok) return { jobs: [], totalJobs: 0 };
      const json = (await res.json()) as unknown;

      if (!Array.isArray(json)) return { jobs: [], totalJobs: 0 };

      const items = json.filter((it) => {
        return (
          it !== null &&
          typeof it === "object" &&
          ("company" in (it as object) ||
            "position" in (it as object) ||
            "title" in (it as object))
        );
      }) as Array<Record<string, unknown>>;

      const jobs: ScrapeJob[] = items.map((it) => {
        const job_id =
          toStr(it.id) ||
          toStr(it.slug) ||
          (typeof it === "object" ? crypto.randomUUID() : crypto.randomUUID());
        const title = toStr(it.position || it.title || it.tagline || "");
        const company = toStr(it.company || it.company_name || "");
        const location = toStr(it.location || "Remote");
        const img = toStr(it.company_logo || it.logo || "") || undefined;
        const minSalary = parseSalary(it.salary_min as number);
        const maxSalary = parseSalary(it.salary_max as number);
        const salary =
          (minSalary || maxSalary) !== "Not Disclosed"
            ? minSalary + " - " + maxSalary
            : "Not Disclosed";
        const url = toStr(it.url || "");
        const description = toStr(it.description || "");

        return {
          job_id,
          title,
          company,
          location,
          source: "remoteok",
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
