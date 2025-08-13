import JobSearch from "@/components/JobSearch";

export default function JobsPage() {
  return (
    <section className="flex-1">
      <h2>Jobs</h2>

      <div className="w-full mt-4 flex flex-col justify-around gap-3 items-center">
        <JobSearch />
      </div>
    </section>
  );
}
