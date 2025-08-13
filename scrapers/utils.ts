export function toStr(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return "";
}

export function parseSalary(salary: number | string): string {
  if (typeof salary === "number") {
    if (salary === 0) return "Not Disclosed";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(salary);
  }

  return salary;
}
