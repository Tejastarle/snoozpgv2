"use client";
import { motion } from "framer-motion";
import { useEffect } from "react";

let firstLoad = true;

/** Page transition — a short, quiet fade between routes (skipped on the very first load so content paints immediately). */
export default function Template({ children }: { children: React.ReactNode }) {
  const initial = firstLoad ? false : { opacity: 0, y: 12 };
  useEffect(() => {
    firstLoad = false;
  }, []);
  return (
    <motion.div initial={initial} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}
