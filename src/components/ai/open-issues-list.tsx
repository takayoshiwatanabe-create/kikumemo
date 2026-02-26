"use client";

import React from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n"; // Import useI18n

interface OpenIssuesListProps {
  issues: string[];
}

const TypewriterVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export default function OpenIssuesList({ issues }: OpenIssuesListProps) {
  const { isRTL } = useI18n(); // Use isRTL from i18n context

  return (
    <motion.ul
      className={`list-disc list-inside text-gray-800 dark:text-gray-200 space-y-1 ${isRTL ? "text-right" : "text-left"}`} // Apply RTL class
      variants={TypewriterVariants}
      initial="hidden"
      animate="visible"
    >
      {issues.map((issue, index) => (
        <motion.li key={index} variants={listItemVariants}>
          {issue}
        </motion.li>
      ))}
    </motion.ul>
  );
}

