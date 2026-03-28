import { motion } from "framer-motion";

interface CountdownOverlayProps {
  count: number;
}

export function CountdownOverlay({ count }: CountdownOverlayProps) {
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <motion.div
        key={count}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.5, opacity: 0 }}
        className="text-9xl font-bold text-red-500 drop-shadow-[0_0_20px_rgba(255,0,0,0.5)]"
      >
        {count}
      </motion.div>
    </div>
  );
}
