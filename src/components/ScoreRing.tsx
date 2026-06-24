import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface ScoreRingProps {
  value: number;          // 0..100
  size?: number;
  stroke?: number;
  label?: string;
  sub?: string;
  gradientFrom?: string;
  gradientTo?: string;
  className?: string;
}

export function ScoreRing({
  value,
  size = 180,
  stroke = 14,
  label,
  sub,
  gradientFrom = "#00FFD4",
  gradientTo = "#5465FF",
  className = "",
}: ScoreRingProps) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  const gid = `ring-grad-${gradientFrom.slice(1)}-${gradientTo.slice(1)}`;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Glow */}
      <div
        className="absolute inset-2 rounded-full blur-2xl opacity-50"
        style={{ background: `radial-gradient(circle, ${gradientFrom}88, transparent 70%)` }}
      />
      <svg ref={ref} width={size} height={size} className="-rotate-90 relative">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={inView ? { strokeDashoffset: offset } : {}}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-semibold tracking-tight tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {value}
          </motion.span>
        </div>
        {label && <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">{label}</div>}
        {sub && <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>}
      </div>
    </div>
  );
}
