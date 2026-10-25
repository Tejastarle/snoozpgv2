"use client";
import { useEffect } from "react";
import { track } from "@/lib/analytics";
import { SuccessMark } from "./EnquiryForm";

export function ThankYouMark() {
  useEffect(() => {
    track("thank_you_view", { page: "/thank-you" });
  }, []);
  return (
    <div className="scale-125">
      <SuccessMark light />
    </div>
  );
}
