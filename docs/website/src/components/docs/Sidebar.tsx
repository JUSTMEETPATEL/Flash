"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sidebarNav = [
  {
    title: "Getting Started",
    items: [
      {
        title: "Introduction",
        href: "/docs",
      },
      {
        title: "Installation",
        href: "/docs/installation",
      },
      {
        title: "Quick Start",
        href: "/docs/quick-start",
      },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      {
        title: "Architecture",
        href: "/docs/architecture",
      },
      {
        title: "Routing",
        href: "/docs/routing",
      },
      {
        title: "Middleware",
        href: "/docs/middleware",
      },
    ],
  },
  {
    title: "API Reference",
    items: [
      {
        title: "Server",
        href: "/docs/api/server",
      },
      {
        title: "Request",
        href: "/docs/api/request",
      },
      {
        title: "Response",
        href: "/docs/api/response",
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-full">
      {sidebarNav.map((section, index) => (
        <div key={index} className="pb-4">
          <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">
            {section.title}
          </h4>
          <div className="grid grid-flow-row auto-rows-max text-sm">
            {section.items.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "group flex w-full items-center rounded-md border border-transparent px-2 py-1.5 hover:underline",
                  pathname === item.href
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
