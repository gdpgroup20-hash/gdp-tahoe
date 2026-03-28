"use client";

import { useState } from "react";
import { X, MessageSquare, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface InquiryModalProps {
  propertyName: string;
  propertySlug: string;
}

export function InquiryModal({ propertyName, propertySlug }: InquiryModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !phone || !message) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message, propertyName, propertySlug }),
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
    } catch {
      setError("Something went wrong. Please email us directly at gdpgroup20@gmail.com");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setSent(false);
      setName(""); setEmail(""); setPhone(""); setMessage(""); setError("");
    }, 300);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 border border-[#0f1d3d]/30 text-[#0f1d3d] text-sm font-medium tracking-wide hover:bg-[#0f1d3d]/5 transition-colors rounded-none"
      >
        <MessageSquare className="h-4 w-4" />
        Message Owner
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-md bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#0f1d3d]/10 px-6 py-4">
              <div>
                <h2 className="text-lg font-medium text-[#0f1d3d]">Message Owner</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{propertyName}</p>
              </div>
              <button onClick={handleClose} className="text-[#0f1d3d]/40 hover:text-[#0f1d3d] transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              {sent ? (
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                    <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-[#0f1d3d]">Message Sent</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    We typically respond within the hour. Check your inbox for a reply from gdpgroup20@gmail.com.
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-6 w-full py-3 bg-[#0f1d3d] text-white text-sm font-medium hover:bg-[#0f1d3d]/90 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="inq-name" className="text-xs">Your Name</Label>
                    <Input
                      id="inq-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Smith"
                      className="rounded-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="inq-email" className="text-xs">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="inq-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="rounded-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="inq-phone" className="text-xs">
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="inq-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="rounded-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="inq-message" className="text-xs">
                      What can we help you with? <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="inq-message"
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Dates you're considering, questions about the property, special requests..."
                      rows={4}
                      className="rounded-none resize-none"
                    />
                  </div>

                  {error && (
                    <p className="text-xs text-red-600">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !email || !phone || !message}
                    className="w-full py-3 bg-[#0f1d3d] text-white text-sm font-medium hover:bg-[#0f1d3d]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                  <p className="text-center text-xs text-muted-foreground">
                    We typically respond within the hour
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
