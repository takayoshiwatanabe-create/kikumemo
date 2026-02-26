"use client";

import React from "react";
import { motion } from "framer-motion";

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
  return (
    <motion.ul
      className="list-disc list-inside text-gray-800 dark:text-gray-200 space-y-1"
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


