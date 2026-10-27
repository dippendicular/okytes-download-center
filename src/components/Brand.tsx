import { cn } from "@/lib/utils";

/** Theme-specific supplied artwork, sized by the containing span. */
export function Brand({ className = "" }: { className?: string }) {
  return (
    <span className={cn("inline-flex h-10 shrink-0", className)}>
      <img
        src="/images/okytes_logo_dark.png"
        alt="Okytes"
        width={2146}
        height={733}
        className="theme-dark-art h-full w-auto rounded-md object-contain"
      />
      <img
        src="/images/okytes_logo_light.png"
        alt="Okytes"
        width={1254}
        height={428}
        className="theme-light-art h-full w-auto rounded-md object-contain"
      />
    </span>
  );
}
