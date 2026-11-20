// src/services/analytics.js
import { createClient } from "@/lib/supabase/server";

export async function insertPageViewRecord(viewData) {
  const supabase = await createClient();

  const { error } = await supabase.from("page_views").insert(viewData);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getPageViewStats() {
  const supabase = await createClient();

  // Calculate date 7 days ago (start of day)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Run total count and recent 7-day rows fetch in parallel
  const [totalResult, recentResult] = await Promise.all([
    supabase.from("page_views").select("*", { count: "exact", head: true }),
    supabase
      .from("page_views")
      .select("referrer, device_type, created_at")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: true }),
  ]);

  const totalViews = totalResult.count || 0;
  const recentRows = recentResult.data || [];

  // Build a 7-day daily bucket array: [{ date: "Nov 14", count: 3 }, ...]
  const dailyMap = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(sevenDaysAgo.getDate() + i);
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    dailyMap[label] = 0;
  }

  const referrerCounts = {};
  let mobileCount = 0;
  let desktopCount = 0;

  recentRows.forEach((row) => {
    const label = new Date(row.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (dailyMap[label] !== undefined) {
      dailyMap[label] += 1;
    }

    const ref = row.referrer || "Direct";
    referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;

    if (row.device_type === "mobile") mobileCount += 1;
    else desktopCount += 1;
  });

  const dailyViews = Object.entries(dailyMap).map(([date, count]) => ({
    date,
    count,
  }));

  const topReferrers = Object.entries(referrerCounts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalViews,
    last7DaysViews: recentRows.length,
    dailyViews,
    topReferrers,
    devices: {
      mobile: mobileCount,
      desktop: desktopCount,
    },
  };
}
