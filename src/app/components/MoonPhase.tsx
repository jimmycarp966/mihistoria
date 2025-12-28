'use client';

import { motion } from 'framer-motion';

interface MoonPhaseProps {
    phase: 'full' | 'waning' | 'quarter' | 'waxing' | 'new';
    size?: number;
}

const MoonPhase = ({ phase, size = 60 }: MoonPhaseProps) => {
    // Renderizado SVG para fases realistas
    const renderMoonSVG = () => {
        const commonClasses = "drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]";

        switch (phase) {
            case 'full':
                return (
                    <svg viewBox="0 0 100 100" className={`w-full h-full ${commonClasses}`}>
                        <circle cx="50" cy="50" r="45" fill="url(#moonGradient)" />
                        <defs>
                            <radialGradient id="moonGradient" cx="30%" cy="30%" r="70%">
                                <stop offset="0%" stopColor="#ffffff" />
                                <stop offset="50%" stopColor="#e8e8e8" />
                                <stop offset="100%" stopColor="#c0c0c0" />
                            </radialGradient>
                        </defs>
                    </svg>
                );
            case 'waning': // Gibosa Menguante (Casi llena, perdiendo un lado)
                return (
                    <svg viewBox="0 0 100 100" className={`w-full h-full ${commonClasses}`}>
                        <defs>
                            <radialGradient id="moonGradientWaning" cx="40%" cy="40%" r="70%">
                                <stop offset="0%" stopColor="#ffffff" />
                                <stop offset="100%" stopColor="#c0c0c0" />
                            </radialGradient>
                        </defs>
                        {/* Circulo base oscuro */}
                        <circle cx="50" cy="50" r="45" fill="#1a1a2e" opacity="0.5" />
                        {/* Clip para forma gibosa */}
                        <path d="M50 5 A 45 45 0 1 1 50 95 A 30 45 0 0 0 50 5" fill="url(#moonGradientWaning)" />
                    </svg>
                );
            case 'quarter': // Cuarto Menguante (Mitad exacta)
                return (
                    <svg viewBox="0 0 100 100" className={`w-full h-full ${commonClasses}`}>
                        <defs>
                            <linearGradient id="moonGradientQuarter" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#ffffff" />
                                <stop offset="100%" stopColor="#c0c0c0" />
                            </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="45" fill="#1a1a2e" opacity="0.3" />
                        <path d="M50 5 A 45 45 0 0 0 50 95 Z" fill="url(#moonGradientQuarter)" />
                    </svg>
                );
            case 'waxing': // Creciente (Uña fina) - Aunque la narrativa va a Nueva, el nombre es Creciente
                // Haremos una "C" fina
                return (
                    <svg viewBox="0 0 100 100" className={`w-full h-full ${commonClasses}`}>
                        <defs>
                            <radialGradient id="moonGradientWaxing" cx="20%" cy="50%" r="80%">
                                <stop offset="0%" stopColor="#ffffff" />
                                <stop offset="100%" stopColor="#c0c0c0" />
                            </radialGradient>
                        </defs>
                        <circle cx="50" cy="50" r="45" fill="transparent" />
                        {/* Path de uña */}
                        <path d="M50 5 A 45 45 0 0 0 50 95 A 35 45 0 0 1 50 5" fill="url(#moonGradientWaxing)" />
                    </svg>
                );
            case 'new':
                return (
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        <circle cx="50" cy="50" r="44" fill="#0d0d15" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                        <circle cx="50" cy="50" r="44" fill="url(#newMoonGlow)" opacity="0.5" />
                        <defs>
                            <radialGradient id="newMoonGlow">
                                <stop offset="80%" stopColor="transparent" />
                                <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
                            </radialGradient>
                        </defs>
                    </svg>
                );
        }
    };

    return (
        <motion.div
            className="rounded-full relative"
            style={{
                width: size,
                height: size,
            }}
            animate={{
                scale: [1, 1.05, 1],
            }}
            transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
        >
            {renderMoonSVG()}
        </motion.div>
    );
};

export default MoonPhase;
