export interface JobPreview {
  id: number;
  job_id: string;
  title: string;
  company: string;
  location: string[];
  salary: string | "Not Disclosed";
  applied: boolean;
}

export interface JobsResponse {
  jobs: JobPreview[];
  totalJobs: number;
  jobTitles: { id: string; label: string }[];
  locations: string[];
}

export interface Job {
  id: number;
  job_id: string;
  title: string;
  company: string;
  salary: string | "Not Disclosed";
  source: string;
  description: string;
  location: string;
  url: string;
}

export interface ScrapeJob {
  job_id: string;
  title: string;
  company: string;
  salary: string | "Not Disclosed";
  source: string;
  description: string;
  location: string;
  url: string;
}

export type ScraperResult = {
  jobs: ScrapeJob[];
  totalJobs: number;
};
