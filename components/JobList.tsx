"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { JobPreview } from "@/types/jobs";
import { Heart } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import JobPagination from "./JobPagination";
import { Button } from "./ui/button";
import axios from "axios";
import Link from "next/link";

interface JobListProps {
  jobs: JobPreview[];
  currentPage: number;
  totalJobs: number;
  selectedPageSize: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  setSelectedPageSize: Dispatch<SetStateAction<number>>;
  paramFavoritedJobIds?: number[];
  paramAppliedJobIds?: number[];
}

export default function JobList({
  jobs: initialJobs,
  currentPage,
  totalJobs,
  selectedPageSize,
  setCurrentPage,
  setSelectedPageSize,
  paramFavoritedJobIds,
  paramAppliedJobIds,
}: JobListProps) {
  console.log(initialJobs);
  const [favoritedJobIds, setFavoritedJobIds] = useState<number[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const fetchFavoritedJobs = async () => {
      try {
        if (paramFavoritedJobIds) {
          setFavoritedJobIds(paramFavoritedJobIds);
          return;
        }
        const response = await axios.get(`/api/users/${userId}/fav-jobs`);
        setFavoritedJobIds(response.data.map((job: JobPreview) => job.id));
      } catch (error) {
        console.error("Error fetching favorited jobs:", error);
      }
    };

    const fetchAppliedJobs = async () => {
      try {
        if (paramAppliedJobIds) {
          setAppliedJobIds(paramAppliedJobIds);
          return;
        }
        const response = await axios.get(`/api/users/${userId}/applied-jobs`);
        setAppliedJobIds(response.data.map((job: JobPreview) => job.id));
      } catch (error) {
        console.error("Error fetching applied jobs:", error);
      }
    };

    fetchFavoritedJobs();
    fetchAppliedJobs();
  }, [paramFavoritedJobIds, paramAppliedJobIds]);

  const handleFavoriteToggle = async (jobId: number) => {
    try {
      const userId = localStorage.getItem("userId");
      if (favoritedJobIds.includes(jobId)) {
        await axios.delete(`/api/users/${userId}/fav-jobs`, {
          data: { jobId },
        });
        setFavoritedJobIds((prev) => prev.filter((id) => id !== jobId));
        return;
      }
      await axios.post(`/api/users/${userId}/fav-jobs`, {
        jobId,
      });
      setFavoritedJobIds((prev) =>
        prev.includes(jobId)
          ? prev.filter((id) => id !== jobId)
          : [...prev, jobId],
      );
    } catch (error) {
      console.error("Error toggling favorite status:", error);
    }
  };

  const handleApply = async (jobId: number) => {
    try {
      const userId = localStorage.getItem("userId");
      await axios.post(`/api/users/${userId}/applied-jobs`, { jobId });
      setAppliedJobIds((prev) => [...prev, jobId]);
    } catch (error) {
      console.error("Error applying to job:", error);
    }
  };

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-4 w-full">
        {initialJobs.map((job) => (
          <Card
            key={job.id}
            className="hover:border-[rgb(var(--spl-color))] hover:bg-[rgb(var(--spl-color))]/6 duration-200 border-2 relative"
          >
            <div className="absolute top-2 right-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleFavoriteToggle(job.id)}
              >
                <Heart
                  className={
                    "h-4 w-4 " +
                    (favoritedJobIds.includes(job.id)
                      ? "fill-[rgb(var(--spl-color))] text-[rgb(var(--spl-color))]"
                      : "")
                  }
                />
              </Button>
            </div>
            <CardHeader>
              <CardTitle className="text-[rgb(var(--spl-color))] text-xl">
                <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                <CardDescription>{job.company}</CardDescription>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <p className="flex flex-wrap gap-1">
                {job.location.slice(0, 1).map((loc, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300"
                  >
                    {loc}
                  </span>
                ))}
                {job.location.length > 1 && (
                  <Tooltip>
                    <TooltipTrigger className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">
                      +{job.location.length - 1}
                    </TooltipTrigger>
                    <TooltipContent>
                      {job.location.slice(1).join(", ")}
                    </TooltipContent>
                  </Tooltip>
                )}
              </p>
              <span>{job.salary}</span>
            </CardContent>
            <CardFooter className="flex justify-end items-center mt-auto">
              <Button
                onClick={() => handleApply(job.id)}
                disabled={appliedJobIds.includes(job.id)}
              >
                {appliedJobIds.includes(job.id) ? "Applied" : "Apply"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <JobPagination
        currentPage={currentPage}
        totalJobs={totalJobs}
        selectedPageSize={selectedPageSize}
        setCurrentPage={setCurrentPage}
        setSelectedPageSize={setSelectedPageSize}
      />
    </>
  );
}
