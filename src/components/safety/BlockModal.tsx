"use client";

import React, { useState } from "react";
import { Dialog } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Ban } from "lucide-react";

interface BlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockedUserId: string | null;
  blockedUsername: string | null;
  onBlockSuccess: () => void;
}

export const BlockModal: React.FC<BlockModalProps> = ({
  isOpen,
  onClose,
  blockedUserId,
  blockedUsername,
  onBlockSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmBlock = async () => {
    if (!blockedUserId) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/safety/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockedUserId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to block user");
      }

      onBlockSuccess();
      onClose();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to block user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Block @${blockedUsername || "Stranger"}?`}
      description="This will end your current conversation immediately. You will never be matched with this user again."
    >
      <div className="space-y-4 text-sm">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
            {error}
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed">
          <p>
            Blocking is permanent until you manually remove them from your{" "}
            <span className="text-brand-300 font-medium">Settings &rarr; Blocked Users</span> list.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleConfirmBlock}
            isLoading={isSubmitting}
            className="gap-1.5"
          >
            <Ban className="w-4 h-4" />
            Block & Disconnect
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
