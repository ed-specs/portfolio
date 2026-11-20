// src/components/dashboard/DashboardClientView.jsx
"use client";

import Link from "next/link";
import {
  Eye,
  FolderKanban,
  Briefcase,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Monitor,
  Smartphone,
} from "lucide-react";
import HeaderSection from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";

export default function DashboardClientView({ data }) {
  const { analytics, stats, recentProjects, checklist, readinessPercent } =
    data;

  // Find highest daily count so bar heights scale proportionally (minimum 1 to avoid 0/0)
  const maxDailyCount = Math.max(
    ...analytics.dailyViews.map((d) => d.count),
    1,
  );

  const totalRecentDeviceViews =
    analytics.devices.mobile + analytics.devices.desktop;
  const mobilePercent =
    totalRecentDeviceViews > 0
      ? Math.round((analytics.devices.mobile / totalRecentDeviceViews) * 100)
      : 0;
  const desktopPercent = totalRecentDeviceViews > 0 ? 100 - mobilePercent : 0;

  return (
    <div className="lg:relative min-h-svh md:min-h-screen w-full flex flex-col lg:flex-row">
      <HeaderSection />
      <Sidebar />

      <div className="flex flex-1 flex-col gap-6 p-5">
        {/* Top Header + Live Portfolio Link */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold">Dashboard.</h1>
            <span className="text-gray-500 text-sm">
              Overview of your portfolio performance and content.
            </span>
          </div>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center justify-center gap-1.5 border border-gray-300 rounded-lg px-3.5 py-2 text-xs font-medium bg-white hover:border-black/90 transition-colors duration-300 w-fit"
          >
            <span>View Live Portfolio</span>
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        {/* 1. Top 4 KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Total Portfolio Views */}
          <div className="bg-black/90 text-white rounded-lg border border-gray-600 p-5 flex flex-col gap-2 hover:border-black/90 transition-colors duration-300">
            <div className="flex items-center justify-between text-gray-300">
              <span className="text-xs font-medium">Portfolio Views</span>
              <Eye className="size-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{stats.totalViews}</span>
              <span className="text-xs text-gray-300">
                (+{stats.last7DaysViews} this week)
              </span>
            </div>
          </div>

          {/* Total Projects */}
          <Link
            href="/admin/projects"
            className="rounded-lg border border-gray-300 p-5 flex flex-col gap-2 hover:border-black/90 transition-colors duration-300"
          >
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-medium">Projects</span>
              <FolderKanban className="size-4" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">{stats.totalProjects}</span>
              <span className="text-xs text-gray-400">Manage &rarr;</span>
            </div>
          </Link>

          {/* Work Experience */}
          <Link
            href="/admin/experience"
            className="rounded-lg border border-gray-300 p-5 flex flex-col gap-2 hover:border-black/90 transition-colors duration-300"
          >
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-medium">Work Experience</span>
              <Briefcase className="size-4" />
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl font-bold">
                {stats.totalExperiences}
              </span>
              <span className="text-xs text-gray-400 truncate">
                {stats.currentRole
                  ? `Active: ${stats.currentRole.company}`
                  : "Manage →"}
              </span>
            </div>
          </Link>

          {/* Tech Stacks */}
          <Link
            href="/admin/tech-stacks"
            className="rounded-lg border border-gray-300 p-5 flex flex-col gap-2 hover:border-black/90 transition-colors duration-300"
          >
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-medium">Tech Stacks</span>
              <Layers className="size-4" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">
                {stats.totalTechStacks}
              </span>
              <span className="text-xs text-gray-400">
                Across {stats.totalCategories}{" "}
                {stats.totalCategories === 1 ? "category" : "categories"}
              </span>
            </div>
          </Link>
        </div>

        {/* 2. Visitor Traffic Chart + Top Referrers & Devices */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 7-Day Daily Views Bar Chart */}
          <div className="lg:col-span-2 rounded-lg border border-gray-300 p-5 flex flex-col justify-between gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold">
                  Visitor Traffic (Last 7 Days)
                </h2>
                <p className="text-xs text-gray-500">
                  Anonymous unique browser-session views
                </p>
              </div>
              <span className="text-xs font-medium border border-gray-300 rounded-md px-2.5 py-1">
                {stats.last7DaysViews} views
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2 items-end h-40 pt-4">
              {analytics.dailyViews.map((day) => {
                const heightPercent = Math.round(
                  (day.count / maxDailyCount) * 100,
                );
                return (
                  <div
                    key={day.date}
                    className="flex flex-col items-center gap-2 h-full justify-end"
                  >
                    <span className="text-[11px] font-medium text-gray-600">
                      {day.count}
                    </span>
                    <div className="w-full max-w-10 bg-gray-100 rounded-md h-24 flex items-end overflow-hidden">
                      <div
                        style={{
                          height: `${day.count > 0 ? Math.max(heightPercent, 8) : 0}%`,
                        }}
                        className="w-full bg-black/90 rounded-md transition-all duration-500"
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 text-center">
                      {day.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Traffic Sources & Device Split */}
          <div className="rounded-lg border border-gray-300 p-5 flex flex-col justify-between gap-5">
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-bold">Top Traffic Sources (7d)</h2>
              {analytics.topReferrers.length === 0 ? (
                <p className="text-xs text-gray-400 italic">
                  No visitor traffic recorded in the last 7 days yet.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {analytics.topReferrers.map((ref) => (
                    <div
                      key={ref.source}
                      className="flex items-center justify-between text-xs border-b border-gray-100 pb-1.5"
                    >
                      <span className="text-gray-700 truncate max-w-44">
                        {ref.source}
                      </span>
                      <span className="font-semibold">{ref.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-3 border-t border-gray-200">
              <span className="text-xs font-bold">Device Breakdown (7d)</span>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span className="inline-flex items-center gap-1.5">
                  <Monitor className="size-3.5" /> Desktop: {desktopPercent}%
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Smartphone className="size-3.5" /> Mobile: {mobilePercent}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Portfolio Readiness Checklist + Recent Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Portfolio Completeness Checklist */}
          <div className="rounded-lg border border-gray-300 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold">Portfolio Readiness</h2>
                <p className="text-xs text-gray-500">
                  Complete all sections before sharing your link
                </p>
              </div>
              <span className="text-xs font-bold border border-gray-300 rounded-md px-2.5 py-1">
                {readinessPercent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${readinessPercent}%` }}
                className="h-full bg-black/90 transition-all duration-500"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              {checklist.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between text-xs p-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {item.completed ? (
                      <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                    ) : (
                      <Circle className="size-4 text-gray-400 shrink-0" />
                    )}
                    <span
                      className={
                        item.completed
                          ? "text-gray-500 line-through"
                          : "text-gray-800 font-medium"
                      }
                    >
                      {item.label}
                    </span>
                  </div>
                  <span className="text-gray-400">
                    {item.completed ? "Done" : "Setup →"}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recently Updated Projects + Quick Actions */}
          <div className="rounded-lg border border-gray-300 p-5 flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold">Recently Updated Projects</h2>
                <Link
                  href="/admin/projects"
                  className="text-xs text-gray-500 hover:text-black/90"
                >
                  View all
                </Link>
              </div>

              {recentProjects.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-4">
                  No projects created yet.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2.5 text-xs"
                    >
                      <span className="font-medium truncate">
                        {project.title}
                      </span>
                      <span className="text-gray-400 shrink-0">
                        {new Date(project.updated_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
              <Link
                href="/admin/projects"
                className="text-xs border border-gray-300 rounded-md px-3 py-1.5 hover:border-black/90 transition-colors"
              >
                + Projects
              </Link>
              <Link
                href="/admin/experience"
                className="text-xs border border-gray-300 rounded-md px-3 py-1.5 hover:border-black/90 transition-colors"
              >
                + Experience
              </Link>
              <Link
                href="/admin/tech-stacks"
                className="text-xs border border-gray-300 rounded-md px-3 py-1.5 hover:border-black/90 transition-colors"
              >
                + Tech Stack
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
