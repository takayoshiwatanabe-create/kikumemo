"use client";

import React from "react";
import { motion } from "framer-motion";

interface DecisionsListProps {
  decisions: string[];
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

export default function DecisionsList({ decisions }: DecisionsListProps) {
  return (
    <motion.ul
      className="list-disc list-inside text-gray-800 dark:text-gray-200 space-y-1"
      variants={TypewriterVariants}
      initial="hidden"
      animate="visible"
    >
      {decisions.map((decision, index) => (
        <motion.li key={index} variants={listItemVariants}>
          {decision}
        </motion.li>
      ))}
    </motion.ul>
  );
}

