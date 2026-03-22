import Link from "next/link";
import { Instagram, Mail, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = [
  { label: "Properties", href: "/properties" },
  { label: "Book", href: "/book" },
  { label: "Contact", href: "/contact" },
];

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "Email", href: "mailto:hello@gdptahoe.com", icon: Mail },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-[#0f1d3d] text-white/80">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <span className="text-lg font-semibold tracking-widest uppercase text-white">
              GDP Tahoe
            </span>
            <div className="flex items-center gap-2 text-sm text-white/50">
              <MapPin className="size-3.5" />
              <span>Lake Tahoe, California</span>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Navigate
            </span>
            <nav className="flex flex-col gap-2.5">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Connect
            </span>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-white/50 transition-colors hover:text-white"
                >
                  <social.icon className="size-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-10 bg-white/10" />

        <div className="flex items-center justify-between">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} GDP Tahoe. All rights reserved.
          </p>
          <Link
            href="/admin"
            className="text-xs text-white/20 transition-colors hover:text-white/50"
          >
            Owner Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}
