// src/app/admin/dashboard/page.jsx
import { connection } from "next/server";
import { Suspense } from "react";
import { getDashboardOverview } from "@/services/dashboard";
import Loading from "../Loading";

import DashboardClientView from "@/components/view/DashboardClient";

async function DashboardContent() {
  await connection();
  const dashboardData = await getDashboardOverview();
  return <DashboardClientView data={dashboardData} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardContent />
    </Suspense>
  );
}
