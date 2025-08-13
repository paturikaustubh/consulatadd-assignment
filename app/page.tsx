import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex bg-background items-center justify-center mt-24">
      <section className="w-full">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h2 className="mb-0">Find Your Dream Job Today!</h2>
            <h6 className="text-muted-foreground">
              CareerJunction: Your job search, simplified.
            </h6>
          </div>

          <div className="mt-24 w-full flex flex-col">
            <h6 className="w-3/4">
              At CareerJunction, we meticulously aggregate job listings from
              trusted platforms, presenting them in one streamlined interface.
              Spend less time searching and more time finding your perfect
              career opportunity, curated just for you.
            </h6>
            <Link href="/jobs" className="ml-auto">
              <Button variant={"default"} className="mt-4 text-2xl p-6">
                <h6>Start Exploring</h6>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
