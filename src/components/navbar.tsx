"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
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
