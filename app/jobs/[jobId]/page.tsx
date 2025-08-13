"use client";

import Loading from "@/components/LoadingScreen";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Job } from "@/types/jobs";
import axios from "axios";
import { useLayoutEffect } from "react";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

export default function JobDetails({ params }: { params: { jobId: string } }) {
  const [jobDetails, setJobDetails] = useState<Job | null>(null);
  const [applied, setApplied] = useState(false);

  useLayoutEffect(() => {
    Loading(true);
    try {
      const fetchJob = async () => {
        const { jobId } = await params;
        const job = await axios.get(`/api/jobs/${jobId}`, {
          params: {
            userId: localStorage.getItem("userId"),
          },
        });
        setJobDetails(job.data);
        setApplied(job.data.isApplied);
      };
      fetchJob();
    } catch (error) {
      console.error("Error fetching job details:", error);
    } finally {
      Loading(false);
    }
  }, [params]);

  const handleApply = async (jobId: number) => {
    try {
      const userId = localStorage.getItem("userId");
      await axios.post(`/api/users/${userId}/applied-jobs`, { jobId });
      setApplied(true);
    } catch (error) {
      if (error.status === 409) {
        toast.error("Job already applied!", {
          position: "top-center",
        });
      }
      console.error("Error applying to job:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-12">
      <div className="container mx-auto">
        {jobDetails && (
          <Card>
            <CardHeader>
              <CardTitle>
                <h6 className="text-xl font-bold">{jobDetails.title}</h6>
                <p className="text-muted-foreground">{jobDetails.company}</p>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <p>{jobDetails.salary}</p>
              <p className="flex gap-2 items-center">
                <span className="material-symbols-outlined">location_on</span>
                {jobDetails.location}
              </p>
              <div className="flex flex-col gap-4 mt-8">
                <h6>Job Description</h6>
                <span
                  dangerouslySetInnerHTML={{
                    __html: jobDetails.description,
                  }}
                ></span>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 justify-end w-full">
              {jobDetails.url && (
                <Link href={jobDetails.url} target="_blank">
                  <Button variant={"outline"}>View Job</Button>
                </Link>
              )}
              <Button
                onClick={() => handleApply(jobDetails.id)}
                disabled={applied}
              >
                {applied ? "Applied" : "Apply"}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
