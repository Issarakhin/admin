import { notFound } from "next/navigation";
import {
  isDashboardSection,
  renderDashboardSection,
} from "@/app/components/Dashboard/dashboardSections";

interface DashboardSectionPageProps {
  params: Promise<{
    section: string;
  }>;
}

export default async function DashboardSectionPage({
  params,
}: DashboardSectionPageProps) {
  const resolvedParams = await params;

  if (!isDashboardSection(resolvedParams.section)) {
    notFound();
  }

  return renderDashboardSection(resolvedParams.section);
}
