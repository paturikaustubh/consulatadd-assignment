import Link from "next/link";
import NavProfileButton from "./NavProfileButton";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40  backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/80">
      <div className="flex px-8 py-2 items-center justify-between w-full">
        <Link className="flex items-center space-x-2" href="/">
          <h5 style={{ fontWeight: 700 }}>
            Career<span className="text-[rgb(var(--spl-color))]">Junction</span>
          </h5>
        </Link>
        <nav className="flex items-center gap-6 text-xl">
          <Link
            className="transition-colors hover:text-foreground/80 text-foreground/60"
            href="/jobs"
          >
            Jobs
          </Link>
          <NavProfileButton />
        </nav>
      </div>
    </header>
  );
}
