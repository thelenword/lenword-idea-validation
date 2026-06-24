import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="relative h-9 w-9 rounded-xl flex items-center justify-center bg-white/80 border border-white/80 hover:bg-white dark:bg-white/10 dark:border-white/10 dark:hover:bg-white/20 transition shadow-sm"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <motion.span
        key={isDark ? "moon" : "sun"}
        initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="absolute"
      >
        {isDark ? <Moon className="h-4 w-4 text-cyan-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
      </motion.span>
    </motion.button>
  );
}
