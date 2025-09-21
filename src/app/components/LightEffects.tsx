'use client';

import { motion } from 'framer-motion';

interface LightEffectsProps {
  isActive: boolean;
}

const LightEffects = ({ isActive }: LightEffectsProps) => {
  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Brillo sutil en esquinas */}
      <motion.div
        className="absolute top-10 left-10 w-32 h-32 bg-yellow-300/10 rounded-full blur-xl"
        animate={{
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-40 h-40 bg-yellow-200/8 rounded-full blur-2xl"
        animate={{
          opacity: [0.05, 0.2, 0.05],
          scale: [1.1, 0.9, 1.1]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Partículas de luz flotantes */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-yellow-400/60 rounded-full"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + i * 10}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.8
          }}
        />
      ))}
    </div>
  );
};

export default LightEffects;
