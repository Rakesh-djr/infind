"use client";

import React, { useState } from "react";
import { Dialog } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUserId: string | null;
  reportedUsername: string | null;
  matchSessionId: string | null;
  onReportSuccess: () => void;
}

const REPORT_CATEGORIES = [
  { id: "INAPPROPRIATE_BEHAVIOR", label: "Inappropriate Behavior or Nudity" },
  { id: "HARASSMENT", label: "Harassment or Bullying" },
  { id: "THREATS", label: "Violence or Threats" },
  { id: "SPAM", label: "Spam, Scams, or Advertising" },
  { id: "IMPERSONATION", label: "Impersonation or False Identity" },
  { id: "OTHER", label: "Other Policy Violation" },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reportedUserId,
  reportedUsername,
  matchSessionId,
  onReportSuccess,
}) => {
  const [category, setCategory] = useState("INAPPROPRIATE_BEHAVIOR");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportedUserId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/safety/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedUserId,
          matchSessionId: matchSessionId || undefined,
          category,
          description: description.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit report");
      }

      setSubmitted(true);
      setTimeout(() => {
        onReportSuccess();
        onClose();
        setSubmitted(false);
        setDescription("");
      }, 1500);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={submitted ? "Report Submitted" : `Report @${reportedUsername || "Stranger"}`}
      description={
        submitted
          ? "Thank you for keeping InFind safe. Our moderation team will investigate this incident immediately."
          : "Reports are confidential. Select a category that best describes the policy violation."
      }
    >
      {submitted ? (
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3 animate-fade-in" />
          <p className="text-sm font-medium text-white">Report successfully recorded.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Reason for Report
            </label>
            <div className="space-y-1.5">
              {REPORT_CATEGORIES.map((cat) => (
                <label
                  key={cat.id}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    category === cat.id
                      ? "bg-brand-500/15 border-brand-500 text-white"
                      : "bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="reportCategory"
                    value={cat.id}
                    checked={category === cat.id}
                    onChange={() => setCategory(cat.id)}
                    className="accent-brand-500"
                  />
                  <span className="text-xs font-medium">{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Optional Details (what happened?)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Provide any additional context for our safety team..."
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={isSubmitting}
              className="gap-1.5"
            >
              <ShieldAlert className="w-4 h-4" />
              Submit Report
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
};
