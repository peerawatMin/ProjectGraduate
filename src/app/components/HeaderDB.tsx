/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Bell, MoreVertical } from "lucide-react";
import { useAuth } from "../../hooks/useAuth"; // ← ปรับพาธตามตำแหน่งไฟล์ของคุณ

const HeaderDB = () => {
  const { user: authUser, loading, logout } = useAuth();

  // fallback เผื่อยังไม่มีข้อมูลผู้ใช้ (เช่นก่อนโหลด profile เสร็จ)
  const fallbackUser = {
    id: "guest",
    name: "Guest",
    email: "guest@example.com",
    avatar: "/boy.png",
    role: "visitor",
  };

  const currentUser = authUser ?? fallbackUser;

  // สร้างชื่อที่จะแสดง: first+last > name > email
  const displayName =
    (("firstName" in currentUser && currentUser.firstName) ||
      ("lastName" in currentUser && currentUser.lastName))
      ? `${(currentUser as any).firstName ?? ""} ${(currentUser as any).lastName ?? ""}`.trim()
      : currentUser.name || currentUser.email;

  const avatarSrc = currentUser.avatar || "/boy.png";

  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => {
      if (showUserMenu) setShowUserMenu(false);
    };
    if (showUserMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showUserMenu]);

  const handleUserMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUserMenu((v) => !v);
  };

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    logout?.(); // ← logout จาก useAuth
    setShowUserMenu(false);
  };

  return (
    <header className="mt-4 mb-2 mx-4 sm:mx-6 lg:mx-8 rounded-lg border border-gray-200 shadow-lg bg-gradient-to-tr from-indigo-800 to-sky-600">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 flex items-center justify-between rounded-md">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">
          แดชบอร์ด
        </h1>

        <div className="flex items-center space-x-4">
          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-md p-2 text-gray-200 hover:text-white transition-colors"
          >
            <Bell className="h-5 w-5" />
          </button>

          {/* User */}
          <div className="relative">
            <button
              type="button"
              onClick={handleUserMenuClick}
              className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-indigo-700/40"
            >
              {/* avatar / skeleton */}
              {loading ? (
                <div className="h-8 w-8 rounded-full bg-white/30 animate-pulse" />
              ) : avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt="User Avatar"
                  width={32}
                  height={32}
                  className="rounded-full border border-gray-200"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-400">
                  <span className="text-sm font-medium text-white">
                    {displayName?.charAt(0) ?? "G"}
                  </span>
                </div>
              )}

              <span className="hidden sm:block text-sm font-medium text-white">
                {loading ? "กำลังโหลด..." : displayName}
              </span>
              <MoreVertical className="h-4 w-4 text-white" />
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border border-gray-200 bg-gradient-to-tr from-indigo-800 via-blue-700 to-sky-600 text-white shadow-lg overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-200 bg-gradient-to-tr from-indigo-800 via-blue-700 to-sky-600">
                  <div className="font-medium">
                    {loading ? "กำลังโหลด..." : displayName}
                  </div>
                  {!loading && currentUser.email && (
                    <div className="text-sm text-gray-300">{currentUser.email}</div>
                  )}
                  {"role" in currentUser && currentUser.role && (
                    <div className="text-xs font-medium capitalize mt-1 text-yellow-600">
                      {currentUser.role}
                    </div>
                  )}
                </div>

                {/* Log out รวมใน dropdown */}
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full text-left px-3 py-2 text-sm transition-colors hover:bg-red-600 hover:text-white text-red-600 flex items-center gap-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderDB;
