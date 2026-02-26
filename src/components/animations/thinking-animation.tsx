"use client";

import React from "react";
import { motion } from "framer-motion";

interface ThinkingAnimationProps {
  text: string;
  className?: string;
}

const ThinkingVariants = {
  initial: { y: 20, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

export default function ThinkingAnimation({ text, className }: ThinkingAnimationProps) {
  return (
    <motion.p
      className={className}
      initial="initial"
      animate="animate"
      variants={ThinkingVariants}
    >
      {text}
    </motion.p>
  );
}


