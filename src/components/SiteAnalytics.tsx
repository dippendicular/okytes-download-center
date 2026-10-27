import { useEffect } from "react";
import { installAnalytics } from "@/lib/analytics";

export function SiteAnalytics() {
  useEffect(() => installAnalytics(), []);
  return null;
}
