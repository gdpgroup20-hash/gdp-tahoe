"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const navLinks = [
  { label: "Elevation Estate", href: "/properties/elevation-estate" },
  { label: "Turquoise", href: "/properties/turquoise" },
  { label: "Journal", href: "/blog" },
  { label: "FAQ", href: "/faq" },
];

interface RecCategory { id: string; name: string; }

function RecommendationsDropdown({ scrolled }: { scrolled: boolean }) {
  const [categories, setCategories] = useState<RecCategory[]>([]);
  const [hover, setHover] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/recommendations")
      .then(r => r.json())
      .then(data => {
        const cats: RecCategory[] = (data || [])
          .map((c: RecCategory) => ({ id: c.id, name: c.name }))
          .sort((a: RecCategory, b: RecCategory) => a.name.localeCompare(b.name));
        setCategories(cats);
      })
      .catch(() => {});
  }, []);

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHover(true);
  };
  const hide = () => {
    timeoutRef.current = setTimeout(() => setHover(false), 150);
  };

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <Link
        href="/recommendations"
        className={cn(
          "flex items-center gap-1 text-sm font-medium tracking-wide transition-colors duration-300 hover:opacity-70",
          scrolled ? "text-[#0f1d3d]" : "text-white/90 hover:text-white"
        )}
      >
        Recommendations
        {categories.length > 0 && <ChevronDown className="h-3 w-3 opacity-60" />}
      </Link>

      {hover && categories.length > 0 && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50">
          <div className="bg-white shadow-xl border border-[#0f1d3d]/10 py-2 min-w-[200px]">
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/recommendations#cat-${cat.id}`}
                className="block px-4 py-2 text-sm text-[#0f1d3d]/80 hover:bg-[#0f1d3d]/5 hover:text-[#0f1d3d] transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="relative z-10">
          <span
            className={cn(
              "text-lg font-semibold tracking-widest uppercase transition-colors duration-300",
              scrolled ? "text-[#0f1d3d]" : "text-white"
            )}
          >
            GDP Tahoe
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium tracking-wide transition-colors duration-300 hover:opacity-70",
                scrolled ? "text-[#0f1d3d]" : "text-white/90 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
          <RecommendationsDropdown scrolled={scrolled} />
          <Link href="/book/elevation-estate">
            <Button
              variant="default"
              size="sm"
              className={cn(
                "tracking-wide uppercase text-xs font-semibold rounded-none px-5 transition-colors duration-300",
                scrolled
                  ? "bg-[#0f1d3d] text-white hover:bg-[#0f1d3d]/90"
                  : "bg-white text-[#0f1d3d] hover:bg-white/90 border-0"
              )}
            >
              Reserve
            </Button>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className={cn(
                "inline-flex items-center justify-center rounded-md p-2 transition-colors hover:bg-accent",
                scrolled ? "text-[#0f1d3d]" : "text-white"
              )}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="text-lg font-semibold tracking-widest uppercase text-[#0f1d3d]">
                  GDP Tahoe
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-4 pt-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block py-3 text-sm font-medium tracking-wide text-[#0f1d3d]/80 transition-colors hover:text-[#0f1d3d] border-b border-border/50"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/recommendations"
                  onClick={() => setOpen(false)}
                  className="block py-3 text-sm font-medium tracking-wide text-[#0f1d3d]/80 transition-colors hover:text-[#0f1d3d] border-b border-border/50"
                >
                  Recommendations
                </Link>
                <Link href="/book/elevation-estate" onClick={() => setOpen(false)} className="mt-6">
                  <Button className="w-full rounded-none bg-[#0f1d3d] text-white text-xs font-semibold uppercase tracking-wide hover:bg-[#0f1d3d]/90">
                    Reserve
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
