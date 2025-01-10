import { getDashboardData } from "@/actions/dashboard";
import Dashboard from "@/components/analytics/MainDashboard";
import React from "react";
import { dashboard } from "./dashboard.schema";

export default async function AdminDashboard() {
  const data = await getDashboardData();

  return (
    <div className="p-4">
      <Dashboard dashboard={data as dashboard} />
    </div>
  );
}
