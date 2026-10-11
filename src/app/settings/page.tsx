"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BrandHeader } from "@/components/brand/BrandHeader";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  Shield,
  KeyRound,
  Ban,
  Trash2,
  CheckCircle2,
  Globe,
  Languages,
  Tag,
  AlertTriangle,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "security" | "blocked" | "danger">(
    "profile"
  );

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Blocked users state
  const [blockedUsers, setBlockedUsers] = useState<
    { id: string; blockedUserId: string; username: string; displayName: string; blockedAt: string }[]
  >([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);

  // Account deletion state
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Load blocked users
  const loadBlockedUsers = async () => {
    setLoadingBlocked(true);
    try {
      const res = await fetch("/api/user/blocked");
      if (res.ok) {
        const data = await res.json();
        setBlockedUsers(data.blockedUsers || []);
      }
    } finally {
      setLoadingBlocked(false);
    }
  };

  useEffect(() => {
    if (activeTab === "blocked") {
      loadBlockedUsers();
    }
  }, [activeTab]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const e = err as Error;
      setPasswordError(e.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleUnblock = async (blockedUserId: string) => {
    try {
      await fetch(`/api/user/blocked?userId=${blockedUserId}`, {
        method: "DELETE",
      });
      setBlockedUsers((prev) => prev.filter((u) => u.blockedUserId !== blockedUserId));
    } catch (err) {
      console.error("[UNBLOCK_ERROR]", err);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    setIsDeleting(true);

    try {
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete account");
      }
      await logout();
    } catch (err: unknown) {
      const e = err as Error;
      setDeleteError(e.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col text-slate-100">
      <BrandHeader />

      <main className="max-w-5xl w-full mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Account & Settings</h1>
          <p className="text-sm text-slate-400">
            Manage your personal profile, safety preferences, and privacy settings.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Settings Nav Sidebar */}
          <aside className="w-full md:w-64 shrink-0 flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activeTab === "profile"
                  ? "bg-brand-500/15 border border-brand-500/30 text-brand-300"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile Information</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activeTab === "security"
                  ? "bg-brand-500/15 border border-brand-500/30 text-brand-300"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Password & Security</span>
            </button>

            <button
              onClick={() => setActiveTab("blocked")}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activeTab === "blocked"
                  ? "bg-brand-500/15 border border-brand-500/30 text-brand-300"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <Ban className="w-4 h-4" />
              <span>Blocked Users</span>
            </button>

            <button
              onClick={() => setActiveTab("danger")}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activeTab === "danger"
                  ? "bg-red-500/15 border border-red-500/30 text-red-300"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span className="text-red-300">Delete Account</span>
            </button>
          </aside>

          {/* Tab Content Panes */}
          <div className="flex-1 rounded-3xl bg-[#0c101c]/90 border border-white/10 p-6 sm:p-8 shadow-glass backdrop-blur-xl">
            {/* Tab: Profile */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Your Profile</h3>
                  <p className="text-xs text-slate-400">
                    Your username is unique and verified across InFind.
                  </p>
                </div>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">Username</label>
                    <div className="h-11 px-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm flex items-center font-mono">
                      @{user.username}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">Account Role</label>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-medium border border-brand-500/30">
                      <Shield className="w-3.5 h-3.5" />
                      <span>{user.role}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">Account Status</label>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{user.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Security */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Password & Security</h3>
                  <p className="text-xs text-slate-400">
                    Change your password. Passwords are encrypted with Argon2id.
                  </p>
                </div>

                {passwordSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Your password has been successfully updated.</span>
                  </div>
                )}

                {passwordError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
                    {passwordError}
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <Input
                    label="Current Password"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <Input
                    label="New Password"
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    helperText="Minimum 8 characters"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <Button type="submit" isLoading={isChangingPassword} className="mt-2">
                    Update Password
                  </Button>
                </form>
              </div>
            )}

            {/* Tab: Blocked Users */}
            {activeTab === "blocked" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Blocked Users</h3>
                  <p className="text-xs text-slate-400">
                    Users you have blocked cannot be matched with you in random calls.
                  </p>
                </div>

                {loadingBlocked ? (
                  <div className="py-8 flex justify-center">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : blockedUsers.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-xs">
                    You have not blocked any users.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {blockedUsers.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/10"
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">@{item.username}</div>
                          <div className="text-[11px] text-slate-400">
                            Blocked on {new Date(item.blockedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleUnblock(item.blockedUserId)}
                        >
                          Unblock
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Danger Zone */}
            {activeTab === "danger" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-red-400 mb-1 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Delete Account</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Permanent action. Once deleted, your username, active sessions, and preferences will be permanently wiped.
                  </p>
                </div>

                {deleteError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
                    {deleteError}
                  </div>
                )}

                <form onSubmit={handleDeleteAccount} className="space-y-4 max-w-md">
                  <Input
                    label="Confirm your password to delete account"
                    type="password"
                    required
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter password"
                  />
                  <Button type="submit" variant="danger" isLoading={isDeleting} className="mt-2">
                    Permanently Delete Account
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
