"use client";

import React, { useState } from "react";
import { Dialog } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { MatchingFilters } from "@/lib/validations";
import { Globe, Languages, Tag, X, Plus } from "lucide-react";

interface MatchingFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: MatchingFilters;
  onSaveFilters: (filters: MatchingFilters) => void;
}

const POPULAR_COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "JP", name: "Japan" },
];

const POPULAR_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "hi", name: "Hindi" },
  { code: "pt", name: "Portuguese" },
];

export const MatchingFilterModal: React.FC<MatchingFilterModalProps> = ({
  isOpen,
  onClose,
  currentFilters,
  onSaveFilters,
}) => {
  const [countries, setCountries] = useState<string[]>(currentFilters.preferredCountries || []);
  const [languages, setLanguages] = useState<string[]>(currentFilters.preferredLanguages || []);
  const [interests, setInterests] = useState<string[]>(currentFilters.interests || []);
  const [newInterestInput, setNewInterestInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const toggleCountry = (code: string) => {
    setCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleLanguage = (code: string) => {
    setLanguages((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]
    );
  };

  const addInterest = () => {
    const trimmed = newInterestInput.trim().toLowerCase();
    if (trimmed && !interests.includes(trimmed) && interests.length < 10) {
      setInterests([...interests, trimmed]);
      setNewInterestInput("");
    }
  };

  const removeInterest = (item: string) => {
    setInterests(interests.filter((i) => i !== item));
  };

  const handleReset = () => {
    setCountries([]);
    setLanguages([]);
    setInterests([]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const updated: MatchingFilters = {
      preferredCountries: countries,
      preferredLanguages: languages,
      interests,
    };

    try {
      await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      onSaveFilters(updated);
      onClose();
    } catch (err) {
      console.error("[SAVE_FILTERS_ERROR]", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Matching Filters & Preferences"
      description="Refine who you meet. When filters are selected, InFind prioritizes matches with matching preferences."
    >
      <div className="space-y-5 text-sm">
        {/* Preferred Countries */}
        <div>
          <div className="flex items-center gap-2 mb-2 font-medium text-slate-200">
            <Globe className="w-4 h-4 text-brand-400" />
            <span>Country Preference</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_COUNTRIES.map((c) => {
              const active = countries.includes(c.code);
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => toggleCountry(c.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    active
                      ? "bg-brand-500/20 border-brand-500 text-brand-300"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferred Languages */}
        <div>
          <div className="flex items-center gap-2 mb-2 font-medium text-slate-200">
            <Languages className="w-4 h-4 text-brand-400" />
            <span>Languages</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_LANGUAGES.map((l) => {
              const active = languages.includes(l.code);
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => toggleLanguage(l.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    active
                      ? "bg-brand-500/20 border-brand-500 text-brand-300"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {l.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interests */}
        <div>
          <div className="flex items-center gap-2 mb-2 font-medium text-slate-200">
            <Tag className="w-4 h-4 text-brand-400" />
            <span>Topics & Interests</span>
          </div>

          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newInterestInput}
              onChange={(e) => setNewInterestInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addInterest();
                }
              }}
              placeholder="e.g. gaming, tech, cinema..."
              className="flex-1 h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={addInterest}
              disabled={!newInterestInput.trim()}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-[32px]">
            {interests.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-brand-500/15 border border-brand-500/30 text-xs text-brand-300"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeInterest(tag)}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {interests.length === 0 && (
              <span className="text-xs text-slate-500 italic">No interests added yet</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
            Reset All
          </Button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
            >
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
