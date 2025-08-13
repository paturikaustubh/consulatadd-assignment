"use client";

import axios from "axios";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import LoadingScreen from "@/components/LoadingScreen";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { JobPreview } from "@/types/jobs";
import JobList from "./JobList";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function JobSearch() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobPreview[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPreview[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPageSize, setSelectedPageSize] = useState(20);
  const [locations, setLocations] = useState<string[]>([]);

  const [filteredJobTitle, setFilteredJobTitle] = useState("");

  const [openLocationSearch, setOpenLocationSearch] = useState(false);
  const [filteredLocation, setFilteredLocation] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
    }
  });

  const fetchJobs = async (refresh: "y" | "n") => {
    try {
      LoadingScreen(true, "Fetching Jobs...");
      const res = await axios.get(
        `/api/jobs?page=${currentPage}&pageSize=${selectedPageSize}`,
        {
          headers: {
            refresh: refresh,
          },
        },
      );
      const data = res.data;
      if (refresh === "y") {
        console.log("y", data);
        setJobs(data.jobs);
        setLocations(data.locations);
        setTotalJobs(data.totalJobs);
      } else {
        console.log("n", data);
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error(error);
    } finally {
      LoadingScreen(false);
    }
  };

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      fetchJobs("y");
      isInitialMount.current = false;
    } else {
      fetchJobs("n");
    }
  }, [currentPage, selectedPageSize]);

  useEffect(() => {
    let updatedJobs = jobs;
    console.log(updatedJobs);

    if (filteredJobTitle) {
      updatedJobs = updatedJobs.filter((job) =>
        job.title
          .toLowerCase()
          .includes(filteredJobTitle.toLowerCase().replace(" ", "-")),
      );
    }

    if (filteredLocation) {
      updatedJobs = updatedJobs.filter((job) =>
        job.location.includes(filteredLocation),
      );
    }

    setFilteredJobs(updatedJobs);
  }, [jobs, filteredJobTitle, filteredLocation]);

  return (
    <>
      <div className="grid grid-cols-6 gap-2 justify-start w-full">
        <div className="lg:col-span-4 md:col-span-4 col-span-6">
          <Input
            placeholder="Search for a job..."
            value={filteredJobTitle}
            onChange={(e) => setFilteredJobTitle(e.target.value)}
          />
        </div>
        <div className="lg:col-span-1 md:col-span-2 col-span-6">
          <Popover
            open={openLocationSearch}
            onOpenChange={setOpenLocationSearch}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openLocationSearch}
                className="w-full justify-between font-normal"
              >
                {filteredLocation
                  ? locations.find((loc) => loc === filteredLocation)
                  : "Select a location"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Search for a location..." />
                <CommandList>
                  <CommandEmpty>No location found.</CommandEmpty>
                  <CommandGroup>
                    {locations &&
                      locations.map((loc) => (
                        <CommandItem
                          key={loc}
                          value={loc}
                          onSelect={(currentValue) => {
                            setFilteredLocation(
                              currentValue === filteredLocation
                                ? ""
                                : currentValue,
                            );
                            setOpenLocationSearch(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              filteredLocation === loc
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {loc}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <Button
          variant={"ghost"}
          size={"icon"}
          className="lg:col-span-1 col-span-6 ml-auto"
          onClick={() => {
            fetchJobs("y");
          }}
        >
          <span className="material-symbols-outlined">autorenew</span>
        </Button>
      </div>

      <JobList
        jobs={filteredJobs}
        currentPage={currentPage}
        totalJobs={totalJobs}
        selectedPageSize={selectedPageSize}
        setCurrentPage={setCurrentPage}
        setSelectedPageSize={setSelectedPageSize}
      />
    </>
  );
}
