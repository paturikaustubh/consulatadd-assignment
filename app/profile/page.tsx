"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import JobList from "@/components/JobList";
import { JobPreview } from "@/types/jobs";
import { Button } from "@/components/ui/button";
import Loading from "@/components/LoadingScreen";

export default function Profile() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [jobs, setJobs] = useState<JobPreview[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPageSize, setSelectedPageSize] = useState(20);
  const [totalJobs, setTotalJobs] = useState(0);
  const [appliedJobs, setAppliedJobs] = useState<JobPreview[]>([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
    }
  });

  const getAccountData = async (userId: string) => {
    axios
      .get(`/api/users/${userId}/profile`)
      .then((res) => {
        setUsername(res.data.username);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const getFavJobs = async (userId: string) => {
    axios
      .get(`/api/users/${userId}/fav-jobs`)
      .then((res) => {
        setJobs(res.data);
        setTotalJobs(res.data.length);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        Loading(false);
      });
  };

  const getAppliedJobs = async (userId: string) => {
    axios
      .get(`/api/users/${userId}/applied-jobs`)
      .then((res) => {
        setAppliedJobs(res.data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        Loading(false);
      });
  };

  useEffect(() => {
    Loading(true, "Fetching Profile...");
    const userId = localStorage.getItem("userId");
    getAccountData(userId as string);
    getFavJobs(userId as string);
    getAppliedJobs(userId as string);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    router.push("/login");
  };

  const handleExportCsv = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
      return;
    }

    try {
      const response = await axios.get(
        `/api/users/${userId}/applied-jobs/export-csv`,
        {
          responseType: "blob", // Important for downloading files
        },
      );

      const contentDisposition = response.headers["content-disposition"];
      let filename = "applied_jobs.csv"; // Default filename
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Create a blob from the response data
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename); // Set the download filename
      document.body.appendChild(link);
      link.click(); // Simulate click
      document.body.removeChild(link); // Clean up
      window.URL.revokeObjectURL(url); // Free up memory
    } catch (error) {
      console.error("Error exporting CSV:", error);
      // Optionally, show an error message to the user
    }
  };

  return (
    <section className="flex-1">
      <h2>Profile</h2>
      {username && (
        <div className="flex justify-between items-center">
          <h4>Welcome {username}!</h4>
        </div>
      )}

      <div className="grid md:grid-cols-2 grid-cols-1 mt-16 gap-8">
        <div className="col-span-2">
          <h5>Favorite Jobs</h5>
          {jobs.length > 0 ? (
            <JobList
              jobs={jobs}
              currentPage={currentPage}
              totalJobs={totalJobs}
              selectedPageSize={selectedPageSize}
              setCurrentPage={setCurrentPage}
              setSelectedPageSize={setSelectedPageSize}
              paramFavoritedJobIds={jobs.map((job) => job.id)}
              paramAppliedJobIds={appliedJobs.map((job) => job.id)}
            />
          ) : (
            <h6 className="text-muted-foreground flex place-content-center py-12">
              No favorites yet...
            </h6>
          )}
        </div>
        <div className="col-span-2">
          <div className="flex justify-between items-center">
            <h5>Applied Jobs</h5>
            {appliedJobs.length > 0 && (
              <Button variant={"default"} onClick={handleExportCsv}>
                Export (CSV)
              </Button>
            )}
          </div>
          {appliedJobs.length > 0 ? (
            <JobList
              jobs={appliedJobs}
              currentPage={currentPage}
              totalJobs={totalJobs}
              selectedPageSize={selectedPageSize}
              setCurrentPage={setCurrentPage}
              setSelectedPageSize={setSelectedPageSize}
              paramFavoritedJobIds={jobs.map((job) => job.id)}
              paramAppliedJobIds={appliedJobs.map((job) => job.id)}
            />
          ) : (
            <h6 className="text-muted-foreground flex place-content-center py-12">
              No applied jobs yet...
            </h6>
          )}
        </div>
      </div>

      <div className="w-full flex mt-16 justify-end">
        <Button variant={"destructive"} onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </section>
  );
}
