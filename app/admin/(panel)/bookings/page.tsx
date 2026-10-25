import { Suspense } from "react";
import { LeadsManager } from "@/components/admin/LeadsManager";

export const metadata = { title: "Bookings" };

export default function BookingsPage() {
  return (
    <Suspense>
      <LeadsManager mode="bookings" />
    </Suspense>
  );
}
