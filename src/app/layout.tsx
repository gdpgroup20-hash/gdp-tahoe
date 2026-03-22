import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { headers } from "next/headers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "GDP Tahoe | Luxury Lake Tahoe Vacation Rentals — Direct Booking",
  description:
    "Book direct and save. GDP Tahoe offers two private luxury vacation rentals on the North Shore of Lake Tahoe — Elevation Estate (7BR lakefront villa with private pier) and Turquoise Tavern (3BR, steps from the beach). No service fees.",
  keywords: [
    "luxury vacation rental Lake Tahoe",
    "North Lake Tahoe vacation rental",
    "Carnelian Bay vacation rental",
    "lakefront rental Lake Tahoe",
    "Elevation Estate Tahoe",
    "Turquoise Tavern Tahoe",
    "private pier Lake Tahoe rental",
    "direct booking Lake Tahoe",
    "Agate Bay vacation rental",
  ],
  openGraph: {
    title: "GDP Tahoe | Luxury Lake Tahoe Vacation Rentals",
    description:
      "Two private luxury properties on the North Shore of Lake Tahoe. Book direct and save — no Airbnb fees.",
    url: "https://www.staygdptahoe.com",
    siteName: "GDP Tahoe",
    images: [
      {
        url: "https://www.staygdptahoe.com/images/elevation/e6ecf408-354c-4c00-9227-7d55280bd66b.jpeg",
        width: 1200,
        height: 800,
        alt: "Elevation Estate — Luxury Lakefront Villa, Lake Tahoe",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GDP Tahoe | Luxury Lake Tahoe Vacation Rentals",
    description: "Two private luxury properties on the North Shore. Book direct and save.",
    images: ["https://www.staygdptahoe.com/images/elevation/e6ecf408-354c-4c00-9227-7d55280bd66b.jpeg"],
  },
  alternates: {
    canonical: "https://www.staygdptahoe.com",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className="antialiased">
        {!isAdmin && <Navbar />}
        <main className="min-h-screen">{children}</main>
        {!isAdmin && <Footer />}
      </body>
    </html>
  );
}
