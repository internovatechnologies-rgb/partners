"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";

const NETWORK_OPTIONS = ["1–5", "6–15", "16–30", "31–50", "50+"];

const inputClass =
  "w-full rounded-lg border border-black/[0.12] bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-[#9a9691] focus:border-brand focus-visible:ring-2 focus-visible:ring-brand/30";
const labelClass = "mb-1.5 block text-[14px] font-medium text-ink";

type Status = "idle" | "loading" | "success" | "error";

export function PartnerApplicationForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    if (
      !String(data.name || "").trim() ||
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(data.email || ""))
    ) {
      setError("Please add your name and a valid email.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/partner-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      form.reset();
    } catch {
      setError("Something went wrong. Please try again or email us directly.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12.5L10 17.5L19 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h3 className="font-display text-[22px] font-semibold text-ink">
          Application received
        </h3>
        <p className="max-w-[380px] text-[15px] leading-[1.5] text-[#57534d]">
          Thanks for your interest. We&rsquo;ll review and get back to you within
          2 business days with your partner agreement and a link to book a
          kickoff call.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-black/[0.06] bg-white p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="pa-name" className={labelClass}>
            Full name
          </label>
          <input id="pa-name" name="name" type="text" required className={inputClass} placeholder="Jordan Rivera" />
        </div>
        <div>
          <label htmlFor="pa-company" className={labelClass}>
            Consultancy / company
          </label>
          <input id="pa-company" name="company" type="text" className={inputClass} placeholder="Rivera Compliance Advisory" />
        </div>
        <div>
          <label htmlFor="pa-email" className={labelClass}>
            Email
          </label>
          <input id="pa-email" name="email" type="email" required className={inputClass} placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="pa-network" className={labelClass}>
            Facilities in your network
          </label>
          <select id="pa-network" name="network" defaultValue="" className={inputClass}>
            <option value="" disabled>
              Select a range
            </option>
            {NETWORK_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o} facilities
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="pa-message" className={labelClass}>
          Anything you&rsquo;d like us to know <span className="font-normal text-[#9a9691]">(optional)</span>
        </label>
        <textarea id="pa-message" name="message" rows={3} className={inputClass} placeholder="Tell us a bit about the facilities you work with…" />
      </div>

      {status === "error" && (
        <p role="alert" className="mt-4 text-[14px] text-[#c0342b]">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          variant="brand"
          size="lg"
          disabled={status === "loading"}
          className="w-full sm:w-auto"
        >
          {status === "loading" ? "Sending…" : "Apply to the partner program"}
        </Button>
        <p className="text-[13px] leading-[1.4] text-[#57534d]">
          No cost to apply · we review every application personally.
        </p>
      </div>
    </form>
  );
}
