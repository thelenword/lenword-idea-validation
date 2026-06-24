import { motion } from "framer-motion";

export function AnimatedBlobs({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {/* Mesh gradient base */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(at 18% 18%, var(--blob-mesh-1) 0px, transparent 55%)," +
            "radial-gradient(at 82% 12%, var(--blob-mesh-2) 0px, transparent 55%)," +
            "radial-gradient(at 70% 75%, var(--blob-mesh-3) 0px, transparent 55%)," +
            "radial-gradient(at 8% 85%, var(--blob-mesh-4) 0px, transparent 55%)",
        }}
      />

      {/* Morphing SVG blob 1 */}
      <svg className="absolute -top-32 -left-24 h-[44rem] w-[44rem] blur-3xl opacity-60" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="blob-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--blob-a-from)" />
            <stop offset="100%" stopColor="var(--blob-a-to)" />
          </linearGradient>
        </defs>
        <motion.path
          fill="url(#blob-a)"
          animate={{
            d: [
              "M44.4,-66.2C56.1,-58.1,62.6,-42.3,67.4,-26.7C72.2,-11,75.3,4.5,71.4,18.3C67.4,32.2,56.5,44.5,43.4,53.8C30.4,63.1,15.2,69.4,-0.8,70.5C-16.8,71.7,-33.6,67.7,-46.2,58C-58.8,48.3,-67.2,32.9,-69.8,16.7C-72.4,0.5,-69.2,-16.5,-60.9,-29.4C-52.5,-42.3,-39.1,-51,-25.4,-58.5C-11.6,-66,2.5,-72.4,16.7,-72.6C30.9,-72.8,32.7,-74.3,44.4,-66.2Z",
              "M37.6,-58.9C49.2,-52.2,59.6,-42.6,64.6,-30.5C69.6,-18.4,69.2,-3.9,66.4,9.7C63.5,23.3,58.2,36,49.1,46.2C40,56.4,27.1,64,12.7,68.2C-1.6,72.4,-17.4,73.2,-31.1,67.7C-44.7,62.1,-56.3,50.2,-63.9,36C-71.4,21.7,-74.9,5.1,-72,-10C-69.1,-25.1,-59.8,-38.7,-47.7,-46.1C-35.5,-53.5,-20.5,-54.7,-6.6,-50.7C7.3,-46.6,26,-65.6,37.6,-58.9Z",
              "M44.4,-66.2C56.1,-58.1,62.6,-42.3,67.4,-26.7C72.2,-11,75.3,4.5,71.4,18.3C67.4,32.2,56.5,44.5,43.4,53.8C30.4,63.1,15.2,69.4,-0.8,70.5C-16.8,71.7,-33.6,67.7,-46.2,58C-58.8,48.3,-67.2,32.9,-69.8,16.7C-72.4,0.5,-69.2,-16.5,-60.9,-29.4C-52.5,-42.3,-39.1,-51,-25.4,-58.5C-11.6,-66,2.5,-72.4,16.7,-72.6C30.9,-72.8,32.7,-74.3,44.4,-66.2Z",
            ],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          transform="translate(100 100)"
        />
      </svg>

      {/* Morphing SVG blob 2 */}
      <svg className="absolute -bottom-40 right-[-8rem] h-[40rem] w-[40rem] blur-3xl opacity-55" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="blob-b" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--blob-b-from)" />
            <stop offset="100%" stopColor="var(--blob-b-to)" />
          </linearGradient>
        </defs>
        <motion.path
          fill="url(#blob-b)"
          animate={{
            d: [
              "M52.1,-71.8C66.3,-62.1,75.2,-44.7,77.7,-27.3C80.2,-9.9,76.4,7.6,69.1,22.8C61.9,38,51.3,50.9,37.7,59.3C24.2,67.7,7.7,71.6,-9,72.6C-25.7,73.6,-42.6,71.7,-54.9,62.3C-67.3,52.9,-75,36,-78.2,18.5C-81.5,1,-80.2,-17.1,-71.5,-30.6C-62.8,-44,-46.7,-53,-31.4,-62.5C-16.1,-72,1.4,-82,17.9,-82.1C34.4,-82.1,37.9,-81.4,52.1,-71.8Z",
              "M39.8,-58.6C52,-50.7,62.9,-40.3,68.2,-27.3C73.5,-14.3,73.1,1.4,68.6,15.5C64,29.6,55.2,42.1,43.7,52.1C32.2,62.1,18,69.6,2.6,66.6C-12.9,63.7,-29.5,50.3,-43.4,37.4C-57.3,24.5,-68.5,12.2,-71.4,-1.7C-74.3,-15.6,-68.9,-31.2,-58.6,-40.7C-48.4,-50.3,-33.4,-53.8,-19.7,-58.7C-6,-63.6,6.4,-69.9,21,-69.7C35.6,-69.5,52.4,-62.9,39.8,-58.6Z",
              "M52.1,-71.8C66.3,-62.1,75.2,-44.7,77.7,-27.3C80.2,-9.9,76.4,7.6,69.1,22.8C61.9,38,51.3,50.9,37.7,59.3C24.2,67.7,7.7,71.6,-9,72.6C-25.7,73.6,-42.6,71.7,-54.9,62.3C-67.3,52.9,-75,36,-78.2,18.5C-81.5,1,-80.2,-17.1,-71.5,-30.6C-62.8,-44,-46.7,-53,-31.4,-62.5C-16.1,-72,1.4,-82,17.9,-82.1C34.4,-82.1,37.9,-81.4,52.1,-71.8Z",
            ],
          }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          transform="translate(100 100)"
        />
      </svg>

      {/* Fine grain dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(var(--dot-grid-color) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      {/* Soft noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  );
}
