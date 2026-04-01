"use client";

type LogoProps = {
  size?: number;
  variant?: "light" | "dark";
};

export function Logo({ size = 32, variant = "light" }: LogoProps) {
  const strokeColor = variant === "light" ? "#ffffff" : "#0F141B";

  return (
    <div style={{ width: size, height: size }} className="relative shrink-0">
      <div className="absolute inset-0 rounded-full bg-accent opacity-20 blur-md" />
      <svg
        viewBox="0 0 24 24"
        className="relative z-10 h-full w-full"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 20L12 4L19 20" stroke={strokeColor} strokeWidth={1.75} opacity={0.5} />
        <path d="M12 20V10" stroke={strokeColor} strokeWidth={2} />
        <path d="M8.5 14h7" stroke="var(--accent)" strokeWidth={2.5} />
        <circle cx="12" cy="4" r="1.25" fill="var(--accent)" />
      </svg>
    </div>
  );
}
