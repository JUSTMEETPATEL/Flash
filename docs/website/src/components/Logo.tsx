export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

export function LogoText({ className }: { className?: string }) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Logo className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Flash</span>
        </div>
    )
}
