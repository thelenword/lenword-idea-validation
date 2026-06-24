import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Sparkles, FileText, Brain, X } from "lucide-react";

const actions = [
  { icon: Sparkles, label: "New validation", tint: "from-violet-500 to-fuchsia-500" },
  { icon: FileText, label: "New report",     tint: "from-pink-500 to-rose-500" },
];

export function FloatingActionButton() {
  const navigate = useNavigate();
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <motion.button
        onClick={() => navigate({ to: "/validate" })}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group flex items-center px-4 py-2 rounded-2xl glass-strong shadow-[var(--shadow-elev)] hover:-translate-y-0.5 transition"
        aria-label="New validation"
      >
        <span className="text-sm font-medium">New validation</span>
      </motion.button>
    </div>
  );
}
