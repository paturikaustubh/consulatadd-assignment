"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NavProfileButton() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      setUserId(userId);
    } else {
      setUserId(null);
    }
  }, []);

  return userId ? (
    <Link
      className="transition-colors hover:text-foreground/80 text-foreground/60"
      href="/profile"
    >
      Profile
    </Link>
  ) : (
    <Link
      className="transition-colors hover:text-foreground/80 text-foreground/60"
      href="/login"
    >
      Login
    </Link>
  );
}
