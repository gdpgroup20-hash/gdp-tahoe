"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryModalProps {
  images: string[];
  propertyName: string;
}

export function GalleryModal({ images, propertyName }: GalleryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setViewerIndex(null);
  }, []);

  const closeViewer = useCallback(() => {
    setViewerIndex(null);
  }, []);

  const goNext = useCallback(() => {
    setViewerIndex((prev) =>
      prev !== null ? (prev + 1) % images.length : null
    );
  }, [images.length]);

  const goPrev = useCallback(() => {
    setViewerIndex((prev) =>
      prev !== null ? (prev - 1 + images.length) % images.length : null
    );
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (viewerIndex !== null) {
          setViewerIndex(null);
        } else {
          setIsOpen(false);
        }
      }
      if (viewerIndex !== null) {
        if (e.key === "ArrowRight") setViewerIndex((p) => p !== null ? (p + 1) % images.length : null);
        if (e.key === "ArrowLeft") setViewerIndex((p) => p !== null ? (p - 1 + images.length) % images.length : null);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, viewerIndex, images.length]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0f1d3d] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0f1d3d]/85"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        View all {images.length} photos
      </button>

      {/* Grid Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#0a0f1a]/95">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between px-6 py-4">
            <p className="text-sm font-medium text-white/70">
              {propertyName} &mdash; {images.length} photos
            </p>
            <button
              onClick={closeModal}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable grid */}
          <div className="flex-1 overflow-y-auto px-4 pb-8 sm:px-8 lg:px-16">
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 sm:gap-3">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setViewerIndex(i)}
                  className="group relative aspect-[4/3] overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  <Image
                    src={src}
                    alt={`${propertyName} — photo ${i + 1}`}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full-screen single image viewer */}
      {viewerIndex !== null && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95">
          {/* Close */}
          <button
            onClick={closeViewer}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Counter */}
          <div className="absolute left-4 top-4 z-10 text-sm text-white/50">
            {viewerIndex + 1} / {images.length}
          </div>

          {/* Prev */}
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Next */}
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Image */}
          <div className="relative h-[85vh] w-[90vw]">
            <Image
              src={images[viewerIndex]}
              alt={`${propertyName} — photo ${viewerIndex + 1}`}
              fill
              unoptimized
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
