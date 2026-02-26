"use client";

import React from "react";
import { motion } from "framer-motion";
import { TodoItem } from "@/types";
import { useI18n, Language } from "@/i18n";
import { cn } from "@/lib/utils";

interface TodoListProps {
  todos: TodoItem[];
  lang: Language;
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

export default function TodoList({ todos, lang }: TodoListProps) {
  const { t } = useI18n();

  const getPriorityClass = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400 font-bold';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <motion.ul
      className="list-disc list-inside text-gray-800 dark:text-gray-200 space-y-2"
      variants={TypewriterVariants}
      initial="hidden"
      animate="visible"
    >
      {todos.map((todo, index) => (
        <motion.li key={index} variants={listItemVariants} className="flex flex-col sm:flex-row sm:items-baseline">
          <span className="font-medium mr-2">{todo.task}</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {todo.assignee && (
              <span className="mr-2">({t("session.assignee")}: {todo.assignee})</span>
            )}
            {todo.deadline && (
              <span className="mr-2">
                {t("session.deadline")}: {new Date(todo.deadline).toLocaleDateString(lang)}
              </span>
            )}
            {todo.priority && (
              <span className={cn("capitalize", getPriorityClass(todo.priority))}>
                {t(`session.priority.${todo.priority}`)}
              </span>
            )}
          </span>
        </motion.li>
      ))}
    </motion.ul>
  );
}


