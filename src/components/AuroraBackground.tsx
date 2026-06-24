export function AuroraBackground({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full blur-3xl opacity-70 animate-aurora"
        style={{ background: "radial-gradient(circle, var(--aurora-1) 0%, transparent 60%)" }} />
      <div className="absolute top-10 right-[-10rem] h-[40rem] w-[40rem] rounded-full blur-3xl opacity-60 animate-aurora"
        style={{ background: "radial-gradient(circle, var(--aurora-2) 0%, transparent 60%)", animationDelay: "-6s" }} />
      <div className="absolute bottom-[-12rem] left-1/3 h-[34rem] w-[34rem] rounded-full blur-3xl opacity-60 animate-aurora"
        style={{ background: "radial-gradient(circle, var(--aurora-3) 0%, transparent 60%)", animationDelay: "-3s" }} />
      <div className="absolute inset-0"
        style={{ backgroundImage: "radial-gradient(var(--dot-grid-color) 1px, transparent 1px)", backgroundSize: "22px 22px", maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)" }} />
    </div>
  );
}
