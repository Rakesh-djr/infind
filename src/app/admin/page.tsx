"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BrandHeader } from "@/components/brand/BrandHeader";
import { Button } from "@/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Ban,
  RotateCcw,
} from "lucide-react";

interface ReportItem {
  id: string;
  category: string;
  description: string | null;
  status: string;
  createdAt: string;
  reporter: { id: string; username: string; displayName: string };
  reported: { id: string; username: string; displayName: string; status: string };
  moderator?: { id: string; username: string } | null;
  resolutionNotes?: string | null;
}

interface UserItem {
  id: string;
  username: string;
  displayName: string;
  role: string;
  status: string;
  suspensionReason?: string | null;
  suspendedUntil?: string | null;
  createdAt: string;
  _count: {
    reportsReceived: number;
    blocksReceived: number;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"reports" | "users">("reports");
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportFilter, setReportFilter] = useState<string>("PENDING");

  // User management state
  const [searchQuery, setSearchQuery] = useState("");
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Check admin authorization
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        router.push("/login");
      } else if (user.role !== "ADMIN" && user.role !== "MODERATOR") {
        router.push("/chat");
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const loadReports = useCallback(async () => {
    setLoadingReports(true);
    try {
      const url = reportFilter
        ? `/api/admin/reports?status=${reportFilter}`
        : "/api/admin/reports";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } finally {
      setLoadingReports(false);
    }
  }, [reportFilter]);

  useEffect(() => {
    if (user && (user.role === "ADMIN" || user.role === "MODERATOR")) {
      loadReports();
    }
  }, [loadReports, user]);

  const handleResolveReport = async (reportId: string, status: "RESOLVED" | "DISMISSED") => {
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          status,
          resolutionNotes: `Processed by @${user?.username}`,
        }),
      });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
        setActionSuccess(`Report ${reportId.slice(0, 8)} marked as ${status}`);
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      console.error("[REPORT_ACTION_ERROR]", err);
    }
  };

  const handleSearchUsers = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoadingUsers(true);
    try {
      const res = await fetch(`/api/admin/users?query=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUserAction = async (targetUserId: string, action: "SUSPEND" | "BAN" | "REINSTATE") => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId,
          action,
          reason: `Admin enforcement by @${user?.username}`,
          durationDays: 7,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess(`User status updated to ${data.status}`);
        setTimeout(() => setActionSuccess(null), 3000);
        handleSearchUsers();
      } else {
        alert(data.error || "Action failed");
      }
    } catch (err) {
      console.error("[USER_ACTION_ERROR]", err);
    }
  };

  if (authLoading || !user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col text-slate-100">
      <BrandHeader />

      <main className="max-w-7xl w-full mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-6 h-6 text-brand-400" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Moderation & Safety Console
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Review incident reports, take disciplinary actions, and protect the InFind community.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === "reports" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setActiveTab("reports")}
              className="gap-1.5"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Report Queue</span>
            </Button>
            <Button
              variant={activeTab === "users" ? "primary" : "secondary"}
              size="sm"
              onClick={() => {
                setActiveTab("users");
                handleSearchUsers();
              }}
              className="gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>User Search</span>
            </Button>
          </div>
        </div>

        {actionSuccess && (
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Tab: Reports Queue */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              {["PENDING", "RESOLVED", "DISMISSED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setReportFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    reportFilter === status
                      ? "bg-brand-500/20 border-brand-500 text-brand-300"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {loadingReports ? (
              <div className="py-16 flex justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
              </div>
            ) : reports.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm rounded-3xl bg-[#0c101c] border border-white/10 p-8">
                <CheckCircle2 className="w-10 h-10 text-emerald-400/80 mx-auto mb-2" />
                No {reportFilter.toLowerCase()} reports in queue. The platform is clean!
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-5 rounded-2xl bg-[#0c101c]/90 border border-white/10 shadow-glass flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {report.category}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(report.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-sm font-medium text-white">
                        Reported User:{" "}
                        <span className="text-red-400 font-bold">@{report.reported.username}</span>{" "}
                        (Status: {report.reported.status}) &bull; Reporter:{" "}
                        <span className="text-slate-300">@{report.reporter.username}</span>
                      </div>

                      {report.description && (
                        <p className="text-xs text-slate-300 bg-white/5 p-2.5 rounded-xl border border-white/5">
                          &ldquo;{report.description}&rdquo;
                        </p>
                      )}
                    </div>

                    {report.status === "PENDING" && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleResolveReport(report.id, "RESOLVED")}
                        >
                          Resolve & Sanction
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleResolveReport(report.id, "DISMISSED")}
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Users Management */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <form onSubmit={handleSearchUsers} className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user by username..."
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
              <Button type="submit" size="md" isLoading={loadingUsers}>
                Search
              </Button>
            </form>

            {loadingUsers ? (
              <div className="py-16 flex justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
              </div>
            ) : usersList.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm rounded-3xl bg-[#0c101c] border border-white/10 p-8">
                No users found. Try searching for a different username.
              </div>
            ) : (
              <div className="space-y-3">
                {usersList.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-[#0c101c]/90 border border-white/10 shadow-glass flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-base">@{item.username}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            item.status === "ACTIVE"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : item.status === "SUSPENDED"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              : "bg-red-500/20 text-red-300 border-red-500/30"
                          }`}
                        >
                          {item.status}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-slate-300">
                          {item.role}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400">
                        Reports received: <span className="text-amber-400 font-semibold">{item._count.reportsReceived}</span> &bull; Blocks received: <span className="text-slate-300 font-semibold">{item._count.blocksReceived}</span>
                      </div>
                      {item.suspendedUntil && (
                        <div className="text-xs text-amber-400 mt-1">
                          Suspended until {new Date(item.suspendedUntil).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {user.role === "ADMIN" && (
                      <div className="flex items-center gap-2 shrink-0">
                        {item.status === "ACTIVE" && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleUserAction(item.id, "SUSPEND")}
                            >
                              Suspend (7d)
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleUserAction(item.id, "BAN")}
                            >
                              <Ban className="w-3.5 h-3.5 mr-1" />
                              Ban User
                            </Button>
                          </>
                        )}
                        {(item.status === "BANNED" || item.status === "SUSPENDED") && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleUserAction(item.id, "REINSTATE")}
                            className="text-emerald-300 hover:text-emerald-200"
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1" />
                            Reinstate
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
