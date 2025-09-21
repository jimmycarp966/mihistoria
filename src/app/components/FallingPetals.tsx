'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Petal {
  id: number;
  x: number;
  delay: number;
  duration: number;
}

const FallingPetals = () => {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    // Crear 20 pétalos con posiciones y delays aleatorios
    const newPetals = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // Posición horizontal aleatoria
      delay: Math.random() * 3, // Delay aleatorio más amplio
      duration: 10 + Math.random() * 6 // Duración entre 10-16 segundos
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          initial={{
            x: `${petal.x}vw`,
            y: '-10vh',
            rotate: 0,
            opacity: 0
          }}
          animate={{
            x: `${petal.x + (Math.random() - 0.5) * 20}vw`, // Movimiento lateral leve
            y: '110vh',
            rotate: 360,
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="absolute"
        >
          <div className="w-2 h-3 bg-yellow-400 rounded-full opacity-60" />
        </motion.div>
      ))}
    </div>
  );
};

export default FallingPetals;
