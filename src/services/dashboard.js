// src/services/dashboard.js
import { createClient } from "@/lib/supabase/server";
import { getPageViewStats } from "@/services/analytics";

export async function getDashboardOverview() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    analytics,
    profileRes,
    projectsRes,
    experiencesRes,
    techStacksRes,
    categoriesRes,
  ] = await Promise.all([
    getPageViewStats(),
    user
      ? supabase.from("profile").select("*").eq("id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("projects")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false }),
    supabase
      .from("experiences")
      .select("id, role, company, is_current, updated_at")
      .order("is_current", { ascending: false })
      .order("start_date", { ascending: false }),
    supabase.from("tech_stacks").select("*", { count: "exact", head: true }),
    supabase
      .from("tech_categories")
      .select("*", { count: "exact", head: true }),
  ]);

  const profile = profileRes.data || null;
  const projects = projectsRes.data || [];
  const experiences = experiencesRes.data || [];
  const totalTechStacks = techStacksRes.count || 0;
  const totalCategories = categoriesRes.count || 0;

  const currentRole = experiences.find((exp) => exp.is_current) || null;

  // Portfolio Readiness Checklist
  const checklist = [
    {
      label: "Profile Avatar & Name",
      completed: Boolean(profile?.full_name && profile?.avatar_url),
      href: "/admin/profile",
    },
    {
      label: "About Me Bio",
      completed: Boolean(profile?.about_me?.trim()),
      href: "/admin/profile",
    },
    {
      label: "At Least 1 Project",
      completed: projects.length > 0,
      href: "/admin/projects",
    },
    {
      label: "At Least 1 Work Experience",
      completed: experiences.length > 0,
      href: "/admin/experience",
    },
    {
      label: "Tech Stack Categories & Skills",
      completed: totalCategories > 0 && totalTechStacks > 0,
      href: "/admin/tech-stacks",
    },
  ];

  const completedCount = checklist.filter((item) => item.completed).length;

  return {
    analytics,
    stats: {
      totalViews: analytics.totalViews,
      last7DaysViews: analytics.last7DaysViews,
      totalProjects: projects.length,
      totalExperiences: experiences.length,
      currentRole,
      totalTechStacks,
      totalCategories,
    },
    recentProjects: projects.slice(0, 3),
    checklist,
    readinessPercent: Math.round((completedCount / checklist.length) * 100),
  };
}
