"use client";

import { useState } from "react";

interface Contact {
  id: string;
  name: string;
  phone: string;
  role: string;
}

interface Vendor {
  id: string;
  companyName: string;
  website: string;
  notes: string;
  contacts: Contact[];
}

function formatPhone(phone: string) {
  return phone.replace(/[^\d+()-\s]/g, "").trim();
}

function vendorWebsiteUrl(website: string) {
  if (!website) return "";
  return website.startsWith("http") ? website : `https://${website}`;
}

const NOTES_CHAR_LIMIT = 140;

export function VendorCard({ vendor }: { vendor: Vendor }) {
  const [expanded, setExpanded] = useState(false);
  const isTruncatable = vendor.notes.length > NOTES_CHAR_LIMIT;
  const displayNotes = !isTruncatable || expanded
    ? vendor.notes
    : vendor.notes.slice(0, NOTES_CHAR_LIMIT).trimEnd() + "…";

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow duration-200 hover:shadow-md flex flex-col"
      style={{ minHeight: "220px" }}
    >
      {/* Company name */}
      <h3 className="text-lg font-semibold text-[#0f1d3d] leading-tight">
        {vendor.companyName}
      </h3>

      {/* Notes / description */}
      {vendor.notes && (
        <div className="mt-3 flex-1">
          <p className="text-sm text-gray-600 leading-relaxed">
            {displayNotes}
          </p>
          {isTruncatable && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 text-xs font-medium text-[#0f1d3d]/60 hover:text-[#0f1d3d] transition-colors underline underline-offset-2"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      {/* Contacts — phone numbers + trail links */}
      {vendor.contacts.some((c) => c.phone || c.role?.startsWith("http")) && (
        <div className="mt-4 space-y-1.5">
          {vendor.contacts.map((contact) => {
            const isLink = contact.role?.startsWith("http");
            if (isLink) {
              return (
                <div key={contact.id}>
                  <a
                    href={contact.role}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-[#0f1d3d]/70 hover:text-[#0f1d3d] underline underline-offset-2 transition-colors"
                  >
                    🗺️ {contact.name}
                  </a>
                </div>
              );
            }
            if (!contact.phone) return null;
            return (
              <div key={contact.id} className="flex items-center gap-2 text-sm">
                <span className="text-gray-400 text-xs">📞</span>
                <a
                  href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                  className="text-[#0f1d3d]/80 hover:text-[#0f1d3d] transition-colors"
                >
                  {contact.name !== vendor.companyName && (
                    <span className="text-gray-500">{contact.name}: </span>
                  )}
                  {formatPhone(contact.phone)}
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Website button */}
      {vendor.website && (
        <a
          href={vendorWebsiteUrl(vendor.website)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#0f1d3d] border border-[#0f1d3d]/20 rounded px-4 py-2 transition-colors hover:bg-[#0f1d3d] hover:text-white self-start"
        >
          Visit Website <span aria-hidden="true">&rarr;</span>
        </a>
      )}
    </div>
  );
}
