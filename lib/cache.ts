import type { JobPreview } from "@/types/jobs";

type CacheValue = {
  data: JobPreview[];
  timestamp: number;
};

class SimpleInMemoryCache {
  private map = new Map<string, CacheValue>();

  get(key: string, ttlMs: number): JobPreview[] | null {
    const v = this.map.get(key);
    if (!v) return null;
    if (Date.now() - v.timestamp > ttlMs) {
      this.map.delete(key);
      return null;
    }
    return v.data;
  }

  set(key: string, data: JobPreview[]) {
    this.map.set(key, { data, timestamp: Date.now() });
  }

  del(key: string) {
    this.map.delete(key);
  }

  clear() {
    this.map.clear();
  }
}

export const cache = new SimpleInMemoryCache();
