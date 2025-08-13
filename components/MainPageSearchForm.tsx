"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MainPageSearchForm() {
  return (
    <form className="flex space-x-2" onSubmit={(e) => e.preventDefault()}>
      <Input placeholder="Job title, keywords, or company" type="search" />
      <Button type="submit">Search</Button>
    </form>
  );
}
