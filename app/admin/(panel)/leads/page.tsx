import { Suspense } from "react";
import { LeadsManager } from "@/components/admin/LeadsManager";

export const metadata = { title: "Leads" };

export default function LeadsPage() {
  return (
    <Suspense>
      <LeadsManager />
    </Suspense>
  );
}
